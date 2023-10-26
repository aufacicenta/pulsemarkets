use near_sdk::collections::Vector;
use near_sdk::{
    collections::LookupMap, env, ext_contract, json_types::U128, log, near_bindgen, AccountId,
    Promise,
};
use num_format::ToFormattedString;
use shared::OutcomeId;
use std::default::Default;

use near_contract_standards::fungible_token::core::ext_ft_core;

use crate::consts::*;
use crate::storage::*;

#[ext_contract(ext_self)]
trait Callbacks {
    fn on_ft_transfer_callback(
        &mut self,
        amount_payable: WrappedBalance,
        outcome_id: OutcomeId,
    ) -> String;
    fn on_claim_fees_resolved_callback(&mut self, payee: AccountId) -> Option<Timestamp>;
    fn on_claim_balance_self_destruct_callback(
        &mut self,
        payee: AccountId,
        amount_payable: WrappedBalance,
    ) -> Option<Timestamp>;
}

#[ext_contract(ext_feed_parser)]
trait SwitchboardFeedParser {
    fn aggregator_read(&self, msg: String) -> Promise;
}

impl Default for Market {
    fn default() -> Self {
        env::panic_str("ERR_MARKET_NOT_INITIALIZED")
    }
}

#[near_bindgen]
impl Market {
    #[init]
    pub fn new(
        market: MarketData,
        management: Management,
        collateral_token: CollateralToken,
    ) -> Self {
        if env::state_exists() {
            env::panic_str("ERR_ALREADY_INITIALIZED");
        }

        let starts_at: Timestamp = env::block_timestamp().try_into().unwrap();
        let ends_at: Timestamp = starts_at + EVENT_PERIOD_NANOS;
        let reveal_window = ends_at + STAGE_PERIOD_NANOS;
        let resolution_window = reveal_window + STAGE_PERIOD_NANOS;

        // 7 days
        let self_destruct_window = resolution_window + 604_800_000_000_000;

        Self {
            market: MarketData {
                starts_at,
                ends_at,
                ..market
            },
            outcome_tokens: LookupMap::new(StorageKeys::OutcomeTokens),
            players: Vector::new(b"p"),
            resolution: Resolution {
                window: resolution_window,
                reveal_window,
                resolved_at: None,
                result: None,
            },
            fees: Fees {
                price: CREATE_OUTCOME_TOKEN_PRICE,
                fee_ratio: FEE_RATIO,
                claimed_at: None,
            },
            collateral_token: CollateralToken {
                balance: 0,
                fee_balance: 0,
                // @TODO collateral_token_decimals should be set by a cross-contract call to ft_metadata
                ..collateral_token
            },
            management: Management {
                self_destruct_window,
                buy_sell_threshold: BUY_SELL_THRESHOLD,
                ..management
            },
        }
    }

    #[private]
    #[payable]
    pub fn create_outcome_token(
        &mut self,
        sender_id: AccountId,
        amount: WrappedBalance,
        payload: CreateOutcomeTokenArgs,
    ) -> WrappedBalance {
        self.assert_is_open();
        self.assert_is_not_resolved();
        self.assert_price(amount);

        let outcome_id = sender_id;
        let prompt = payload.prompt;

        match self.outcome_tokens.get(&outcome_id) {
            Some(_token) => env::panic_str("ERR_CREATE_OUTCOME_TOKEN_outcome_id_EXIST"),
            None => {
                self.internal_create_outcome_token(outcome_id, prompt, amount);
            }
        }

        amount
    }

    #[payable]
    pub fn sell(&mut self) -> WrappedBalance {
        if self.is_expired_unresolved() {
            return self.internal_sell_unresolved();
        }

        self.assert_is_resolved();

        return self.internal_sell_resolved();
    }

    // During the resolution period, this method is called by the server (owner), setting the OutcomeTokenResult of each player
    pub fn reveal(
        &mut self,
        outcome_id: OutcomeId,
        result: OutcomeTokenResult,
        output_img_uri: String,
    ) {
        self.assert_only_owner();
        self.assert_is_reveal_window_open();
        self.assert_is_not_resolved();
        self.assert_is_valid_outcome(&outcome_id);
        self.assert_is_resolution_window_open();

        let mut outcome_token = self.outcome_tokens.get(&outcome_id).unwrap();
        outcome_token.set_result(result);
        outcome_token.set_output_img_uri(output_img_uri);

        self.outcome_tokens.insert(&outcome_id, &outcome_token);

        log!("reveal: outcome_id: {}, result: {}", outcome_id, result);
    }

