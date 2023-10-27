use near_sdk::{env, log, near_bindgen, AccountId, Promise, PromiseResult};
use num_format::ToFormattedString;
use shared::OutcomeId;

use crate::{storage::*, FORMATTED_STRING_LOCALE};

#[near_bindgen]
impl Market {
    #[private]
    pub fn on_ft_transfer_callback(
        &mut self,
        amount_payable: WrappedBalance,
        outcome_id: OutcomeId,
    ) -> String {
        match env::promise_result(0) {
            PromiseResult::Successful(_result) => {
                log!(
                    "on_ft_transfer_callback.amount_payable: {}",
                    amount_payable.to_formatted_string(&FORMATTED_STRING_LOCALE)
                );

                self.update_collateral_token_balance(
                    self.collateral_token.balance - amount_payable,
                );

                let mut outcome_token = self.get_outcome_token(&outcome_id);
                outcome_token.burn();

                self.outcome_tokens.insert(&outcome_id, &outcome_token);

                return amount_payable.to_string();
            }
            _ => env::panic_str("ERR_ON_FT_TRANSFER_CALLBACK"),
        }
    }

    #[private]
    pub fn on_claim_fees_resolved_callback(
        &mut self,
        payee: AccountId,
        amount_paid: WrappedBalance,
    ) -> Option<Timestamp> {
        match env::promise_result(0) {
            PromiseResult::Successful(_result) => {
                self.fees.claimed_at = Some(self.get_block_timestamp());
                self.collateral_token.fee_balance -= amount_paid;

                log!(
                    "on_claim_fees_resolved_callback; fees.claimed_at: {:?}, collateral_token.fee_balance: {}, paid_to: {}",
                    self.fees.claimed_at,
                    self.collateral_token.fee_balance,
                    payee
                );

                self.fees.claimed_at.unwrap()
            }
            // On error, the funds were transfered back to the sender
            _ => env::panic_str("ERR_ON_CLAIM_FEES_RESOLVED_CALLBACK"),
        };

        None
    }

    #[private]
    pub fn on_claim_balance_self_destruct_callback(
        &mut self,
        payee: AccountId,
        amount_payable: WrappedBalance,
    ) -> Option<Timestamp> {
        match env::promise_result(0) {
            PromiseResult::Successful(_result) => {
                log!(
                    "on_claim_balance_self_destruct_callback, payee: {}, amount_payable: {}",
                    payee,
                    amount_payable
                );

                Promise::new(env::current_account_id())
                    .delete_account(self.management.market_creator_account_id.clone());
            }
            _ => env::panic_str("ERR_ON_CLAIM_BALANCE_SELF_DESTRUCT_CALLBACK"),
        };

        None
    }
}
