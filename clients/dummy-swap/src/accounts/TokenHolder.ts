/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link TokenHolder}
 * @category Accounts
 * @category generated
 */
export type TokenHolderArgs = {
  swapCount: beet.bignum
}

export const tokenHolderDiscriminator = [89, 232, 159, 243, 200, 197, 131, 192]
/**
 * Holds the data for the {@link TokenHolder} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class TokenHolder implements TokenHolderArgs {
  private constructor(readonly swapCount: beet.bignum) {}

  /**
   * Creates a {@link TokenHolder} instance from the provided args.
   */
  static fromArgs(args: TokenHolderArgs) {
    return new TokenHolder(args.swapCount)
  }

  /**
   * Deserializes the {@link TokenHolder} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [TokenHolder, number] {
    return TokenHolder.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link TokenHolder} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<TokenHolder> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find TokenHolder account at ${address}`)
    }
    return TokenHolder.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'FFCs7PxV93BsPUNQhspKkggWArSxo2Hhas4PU4xhBmh6'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, tokenHolderBeet)
  }

  /**
   * Deserializes the {@link TokenHolder} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [TokenHolder, number] {
    return tokenHolderBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link TokenHolder} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return tokenHolderBeet.serialize({
      accountDiscriminator: tokenHolderDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link TokenHolder}
   */
  static get byteSize() {
    return tokenHolderBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link TokenHolder} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      TokenHolder.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link TokenHolder} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === TokenHolder.byteSize
  }

  /**
   * Returns a readable version of {@link TokenHolder} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      swapCount: (() => {
        const x = <{ toNumber: () => number }>this.swapCount
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const tokenHolderBeet = new beet.BeetStruct<
  TokenHolder,
  TokenHolderArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['swapCount', beet.u64],
  ],
  TokenHolder.fromArgs,
  'TokenHolder'
)
