use anchor_lang::{
    prelude::*,
    solana_program::sysvar::{instructions::Instructions as SysInstructions, SysvarId},
    Accounts,
};
use anchor_spl::token::{Token, TokenAccount};

use crate::{
    check_refresh_ixs,
    lending_market::{lending_checks, refresh_reserve_interest, repay_obligation_liquidity},
    state::{obligation::Obligation, LendingMarket, Reserve},
    utils::repay_obligation_liquidity_transfer,
    xmsg, ReserveFarmKind,
};

pub fn process(ctx: Context<RepayObligationLiquidity>, liquidity_amount: u64) -> Result<()> {
    check_refresh_ixs!(ctx, repay_reserve, ReserveFarmKind::Debt);
    lending_checks::repay_obligation_liquidity_checks(&ctx)?;

    let clock = &Clock::get()?;

    let repay_reserve = &mut ctx.accounts.repay_reserve.load_mut()?;
    let obligation = &mut ctx.accounts.obligation.load_mut()?;
    let lending_market = &ctx.accounts.lending_market.load()?;

    refresh_reserve_interest(repay_reserve, clock.slot, lending_market.referral_fee_bps)?;
    let repay_amount = repay_obligation_liquidity(
        repay_reserve,
        obligation,
        clock,
        liquidity_amount,
        ctx.accounts.repay_reserve.key(),
    )?;

    xmsg!(
        "pnl: Repaying obligation liquidity {} liquidity_amount {}",
        repay_amount,
        liquidity_amount
    );

    repay_obligation_liquidity_transfer(
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.user_source_liquidity.to_account_info(),
        ctx.accounts.reserve_destination_liquidity.to_account_info(),
        ctx.accounts.owner.to_account_info(),
        repay_amount,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct RepayObligationLiquidity<'info> {
    pub owner: Signer<'info>,

    #[account(mut,
        has_one = lending_market
    )]
    pub obligation: AccountLoader<'info, Obligation>,

    pub lending_market: AccountLoader<'info, LendingMarket>,

    #[account(mut,
        has_one = lending_market
    )]
    pub repay_reserve: AccountLoader<'info, Reserve>,

    #[account(mut,
        address = repay_reserve.load()?.liquidity.supply_vault
    )]
    pub reserve_destination_liquidity: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        token::mint = repay_reserve.load()?.liquidity.mint_pubkey
    )]
    pub user_source_liquidity: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    #[account(address = SysInstructions::id())]
    /// CHECK:address checked
    pub instruction_sysvar_account: AccountInfo<'info>,
}
