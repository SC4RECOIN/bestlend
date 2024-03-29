/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
/**
 * @category enums
 * @category generated
 */
export enum UpdateLendingMarketMode {
  UpdateOwner,
  UpdateEmergencyMode,
  UpdateLiquidationCloseFactor,
  UpdateLiquidationMaxValue,
  UpdateGlobalUnhealthyBorrow,
  UpdateGlobalAllowedBorrow,
  UpdateRiskCouncil,
  UpdateMinFullLiquidationThreshold,
  UpdateInsolvencyRiskLtv,
  UpdateElevationGroup,
  UpdateReferralFeeBps,
  UpdateMultiplierPoints,
  UpdatePriceRefreshTriggerToMaxAgePct,
  UpdateAutodeleverageEnabled,
}

/**
 * @category userTypes
 * @category generated
 */
export const updateLendingMarketModeBeet = beet.fixedScalarEnum(
  UpdateLendingMarketMode
) as beet.FixedSizeBeet<UpdateLendingMarketMode, UpdateLendingMarketMode>