    // Gets the players accounts,
    // gets their outcome token results if they revealed on time
    // sorts the results, closest to 0 is first, closest to 0 wins
    #[payable]
    pub fn resolve(&mut self) {
        self.assert_only_owner();
        self.assert_is_not_resolved();
        self.assert_is_resolution_window_open();

        if self.get_outcome_ids().is_empty() {
            self.resolution.resolved_at = Some(self.get_block_timestamp());
            log!("resolve, market ended with 0 participants");
            return;
        }

        let separator = "=".to_string();

        let mut results: Vector<String> = Vector::new(b"r");

        for player in self.get_outcome_ids().clone() {
            let outcome_token = self.outcome_tokens.get(&player).unwrap();

            if outcome_token.result.is_none() {
                log!(
                    "resolve — PLAYER_DID_NOT_REVEAL — outcome_id: {}, result: {}",
                    outcome_token.outcome_id,
                    outcome_token.result.unwrap_or(0.0)
                );
            } else {
                let result_str = outcome_token.result.unwrap().to_string();

                results.push(&(player.to_string() + &separator + &result_str));
            }
        }

        log!("resolve, unsorted results: {:?}", results.to_vec());

        let mut sort = results.to_vec();
        sort.sort_by(|a, b| {
            let result_a = a.split(&separator).last().unwrap();
            let result_b = b.split(&separator).last().unwrap();

            return result_a.partial_cmp(result_b).unwrap();
        });

        log!("resolve, sorted results: {:?}", sort);

        // @TODO what happens if 2 or more players have exactly the same result?
        let winner = &sort[0];
        let result = winner.split(&separator).next().unwrap();

        log!("resolve, result: {}", result);

        self.internal_set_resolution_result(AccountId::new_unchecked(result.to_string()));
    }

    pub fn claim_fees(&mut self) {
        self.assert_is_resolution_window_expired();
        self.assert_fees_not_claimed();

        let payee = self.management.dao_account_id.clone();

        let amount_payable = self.collateral_token.fee_balance;

        if amount_payable == 0 {
            self.fees.claimed_at = Some(self.get_block_timestamp());
            env::panic_str("ERR_CLAIM_FEES_AMOUNT_PAYABLE_IS_ZERO");
        }

        let ft_transfer_promise = ext_ft_core::ext(self.collateral_token.id.clone())
            .with_attached_deposit(FT_TRANSFER_BOND)
            .with_static_gas(GAS_FT_TRANSFER)
            .ft_transfer(payee.clone(), U128::from(amount_payable), None);

        let ft_transfer_callback_promise = ext_self::ext(env::current_account_id())
            .with_attached_deposit(0)
            .with_static_gas(GAS_FT_TRANSFER_CALLBACK)
            .on_claim_fees_resolved_callback(payee);

        ft_transfer_promise.then(ft_transfer_callback_promise);
    }

    pub fn self_destruct(&mut self) {
        self.assert_only_owner();
        self.assert_is_resolution_window_expired();

        if !self.is_self_destruct_window_expired() {
            env::panic_str("ERR_SELF_DESTRUCT_WINDOW_NOT_EXPIRED");
        }

        if self.get_outcome_ids().is_empty() {
            env::panic_str("ERR_NO_OUTCOME_IDS");
        }

        if !self.fees.claimed_at.is_some()
        {
            env::panic_str("ERR_SELF_DESTRUCT_FEES_UNCLAIMED");
        }

        if self.collateral_token.fee_balance > 0 {
            env::panic_str("ERR_COLLATERAL_TOKEN_FEE_BALANCE_GREATER_THAN_ZERO");
        }

        let amount_payable = self.collateral_token.balance;

        if amount_payable == 0 {
            Promise::new(env::current_account_id())
                .delete_account(self.management.market_creator_account_id.clone());

            return;
        }

        let payee = self.management.dao_account_id.clone();

        let ft_transfer_promise = ext_ft_core::ext(self.collateral_token.id.clone())
            .with_attached_deposit(FT_TRANSFER_BOND)
            .with_static_gas(GAS_FT_TRANSFER)
            .ft_transfer(payee.clone(), U128::from(amount_payable), None);

        let ft_transfer_callback_promise = ext_self::ext(env::current_account_id())
            .with_attached_deposit(0)
            .with_static_gas(GAS_FT_TRANSFER_CALLBACK)
            .on_claim_balance_self_destruct_callback(payee, amount_payable);

        ft_transfer_promise.then(ft_transfer_callback_promise);
    }

    #[private]
    pub fn update_collateral_token_balance(&mut self, amount: WrappedBalance) -> WrappedBalance {
        self.collateral_token.balance = amount;

        log!(
            "update_collateral_token_balance: {}",
            amount.to_formatted_string(&FORMATTED_STRING_LOCALE)
        );

        self.collateral_token.balance
    }

