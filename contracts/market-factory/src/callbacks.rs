use near_sdk::{
    env, ext_contract, near_bindgen, serde_json::json, AccountId, Promise, PromiseResult,
};

use crate::consts::*;
use crate::storage::*;

#[ext_contract(ext_self)]
trait Callbacks {
    fn on_create_market_callback(
        &mut self,
        market_account_id: AccountId,
        collateral_token_account_id: AccountId,
    ) -> (AccountId, AccountId);
    fn on_ft_storage_deposit_callback(
        &mut self,
        market_account_id: AccountId,
    ) -> (AccountId, AccountId);
}

#[near_bindgen]
impl MarketFactory {
    #[private]
    pub fn on_create_market_callback(
        &mut self,
        market_account_id: AccountId,
        collateral_token_account_id: AccountId,
    ) -> (AccountId, AccountId) {
        match env::promise_result(0) {
            PromiseResult::Successful(_result) => {
                let storage_deposit_promise = Promise::new(collateral_token_account_id.clone())
                    .function_call(
                    "storage_deposit".to_string(),
                    json!({ "account_id": market_account_id.clone(), "registration_only": true })
                        .to_string()
                        .into_bytes(),
                    STORAGE_DEPOSIT_BOND,
                    GAS_FOR_FT_STORAGE_DEPOSIT,
                );

                let storage_deposit_callback_promise = ext_self::ext(env::current_account_id())
                    .with_attached_deposit(0)
                    .with_static_gas(GAS_FOR_FT_STORAGE_DEPOSIT_CALLBACK)
                    .on_ft_storage_deposit_callback(market_account_id.clone());

                storage_deposit_promise.then(storage_deposit_callback_promise);

                (market_account_id, collateral_token_account_id)
            }
            // @TODO return the attached deposit to the user
            _ => env::panic_str("ERR_ON_CREATE_MARKET_CALLBACK"),
        }
    }

    #[private]
    pub fn on_ft_storage_deposit_callback(&mut self, market_account_id: AccountId) -> bool {
        if env::promise_results_count() != 1 {
            env::panic_str("ERR_ON_FT_STORAGE_DEPOSIT_CALLBACK");
        }

        let is_storage_deposit_success = match env::promise_result(0) {
            PromiseResult::Successful(_result) => true,
            _ => env::panic_str("ERR_ON_FT_STORAGE_DEPOSIT_CALLBACK"),
        };

        if !is_storage_deposit_success {
            return false;
        }

        self.markets.push(&market_account_id);

        true
    }
}
