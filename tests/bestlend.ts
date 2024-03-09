import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bestlend } from "../target/types/bestlend";
import { KaminoLending } from "../target/types/kamino_lending";
import { MockPyth } from "../target/types/mock_pyth";
import { DummySwap } from "../target/types/dummy_swap";
import { PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair, AccountMeta } from "@solana/web3.js";
import { BN } from "bn.js";
import { keys } from '../keys'
import { accountValueRemainingAccounts, lendingMarket, lendingMarketAuthority, reserveAccounts, reservePDAs, userPDAs } from "./accounts";
import { getReserveConfig } from "./configs";
import { airdrop, keyPairFromB58, mintToken } from "./utils";
import { PROGRAM_ID as KLEND_PROGRAM_ID, createRefreshObligationInstruction, createRefreshReserveInstruction } from "../clients/klend/src";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";
import { assert } from "chai";

const ASSETS = [
  "USDC", "USDT", "SOL", "JitoSOL", "mSOL", "bSOL"
]
const PRICES = [
  9998, 9977, 1267000, 1372000, 1471000, 1403000
]

describe("bestlend", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const { connection } = provider;
  const signer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Bestlend as Program<Bestlend>;
  const klend = anchor.workspace.KaminoLending as Program<KaminoLending>;
  const oracleProgram = anchor.workspace.MockPyth as Program<MockPyth>;
  const dummySwap = anchor.workspace.DummySwap as Program<DummySwap>;

  const [dummySwapPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_holder")],
    dummySwap.programId
  );

  const numReserves = ASSETS.length;
  const mints: PublicKey[] = [];
  const reserves: Keypair[] = [];
  const oracles: Keypair[] = [];
  const users: Keypair[] = [];
  const performer = keyPairFromB58(keys.performer)

  before(async () => {
    for (let i = 0; i < numReserves; i++) {
      reserves.push(keyPairFromB58(keys.reserves[ASSETS[i]]));
      oracles.push(keyPairFromB58(keys.oracles[ASSETS[i]]));
      users.push(Keypair.generate());

      await airdrop(provider, users[i].publicKey);
      mints.push(await mintToken(connection, users[i], ASSETS[i], keyPairFromB58(keys.mints[ASSETS[i]]), [dummySwapPDA]));
    }

    await airdrop(provider, performer.publicKey);
  });

  describe("setup klend fork", async () => {
    it("updateOraclePrice", async () => {
      const promises = []
      for (let i = 0; i < numReserves; i++) {
        promises.push(oracleProgram.methods
          .writePythPrice(new BN(PRICES[i]), -4, new BN(1), new BN(1))
          .accounts({ target: oracles[i].publicKey, signer: signer.publicKey })
          .signers([signer.payer, oracles[i]])
          .rpc());
      }
      await Promise.all(promises)
    });

    it("initLendingMarket", async () => {
      const quoteCurrency = Array(32).fill(0);
      Buffer.from("USD").forEach((b, i) => (quoteCurrency[i] = b));

      const size = 4656 + 8;
      const minBalance = await connection.getMinimumBalanceForRentExemption(size);
      const createMarketAccountTx = SystemProgram.createAccount({
        fromPubkey: signer.publicKey,
        newAccountPubkey: lendingMarket.publicKey,
        lamports: minBalance,
        space: size,
        programId: klend.programId,
      });

      const tx = new Transaction().add(createMarketAccountTx);
      await sendAndConfirmTransaction(connection, tx, [
        signer.payer,
        lendingMarket,
      ]);

      await klend.methods
        .initLendingMarket(quoteCurrency)
        .accounts({
          lendingMarketOwner: signer.publicKey,
          lendingMarket: lendingMarket.publicKey,
          lendingMarketAuthority,
        })
        .rpc();
    });

    it("initReserves", async () => {
      const size = 8616 + 8;
      const minBalance = await connection.getMinimumBalanceForRentExemption(
        size
      );

      const promises = []
      for (let i = 0; i < numReserves; i++) {
        const mint = mints[i];
        const reserve = reserves[i];

        const {
          feeReceiver,
          reserveLiquiditySupply,
          reserveCollateralMint,
          reserveCollateralSupply,
        } = reservePDAs(mint)

        const createReserveAccountTx = SystemProgram.createAccount({
          fromPubkey: signer.publicKey,
          newAccountPubkey: reserve.publicKey,
          lamports: minBalance,
          space: size,
          programId: klend.programId,
        });

        const send = async () => {
          const tx = new Transaction().add(createReserveAccountTx);
          await sendAndConfirmTransaction(connection, tx, [
            signer.payer,
            reserve,
          ]);

          await klend.methods
            .initReserve()
            .accounts({
              lendingMarketOwner: signer.publicKey,
              lendingMarket: lendingMarket.publicKey,
              lendingMarketAuthority,
              reserve: reserve.publicKey,
              reserveLiquidityMint: mint,
              feeReceiver,
              reserveLiquiditySupply,
              reserveCollateralMint,
              reserveCollateralSupply,
            })
            .rpc();
        }
        promises.push(send())
      }
      await Promise.all(promises)
    });

    it("updateReserveConfigs", async () => {
      const promises = []
      for (let i = 0; i < numReserves; i++) {
        const reserve = reserves[i];
        const configBytes = getReserveConfig(oracles[i].publicKey, ASSETS[i], PRICES[i], 4)

        promises.push(
          klend.methods
            .updateEntireReserveConfig(new BN(25), configBytes)
            .accounts({
              lendingMarketOwner: signer.publicKey,
              lendingMarket: lendingMarket.publicKey,
              reserve: reserve.publicKey,
            })
            .rpc()
        );
      }
      await Promise.all(promises)
    });
  })

  describe("bestlend", async () => {
    it("init account", async () => {
      const promises = []
      for (let i = 0; i < users.length; i++) {
        const user = users[i]

        const {
          bestlendUserAccount,
          userMetadata,
          obligation
        } = userPDAs(user.publicKey)

        const send = async () => {
          await program.methods.initAccount(0, 1)
            .accounts({
              owner: user.publicKey,
              bestlendUserAccount,
            })
            .signers([user])
            .rpc();

          await program.methods.initKlendAccount()
            .accounts({
              owner: user.publicKey,
              bestlendUserAccount,
              obligation,
              lendingMarket: lendingMarket.publicKey,
              seed1Account: PublicKey.default,
              seed2Account: PublicKey.default,
              userMetadata: userMetadata,
              klendProgram: KLEND_PROGRAM_ID
            })
            .signers([user])
            .rpc();
        }
        promises.push(send())
      }
      await Promise.all(promises)
    });

    it("deposit every asset", async () => {
      const promises = []

      // get every user to deposit so each coin can be borrowed
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const reserveKey = reserves[i]
        const oracle = oracles[i]

        const {
          bestlendUserAccount,
          reserve,
          collateralAta,
          liquidityAta,
          userLiquidityAta,
          obligation
        } = await reserveAccounts(connection, user, reserveKey.publicKey);

        const tx = new Transaction()

        tx.add(
          createRefreshReserveInstruction({
            reserve: reserveKey.publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracle.publicKey,
          })
        );

        tx.add(
          createRefreshObligationInstruction({
            lendingMarket: lendingMarket.publicKey,
            obligation,
          })
        );

        tx.add(
          await program.methods
            .klendDeposit(new BN(5e9))
            .accounts({
              signer: user.publicKey,
              bestlendUserAccount,
              obligation,
              klendProgram: KLEND_PROGRAM_ID,
              lendingMarket: lendingMarket.publicKey,
              lendingMarketAuthority,
              reserve: reserveKey.publicKey,
              reserveLiquiditySupply: reserve.liquidity.supplyVault,
              reserveCollateralMint: reserve.collateral.mintPubkey,
              reserveDestinationDepositCollateral:
                reserve.collateral.supplyVault,
              userSourceLiquidity: userLiquidityAta.address,
              bestlendUserSourceLiquidity: liquidityAta.address,
              userDestinationCollateral: collateralAta.address,
              instructionSysvarAccount: new PublicKey(
                "Sysvar1nstructions1111111111111111111111111"
              ),
            })
            .signers([user])
            .instruction()
        );

        promises.push(sendAndConfirmTransaction(connection, tx, [user], { skipPreflight: true }));
      }

      await Promise.all(promises)
    })

    it("withdraw", async () => {
      const user = users[0]
      const reserveKey = reserves[0]
      const oracle = oracles[0]

      const {
        bestlendUserAccount,
        reserve,
        collateralAta,
        liquidityAta,
        userLiquidityAta,
        obligation
      } = await reserveAccounts(connection, user, reserveKey.publicKey);

      const tx = new Transaction()

      tx.add(
        createRefreshReserveInstruction({
          reserve: reserveKey.publicKey,
          lendingMarket: lendingMarket.publicKey,
          pythOracle: oracle.publicKey,
        })
      );

      tx.add(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [{
            pubkey: reserveKey.publicKey, isSigner: false, isWritable: false
          }]
        })
      );

      tx.add(
        await program.methods
          .klendWithdraw(new BN(1e8))
          .accounts({
            signer: user.publicKey,
            bestlendUserAccount,
            obligation,
            klendProgram: KLEND_PROGRAM_ID,
            lendingMarket: lendingMarket.publicKey,
            lendingMarketAuthority,
            reserve: reserveKey.publicKey,
            reserveLiquiditySupply: reserve.liquidity.supplyVault,
            reserveCollateralMint: reserve.collateral.mintPubkey,
            reserveSourceDepositCollateral:
              reserve.collateral.supplyVault,
            userDestinationLiquidity: userLiquidityAta.address,
            userDestinationCollateral: collateralAta.address,
            instructions: new PublicKey(
              "Sysvar1nstructions1111111111111111111111111"
            ),
          })
          .signers([user])
          .instruction()
      );

      await sendAndConfirmTransaction(connection, tx, [user], { skipPreflight: true });
    })

    it("borrow", async () => {
      const user = users[0]
      const reserveKey = reserves[0]
      const borrowReserveKey = reserves[1]

      const {
        bestlendUserAccount,
        reserve,
        userLiquidityAta,
        obligation
      } = await reserveAccounts(connection, user, borrowReserveKey.publicKey);

      const tx = new Transaction()

      for (let i = 0; i < 2; i++) {
        tx.add(
          createRefreshReserveInstruction({
            reserve: reserves[i].publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracles[i].publicKey,
          })
        );
      }

      tx.add(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [{
            pubkey: reserveKey.publicKey, isSigner: false, isWritable: false
          }]
        })
      );

      tx.add(
        await program.methods
          .klendBorrow(new BN(1e8))
          .accounts({
            signer: user.publicKey,
            bestlendUserAccount,
            obligation,
            klendProgram: KLEND_PROGRAM_ID,
            lendingMarket: lendingMarket.publicKey,
            lendingMarketAuthority,
            reserve: borrowReserveKey.publicKey,
            reserveSourceLiquidity: reserve.liquidity.supplyVault,
            borrowReserveLiquidityFeeReceiver: reserve.liquidity.feeVault,
            userDestinationLiquidity: userLiquidityAta.address,
            instructions: new PublicKey(
              "Sysvar1nstructions1111111111111111111111111"
            ),
          })
          .signers([user])
          .instruction()
      );

      await sendAndConfirmTransaction(connection, tx, [user], { skipPreflight: true });
    })

    it("repay", async () => {
      const user = users[0]
      const reserveKey = reserves[0]
      const borrowReserveKey = reserves[1]

      const {
        bestlendUserAccount,
        reserve,
        liquidityAta,
        userLiquidityAta,
        obligation
      } = await reserveAccounts(connection, user, borrowReserveKey.publicKey);

      const tx = new Transaction()

      for (let i = 0; i < 2; i++) {
        tx.add(
          createRefreshReserveInstruction({
            reserve: reserves[i].publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracles[i].publicKey,
          })
        );
      }

      tx.add(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [
            { pubkey: reserveKey.publicKey, isSigner: false, isWritable: false },
            { pubkey: borrowReserveKey.publicKey, isSigner: false, isWritable: false },
          ]
        })
      );

      tx.add(
        await program.methods
          .klendRepay(new BN(1e2))
          .accounts({
            signer: user.publicKey,
            bestlendUserAccount,
            obligation,
            klendProgram: KLEND_PROGRAM_ID,
            lendingMarket: lendingMarket.publicKey,
            reserve: borrowReserveKey.publicKey,
            reserveDestinationLiquidity: reserve.liquidity.supplyVault,
            userSourceLiquidity: userLiquidityAta.address,
            bestlendUserSourceLiquidity: liquidityAta.address,
            instructionSysvarAccount: new PublicKey(
              "Sysvar1nstructions1111111111111111111111111"
            ),
          })
          .signers([user])
          .instruction()
      );

      await sendAndConfirmTransaction(connection, tx, [user], { skipPreflight: true });
    })

    it("validate LTV", async () => {
      const user = users[0]
      const reserveKey = reserves[0]
      const borrowReserveKey = reserves[1]

      const tx = new Transaction()
      const { obligation } = await reserveAccounts(connection, user, borrowReserveKey.publicKey);

      for (let i = 0; i < 2; i++) {
        tx.add(
          createRefreshReserveInstruction({
            reserve: reserves[i].publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracles[i].publicKey,
          })
        );
      }

      tx.add(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [
            { pubkey: reserveKey.publicKey, isSigner: false, isWritable: false },
            { pubkey: borrowReserveKey.publicKey, isSigner: false, isWritable: false },
          ]
        })
      );

      await sendAndConfirmTransaction(connection, tx, [user], { skipPreflight: true });

      const market = await KaminoMarket.load(
        connection,
        lendingMarket.publicKey,
        KLEND_PROGRAM_ID,
      );

      const obl = await market.getObligationByAddress(obligation);

      const ltv = obl.loanToValue().toNumber()
      assert.equal(ltv.toFixed(2), "0.02")

      const depositValue = obl.getDepositedValue().toNumber()
      const borrowValue = obl.getBorrowedMarketValue().toNumber()
      assert.equal(depositValue.toFixed(2), "4899.02")
      assert.equal(borrowValue.toFixed(2), "99.77")
    })

    it("performer withdraw and deposit same", async () => {
      const {
        bestlendUserAccount,
        reserve,
        collateralAta,
        userLiquidityAta,
        obligation
      } = await reserveAccounts(connection, users[0], reserves[0].publicKey, performer);

      const valueRemainingAccounts = await accountValueRemainingAccounts(
        connection, performer, users[0].publicKey, mints, oracles.map(o => o.publicKey),
      )

      const tx = new Transaction()

      let refreshIxs = []
      for (let i = 0; i < 2; i++) {
        refreshIxs.push(
          createRefreshReserveInstruction({
            reserve: reserves[i].publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracles[i].publicKey,
          })
        );
      }

      refreshIxs.push(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [
            { pubkey: reserves[0].publicKey, isSigner: false, isWritable: false },
            { pubkey: reserves[1].publicKey, isSigner: false, isWritable: false },
          ]
        })
      );

      tx.add(...refreshIxs)

      /**
       * PRE ACTION
       */
      tx.add(
        await program.methods.preAction(new BN(479925), 2)
          .accounts({
            signer: performer.publicKey,
            bestlendUserAccount,
            klendObligation: obligation,
            instructions: new PublicKey(
              "Sysvar1nstructions1111111111111111111111111"
            ),
          })
          .remainingAccounts(valueRemainingAccounts)
          .instruction()
      )

      /**
       * REBALANCE
       */
      refreshIxs = []
      for (let i = 1; i >= 0; i--) {
        refreshIxs.push(
          createRefreshReserveInstruction({
            reserve: reserves[i].publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracles[i].publicKey,
          })
        );
      }

      refreshIxs.push(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [
            { pubkey: reserves[0].publicKey, isSigner: false, isWritable: false },
            { pubkey: reserves[1].publicKey, isSigner: false, isWritable: false },
          ]
        })
      );

      tx.add(...refreshIxs)

      tx.add(
        await program.methods
          .klendWithdraw(new BN(1e8))
          .accounts({
            signer: performer.publicKey,
            bestlendUserAccount,
            obligation,
            klendProgram: KLEND_PROGRAM_ID,
            lendingMarket: lendingMarket.publicKey,
            lendingMarketAuthority,
            reserve: reserves[0].publicKey,
            reserveLiquiditySupply: reserve.liquidity.supplyVault,
            reserveCollateralMint: reserve.collateral.mintPubkey,
            reserveSourceDepositCollateral:
              reserve.collateral.supplyVault,
            userDestinationLiquidity: userLiquidityAta.address,
            userDestinationCollateral: collateralAta.address,
            instructions: new PublicKey(
              "Sysvar1nstructions1111111111111111111111111"
            ),
          })
          .instruction()
      );

      refreshIxs = []
      for (let i = 1; i >= 0; i--) {
        refreshIxs.push(
          createRefreshReserveInstruction({
            reserve: reserves[i].publicKey,
            lendingMarket: lendingMarket.publicKey,
            pythOracle: oracles[i].publicKey,
          })
        );
      }

      refreshIxs.push(
        createRefreshObligationInstruction({
          lendingMarket: lendingMarket.publicKey,
          obligation,
          anchorRemainingAccounts: [
            { pubkey: reserves[0].publicKey, isSigner: false, isWritable: false },
            { pubkey: reserves[1].publicKey, isSigner: false, isWritable: false },
          ]
        })
      );

      tx.add(...refreshIxs)

      /**
       * POST ACTION
       */
      tx.add(
        await program.methods.postAction()
          .accounts({
            signer: performer.publicKey,
            bestlendUserAccount,
            klendObligation: obligation,
            instructions: new PublicKey(
              "Sysvar1nstructions1111111111111111111111111"
            ),
          })
          .remainingAccounts(valueRemainingAccounts)
          .instruction()
      )

      await sendAndConfirmTransaction(connection, tx, [performer], { skipPreflight: true });
    })
  });
});
