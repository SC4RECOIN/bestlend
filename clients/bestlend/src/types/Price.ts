/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type Price = {
  value: beet.bignum
  expo: beet.bignum
}

/**
 * @category userTypes
 * @category generated
 */
export const priceBeet = new beet.BeetArgsStruct<Price>(
  [
    ['value', beet.i64],
    ['expo', beet.i64],
  ],
  'Price'
)