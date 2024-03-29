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
 * @category InitObligationFarmsForReserve
 * @category generated
 */
export type InitObligationFarmsForReserveInstructionArgs = {
  mode: number
}
/**
 * @category Instructions
 * @category InitObligationFarmsForReserve
 * @category generated
 */
export const initObligationFarmsForReserveStruct = new beet.BeetArgsStruct<
  InitObligationFarmsForReserveInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['mode', beet.u8],
  ],
  'InitObligationFarmsForReserveInstructionArgs'
)
/**
 * Accounts required by the _initObligationFarmsForReserve_ instruction
 *
 * @property [_writable_, **signer**] payer
 * @property [] owner
 * @property [_writable_] obligation
 * @property [_writable_] lendingMarketAuthority
 * @property [_writable_] reserve
 * @property [_writable_] reserveFarmState
 * @property [_writable_] obligationFarm
 * @property [] lendingMarket
 * @property [] farmsProgram
 * @category Instructions
 * @category InitObligationFarmsForReserve
 * @category generated
 */
export type InitObligationFarmsForReserveInstructionAccounts = {
  payer: web3.PublicKey
  owner: web3.PublicKey
  obligation: web3.PublicKey
  lendingMarketAuthority: web3.PublicKey
  reserve: web3.PublicKey
  reserveFarmState: web3.PublicKey
  obligationFarm: web3.PublicKey
  lendingMarket: web3.PublicKey
  farmsProgram: web3.PublicKey
  rent?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initObligationFarmsForReserveInstructionDiscriminator = [
  136, 63, 15, 186, 211, 152, 168, 164,
]

/**
 * Creates a _InitObligationFarmsForReserve_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitObligationFarmsForReserve
 * @category generated
 */
export function createInitObligationFarmsForReserveInstruction(
  accounts: InitObligationFarmsForReserveInstructionAccounts,
  args: InitObligationFarmsForReserveInstructionArgs,
  programId = new web3.PublicKey('HUHJsverovPJN3sVtv8J8D48fKzeajRtz3Ga4Zmh4RLA')
) {
  const [data] = initObligationFarmsForReserveStruct.serialize({
    instructionDiscriminator:
      initObligationFarmsForReserveInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.owner,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.obligation,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lendingMarketAuthority,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.reserve,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.reserveFarmState,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.obligationFarm,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lendingMarket,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.farmsProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
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