    #[private]
    pub fn update_collateral_token_fee_balance(
        &mut self,
        amount: WrappedBalance,
    ) -> WrappedBalance {
        self.collateral_token.fee_balance += amount;

        log!(
            "update_collateral_token_fee_balance, in: {}, total: {}",
            amount.to_formatted_string(&FORMATTED_STRING_LOCALE),
            self.collateral_token
                .fee_balance
                .to_formatted_string(&FORMATTED_STRING_LOCALE)
        );

        self.collateral_token.fee_balance
    }
}

impl Market {
    // Mint a new token for the player
    fn internal_create_outcome_token(
        &mut self,
        outcome_id: OutcomeId,
        prompt: String,
        amount: WrappedBalance,
    ) -> WrappedBalance {
        let (amount_mintable, fee) = self.get_amount_mintable(amount);

        let outcome_token = OutcomeToken::new(&outcome_id, prompt, amount_mintable);

        self.players.push(&outcome_id);

        self.outcome_tokens.insert(&outcome_id, &outcome_token);

        self.update_collateral_token_balance(self.collateral_token.balance + amount_mintable);
        self.update_collateral_token_fee_balance(fee);

        self.outcome_tokens.insert(&outcome_id, &outcome_token);

        log!("CREATE_OUTCOME_TOKEN amount: {}, fee_ratio: {}, fee_result: {}, outcome_id: {}, sender_id: {}, ot_supply: {}, amount_mintable: {}, ct_balance: {}, fee_balance: {}",
            amount.to_formatted_string(&FORMATTED_STRING_LOCALE),
            self.fees.fee_ratio.to_formatted_string(&FORMATTED_STRING_LOCALE),
            fee.to_formatted_string(&FORMATTED_STRING_LOCALE),
            outcome_token.outcome_id,
            outcome_id,
            outcome_token.total_supply().to_formatted_string(&FORMATTED_STRING_LOCALE),
            amount_mintable.to_formatted_string(&FORMATTED_STRING_LOCALE),
            self.collateral_token.balance.to_formatted_string(&FORMATTED_STRING_LOCALE),
            self.collateral_token.fee_balance.to_formatted_string(&FORMATTED_STRING_LOCALE),
        );

        amount_mintable
    }

    fn internal_sell_unresolved(&mut self) -> WrappedBalance {
        let payee = env::signer_account_id();

        let (amount_payable, _weight) = self.get_amount_payable_unresolved(payee.clone());

        self.internal_transfer(payee, amount_payable)
    }

    fn internal_sell_resolved(&mut self) -> WrappedBalance {
        let payee = self.resolution.result.clone().unwrap();

        self.assert_is_winner(&payee);

        let (amount_payable, _weight) = self.get_amount_payable_resolved();

        self.internal_transfer(payee, amount_payable)
    }

    fn internal_transfer(
        &mut self,
        payee: AccountId,
        amount_payable: WrappedBalance,
    ) -> WrappedBalance {
        if amount_payable <= 0 {
            env::panic_str("ERR_CANT_SELL_A_LOSING_OUTCOME");
        }

        let outcome_token = self.get_outcome_token(&payee);

        log!(
            "TRANSFER amount: {},  account_id: {}, supply: {}, is_resolved: {}, ct_balance: {}, amount_payable: {}",
            amount_payable.to_formatted_string(&FORMATTED_STRING_LOCALE),
            payee,
            outcome_token.total_supply().to_formatted_string(&FORMATTED_STRING_LOCALE),
            self.is_resolved(),
            self.collateral_token.balance.to_formatted_string(&FORMATTED_STRING_LOCALE),
            amount_payable.to_formatted_string(&FORMATTED_STRING_LOCALE),
        );

        let ft_transfer_promise = ext_ft_core::ext(self.collateral_token.id.clone())
            .with_attached_deposit(FT_TRANSFER_BOND)
            .with_static_gas(GAS_FT_TRANSFER)
            .ft_transfer(payee.clone(), U128::from(amount_payable), None);

        let ft_transfer_callback_promise = ext_self::ext(env::current_account_id())
            .with_attached_deposit(0)
            .with_static_gas(GAS_FT_TRANSFER_CALLBACK)
            .on_ft_transfer_callback(amount_payable, outcome_token.outcome_id);

        ft_transfer_promise.then(ft_transfer_callback_promise);

        amount_payable
    }

    fn internal_set_resolution_result(&mut self, result: ResolutionResult) {
        self.resolution.result = Some(result);
        self.resolution.resolved_at = Some(self.get_block_timestamp());

        log!(
            "internal_set_resolution_result, result: {:?}",
            self.resolution.result.clone().unwrap()
        );
    }
}
