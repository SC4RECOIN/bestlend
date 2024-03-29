/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category BorrowObligationLiquidity
 * @category generated
 */
export type BorrowObligationLiquidityInstructionArgs = {
  liquidityAmount: beet.bignum
}
/**
 * @category Instructions
 * @category BorrowObligationLiquidity
 * @category generated
 */
export const borrowObligationLiquidityStruct = new beet.BeetArgsStruct<
  BorrowObligationLiquidityInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['liquidityAmount', beet.u64],
  ],
  'BorrowObligationLiquidityInstructionArgs'
)
/**
 * Accounts required by the _borrowObligationLiquidity_ instruction
 *
 * @property [**signer**] owner
 * @property [_writable_] obligation
 * @property [] lendingMarket
 * @property [] lendingMarketAuthority
 * @property [_writable_] borrowReserve
 * @property [_writable_] reserveSourceLiquidity
 * @property [_writable_] borrowReserveLiquidityFeeReceiver
 * @property [_writable_] userDestinationLiquidity
 * @property [_writable_] referrerTokenState (optional)
 * @property [] instructionSysvarAccount
 * @category Instructions
 * @category BorrowObligationLiquidity
 * @category generated
 */
export type BorrowObligationLiquidityInstructionAccounts = {
  owner: web3.PublicKey
  obligation: web3.PublicKey
  lendingMarket: web3.PublicKey
  lendingMarketAuthority: web3.PublicKey
  borrowReserve: web3.PublicKey
  reserveSourceLiquidity: web3.PublicKey
  borrowReserveLiquidityFeeReceiver: web3.PublicKey
  userDestinationLiquidity: web3.PublicKey
  referrerTokenState?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionSysvarAccount: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const borrowObligationLiquidityInstructionDiscriminator = [
  121, 127, 18, 204, 73, 245, 225, 65,
]

/**
 * Creates a _BorrowObligationLiquidity_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category BorrowObligationLiquidity
 * @category generated
 */
export function createBorrowObligationLiquidityInstruction(
  accounts: BorrowObligationLiquidityInstructionAccounts,
  args: BorrowObligationLiquidityInstructionArgs,
  programId = new web3.PublicKey('HUHJsverovPJN3sVtv8J8D48fKzeajRtz3Ga4Zmh4RLA')
) {
  const [data] = borrowObligationLiquidityStruct.serialize({
    instructionDiscriminator: borrowObligationLiquidityInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.owner,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.obligation,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lendingMarket,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.lendingMarketAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.borrowReserve,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.reserveSourceLiquidity,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.borrowReserveLiquidityFeeReceiver,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.userDestinationLiquidity,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.referrerTokenState ?? programId,
      isWritable: accounts.referrerTokenState != null,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.instructionSysvarAccount,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
