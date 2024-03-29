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
 * @category Swap
 * @category generated
 */
export type SwapInstructionArgs = {
  inputAmout: beet.bignum
  outputAmout: beet.bignum
}
/**
 * @category Instructions
 * @category Swap
 * @category generated
 */
export const swapStruct = new beet.BeetArgsStruct<
  SwapInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['inputAmout', beet.u64],
    ['outputAmout', beet.u64],
  ],
  'SwapInstructionArgs'
)
/**
 * Accounts required by the _swap_ instruction
 *
 * @property [_writable_, **signer**] swapper
 * @property [_writable_] swapperInputToken
 * @property [_writable_] swapperOutputToken
 * @property [_writable_] tokenHolderPda
 * @property [_writable_] pdaInputToken
 * @property [_writable_] pdaOutputToken
 * @category Instructions
 * @category Swap
 * @category generated
 */
export type SwapInstructionAccounts = {
  swapper: web3.PublicKey
  swapperInputToken: web3.PublicKey
  swapperOutputToken: web3.PublicKey
  tokenHolderPda: web3.PublicKey
  pdaInputToken: web3.PublicKey
  pdaOutputToken: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const swapInstructionDiscriminator = [
  248, 198, 158, 145, 225, 117, 135, 200,
]

/**
 * Creates a _Swap_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Swap
 * @category generated
 */
export function createSwapInstruction(
  accounts: SwapInstructionAccounts,
  args: SwapInstructionArgs,
  programId = new web3.PublicKey('FFCs7PxV93BsPUNQhspKkggWArSxo2Hhas4PU4xhBmh6')
) {
  const [data] = swapStruct.serialize({
    instructionDiscriminator: swapInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.swapper,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.swapperInputToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.swapperOutputToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenHolderPda,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.pdaInputToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.pdaOutputToken,
      isWritable: true,
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
