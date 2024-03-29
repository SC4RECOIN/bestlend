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
 * @category InitFarmsForReserve
 * @category generated
 */
export type InitFarmsForReserveInstructionArgs = {
  mode: number
}
/**
 * @category Instructions
 * @category InitFarmsForReserve
 * @category generated
 */
export const initFarmsForReserveStruct = new beet.BeetArgsStruct<
  InitFarmsForReserveInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['mode', beet.u8],
  ],
  'InitFarmsForReserveInstructionArgs'
)
/**
 * Accounts required by the _initFarmsForReserve_ instruction
 *
 * @property [_writable_, **signer**] lendingMarketOwner
 * @property [] lendingMarket
 * @property [_writable_] lendingMarketAuthority
 * @property [_writable_] reserve
 * @property [] farmsProgram
 * @property [] farmsGlobalConfig
 * @property [_writable_] farmState
 * @property [] farmsVaultAuthority
 * @category Instructions
 * @category InitFarmsForReserve
 * @category generated
 */
export type InitFarmsForReserveInstructionAccounts = {
  lendingMarketOwner: web3.PublicKey
  lendingMarket: web3.PublicKey
  lendingMarketAuthority: web3.PublicKey
  reserve: web3.PublicKey
  farmsProgram: web3.PublicKey
  farmsGlobalConfig: web3.PublicKey
  farmState: web3.PublicKey
  farmsVaultAuthority: web3.PublicKey
  rent?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initFarmsForReserveInstructionDiscriminator = [
  218, 6, 62, 233, 1, 33, 232, 82,
]

/**
 * Creates a _InitFarmsForReserve_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitFarmsForReserve
 * @category generated
 */
export function createInitFarmsForReserveInstruction(
  accounts: InitFarmsForReserveInstructionAccounts,
  args: InitFarmsForReserveInstructionArgs,
  programId = new web3.PublicKey('HUHJsverovPJN3sVtv8J8D48fKzeajRtz3Ga4Zmh4RLA')
) {
  const [data] = initFarmsForReserveStruct.serialize({
    instructionDiscriminator: initFarmsForReserveInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.lendingMarketOwner,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.lendingMarket,
      isWritable: false,
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
      pubkey: accounts.farmsProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.farmsGlobalConfig,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.farmState,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.farmsVaultAuthority,
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
