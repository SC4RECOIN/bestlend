use anchor_lang::prelude::*;

declare_id!("9iUmehkCkXHmatHiRjKpXTsPDxNCLMfmtSzhJKm5h94z");

#[program]
pub mod bestlend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
