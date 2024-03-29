use std::collections::HashSet;

use crate::{instruction::PostAction, instruction::PreAction};
use anchor_lang::{prelude::*, Discriminator};
use kamino_lending::instruction::RefreshObligation;
use rust_decimal::Decimal;
use solana_program::{
    pubkey,
    sysvar::instructions::{load_current_index_checked, load_instruction_at_checked},
};

use super::KLEND_PROGRAM_ID;
use crate::BestLendError;

const APPROVED_ACTION_PROGRAM_IDS: [Pubkey; 2] = [
    KLEND_PROGRAM_ID,                                        // klend
    pubkey!("FFCs7PxV93BsPUNQhspKkggWArSxo2Hhas4PU4xhBmh6"), // dummy swap
];

pub fn action_introspection_checks(instruction_sysvar_account_info: &AccountInfo) -> Result<()> {
    let ixs = instruction_sysvar_account_info;
    let current_index = load_current_index_checked(&ixs)? as usize;

    let approved_actions = HashSet::from(APPROVED_ACTION_PROGRAM_IDS);

    if current_index == 0 {
        return err!(BestLendError::MissingObligationRefresh);
    }

    // previous ix is an obligation refresh
    if let Ok(ix) = load_instruction_at_checked(current_index - 1, &ixs) {
        if ix.program_id != KLEND_PROGRAM_ID {
            return err!(BestLendError::MissingObligationRefresh);
        }

        let ix_discriminator: [u8; 8] = ix.data[0..8]
            .try_into()
            .map_err(|_| BestLendError::MissingObligationRefresh)?;

        if ix_discriminator != RefreshObligation::DISCRIMINATOR {
            return err!(BestLendError::MissingObligationRefresh);
        }
    } else {
        return err!(BestLendError::MissingObligationRefresh);
    }

    let mut index = current_index + 1;
    let mut post_action_idx = 0;
    loop {
        if let Ok(ix) = load_instruction_at_checked(index, &ixs) {
            if ix.program_id == crate::id() {
                let ix_discriminator: [u8; 8] = ix.data[0..8]
                    .try_into()
                    .map_err(|_| BestLendError::InvalidInstruction)?;

                // the next bestlend ix should be postaction
                if ix_discriminator == PostAction::DISCRIMINATOR {
                    post_action_idx = index;
                }
            } else if !approved_actions.contains(&ix.program_id) {
                msg!("unapproved program ID: {}", &ix.program_id);
                return err!(BestLendError::UnapprovedProgramID);
            }
        } else {
            // postaction should be the last instruction
            if post_action_idx == 0 || post_action_idx != index - 1 {
                return err!(BestLendError::InvalidInstruction);
            }
            return Ok(());
        }

        index += 1;
    }
}

pub fn min_value_from_pre_action(instruction_sysvar_account_info: &AccountInfo) -> Result<Decimal> {
    let ixs = instruction_sysvar_account_info;
    let current_index = load_current_index_checked(&ixs)? as usize;

    let mut index = current_index - 1;
    loop {
        if let Ok(ix) = load_instruction_at_checked(index, &ixs) {
            if ix.program_id == crate::id() {
                let ix_discriminator: [u8; 8] = ix.data[0..8]
                    .try_into()
                    .map_err(|_| BestLendError::InvalidInstruction)?;

                if ix_discriminator == PreAction::DISCRIMINATOR {
                    let data = PreAction::try_from_slice(&ix.data[8..])?;
                    return Ok(Decimal::new(data.min_account_value, data.min_account_expo));
                }
            }
        } else {
            return err!(BestLendError::InvalidInstruction);
        }

        index -= 1;
    }
}

pub fn has_pre_action(instruction_sysvar_account_info: &AccountInfo) -> Result<()> {
    min_value_from_pre_action(instruction_sysvar_account_info)?;
    Ok(())
}
