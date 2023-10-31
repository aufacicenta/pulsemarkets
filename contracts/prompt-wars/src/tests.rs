#[cfg(test)]
mod tests {
    use crate::{storage::*, FungibleTokenReceiver, CREATE_OUTCOME_TOKEN_PRICE};
    use chrono::{Duration, TimeZone, Utc};
    use near_sdk::json_types::U128;
    use near_sdk::serde_json::json;
    use near_sdk::test_utils::test_env::{alice, bob, carol};
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{testing_env, AccountId, PromiseResult};
    use shared::OutcomeId;

    fn dao_account_id() -> AccountId {
        AccountId::new_unchecked("dao_account_id.near".to_string())
    }

    fn collateral_token_id() -> AccountId {
        AccountId::new_unchecked("collateral_token_id.near".to_string())
    }

    fn market_creator_account_id() -> AccountId {
        AccountId::new_unchecked("market_creator_account_id.near".to_string())
    }

    fn block_timestamp(date: chrono::DateTime<chrono::Utc>) -> u64 {
        date.timestamp_nanos().try_into().unwrap()
    }

    fn setup_context() -> VMContextBuilder {
        let mut context = VMContextBuilder::new();
        let now = Utc::now().timestamp_subsec_nanos();
        testing_env!(context
            .predecessor_account_id(alice())
            .block_timestamp(now.try_into().unwrap())
            .build());

        context
    }

    fn setup_contract(market: MarketData) -> Market {
        let management = Management {
            dao_account_id: dao_account_id(),
            market_creator_account_id: market_creator_account_id(),
            self_destruct_window: 0,
            buy_sell_threshold: 0.0,
        };

        let collateral_token = CollateralToken {
            id: collateral_token_id(),
            balance: 0,
            decimals: 6,
            fee_balance: 0,
        };

        let contract = Market::new(market, management, collateral_token);

        contract
    }

    fn create_outcome_token(
        c: &mut Market,
        sender_id: AccountId,
        amount: WrappedBalance,
        payload: CreateOutcomeTokenArgs,
    ) {
        c.ft_on_transfer(
            sender_id,
            U128::from(amount),
            json!({ "CreateOutcomeTokenArgs": { "prompt": payload.prompt } }).to_string(),
        );
    }

    fn reveal(
        c: &mut Market,
        outcome_id: OutcomeId,
        result: OutcomeTokenResult,
        output_img_uri: String,
    ) {
        c.reveal(outcome_id, result, output_img_uri);
    }

    fn resolve(c: &mut Market) {
        c.resolve();
    }

    fn sell(c: &mut Market, context: &VMContextBuilder, payee: AccountId) -> WrappedBalance {
        let amount_sold = c.sell();

        testing_env!(
            context.build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(
                amount_sold.to_string().into_bytes()
            )],
        );

        let outcome_id = payee.clone();

        c.on_ft_transfer_callback(amount_sold, outcome_id);

        return amount_sold;
    }

    fn create_market_data() -> MarketData {
        MarketData {
            image_uri: "abcxyz".to_string(),
            starts_at: 0,
            ends_at: 0,
        }
    }

    #[test]
    fn should_create_outcome_token_for_players() {
        let mut context = setup_context();

        let now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        assert_eq!(
            contract.management.market_creator_account_id,
            market_creator_account_id()
        );

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        let outcome_token_1: OutcomeToken = contract.get_outcome_token(&player_1);

        assert_eq!(
            outcome_token_1.total_supply(),
            contract.collateral_token.balance
        );

        assert_eq!(
            outcome_token_1.get_balance_of(),
            contract.collateral_token.balance
        );

        assert_eq!(outcome_token_1.outcome_id(), player_1.clone());

        assert_eq!(
            contract.balance_of(&player_1),
            contract.collateral_token.balance
        );

        assert_eq!(outcome_token_1.get_prompt(), prompt);

        let player_2 = bob();

        create_outcome_token(
            &mut contract,
            player_2.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        let outcome_token_2: OutcomeToken = contract.get_outcome_token(&player_2);

        assert_eq!(
            outcome_token_2.total_supply(),
            contract.collateral_token.balance - outcome_token_1.total_supply()
        );

        assert_eq!(
            outcome_token_2.get_balance_of(),
            contract.collateral_token.balance - outcome_token_1.total_supply()
        );

        assert_eq!(outcome_token_2.outcome_id(), player_2.clone());

        assert_eq!(
            contract.balance_of(&player_2),
            contract.collateral_token.balance - outcome_token_1.total_supply()
        );

        assert_eq!(outcome_token_2.get_prompt(), prompt);

        // Check timestamps and flags
        assert_eq!(contract.is_open(), true);
        assert_eq!(contract.is_expired_unresolved(), false);
        assert_eq!(contract.is_over(), false);
        assert_eq!(contract.is_resolution_window_expired(), false);
        assert_eq!(contract.is_resolved(), false);
        assert_eq!(contract.is_reveal_window_expired(), false);
    }

    #[test]
    fn sell_expired_unresolved() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());
        let starts_at = now + Duration::hours(1);
        let ends_at = starts_at + Duration::hours(1);

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();
        let player_2 = bob();
        let player_3 = carol();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        create_outcome_token(
            &mut contract,
            player_2.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        create_outcome_token(
            &mut contract,
            player_3.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        now = ends_at + Duration::hours(1);
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        // Check timestamps and flags
        assert_eq!(contract.is_open(), false);
        assert_eq!(contract.is_over(), true);
        assert_eq!(contract.is_reveal_window_expired(), true);
        assert_eq!(contract.is_expired_unresolved(), true);
        assert_eq!(contract.is_resolved(), false);
        assert_eq!(contract.is_resolution_window_expired(), true);

        testing_env!(context.signer_account_id(player_1.clone()).build());

        sell(&mut contract, &context, player_1.clone());

        let outcome_token_1: OutcomeToken = contract.get_outcome_token(&player_1);
        assert_eq!(outcome_token_1.total_supply(), 0);
        assert_eq!(contract.balance_of(&player_1), 0);

        testing_env!(context.signer_account_id(player_2.clone()).build());

        sell(&mut contract, &context, player_2.clone());

        let outcome_token_2: OutcomeToken = contract.get_outcome_token(&player_2);
        assert_eq!(outcome_token_2.total_supply(), 0);
        assert_eq!(contract.balance_of(&player_2), 0);

        testing_env!(context.signer_account_id(player_3.clone()).build());

        sell(&mut contract, &context, player_3.clone());

        let outcome_token_2: OutcomeToken = contract.get_outcome_token(&player_3);
        assert_eq!(outcome_token_2.total_supply(), 0);
        assert_eq!(contract.balance_of(&player_3), 0);

        assert_eq!(contract.collateral_token.balance, 0);
        assert_eq!(contract.collateral_token.fee_balance, 6000);
    }

    #[test]
    fn sell_resolved() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();
        let player_2 = bob();
        let player_3 = carol();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        create_outcome_token(
            &mut contract,
            player_2.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        create_outcome_token(
            &mut contract,
            player_3.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        // now is between the reveal period
        now = Utc.timestamp_nanos(contract.get_market_data().ends_at) + Duration::minutes(2);
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        // Check timestamps and flags
        assert_eq!(contract.is_open(), false);
        assert_eq!(contract.is_over(), true);
        assert_eq!(contract.is_reveal_window_expired(), false);
        assert_eq!(contract.is_expired_unresolved(), false);
        assert_eq!(contract.is_resolved(), false);
        assert_eq!(contract.is_resolution_window_expired(), false);

        testing_env!(context
            .signer_account_id(market_creator_account_id())
            .build());

        let mut outcome_id = alice();
        let mut result = 0.3;
        let output_img_uri = "".to_string();

        reveal(&mut contract, outcome_id, result, output_img_uri.clone());

        let outcome_token_1: OutcomeToken = contract.get_outcome_token(&player_1);
        assert_eq!(outcome_token_1.get_result(), Some(result));
        assert_eq!(
            outcome_token_1.get_output_img_uri(),
            Some(output_img_uri.clone())
        );

        outcome_id = bob();
        result = 0.2;

        reveal(&mut contract, outcome_id, result, output_img_uri.clone());

        let outcome_token_2: OutcomeToken = contract.get_outcome_token(&player_2);
        assert_eq!(outcome_token_2.get_result(), Some(result));
        assert_eq!(
            outcome_token_2.get_output_img_uri(),
            Some(output_img_uri.clone())
        );

        outcome_id = carol();
        result = 0.1;

        reveal(&mut contract, outcome_id, result, output_img_uri.clone());

        let outcome_token_3: OutcomeToken = contract.get_outcome_token(&player_3);
        assert_eq!(outcome_token_3.get_result(), Some(result));
        assert_eq!(
            outcome_token_3.get_output_img_uri(),
            Some(output_img_uri.clone())
        );

        resolve(&mut contract);

        contract.get_outcome_ids();

        assert_eq!(contract.is_resolved(), true);

        testing_env!(context.signer_account_id(player_3.clone()).build());

        sell(&mut contract, &context, player_3.clone());

        assert_eq!(contract.collateral_token.balance, 0);
        assert_eq!(contract.collateral_token.fee_balance, 6000);

        // now is after the resolution window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::minutes(2);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        contract.claim_fees();

        contract.on_claim_fees_resolved_callback(
            contract.management.dao_account_id.clone(),
            contract.collateral_token.fee_balance,
        );

        assert_eq!(contract.get_fee_data().claimed_at.is_some(), true);

        // now is after the self_destruct window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::days(8);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        contract.self_destruct();
        contract.on_claim_balance_self_destruct_callback(
            contract.get_management_data().dao_account_id,
            contract.get_collateral_token_metadata().balance,
        );
    }

    #[test]
    fn self_destruct_resolved_no_players() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        testing_env!(context
            .signer_account_id(market_creator_account_id())
            .build());

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        let output_img_uri = "".to_string();

        reveal(&mut contract, player_1.clone(), 0.3, output_img_uri.clone());

        resolve(&mut contract);

        // now is after the resolution window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::minutes(2);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        // Check timestamps and flags
        assert_eq!(contract.is_open(), false);
        assert_eq!(contract.is_over(), true);
        assert_eq!(contract.is_reveal_window_expired(), true);
        assert_eq!(contract.is_resolution_window_expired(), true);
        assert_eq!(contract.is_expired_unresolved(), false);
        assert_eq!(contract.is_resolved(), true);

        assert_eq!(contract.get_resolution_data().resolved_at.is_some(), true);
        assert_eq!(contract.get_fee_data().claimed_at.is_some(), false);

        contract.claim_fees();

        contract.on_claim_fees_resolved_callback(
            contract.management.dao_account_id.clone(),
            contract.collateral_token.fee_balance,
        );

        assert_eq!(contract.get_fee_data().claimed_at.is_some(), true);

        // now is after the self_destruct window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::days(8);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        contract.self_destruct();
        contract.on_claim_balance_self_destruct_callback(
            contract.get_management_data().dao_account_id,
            contract.get_collateral_token_metadata().balance,
        );
    }

    #[test]
    #[should_panic(expected = "ERR_CLAIM_FEES_AMOUNT_PAYABLE_IS_ZERO")]
    fn err_claim_fees_zero_balance() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        testing_env!(context
            .signer_account_id(market_creator_account_id())
            .build());

        resolve(&mut contract);

        // now is after the resolution window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::minutes(2);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        // Check timestamps and flags
        assert_eq!(contract.is_open(), false);
        assert_eq!(contract.is_over(), true);
        assert_eq!(contract.is_reveal_window_expired(), true);
        assert_eq!(contract.is_expired_unresolved(), true);
        assert_eq!(contract.is_resolved(), false);
        assert_eq!(contract.is_resolution_window_expired(), true);

        assert_eq!(contract.get_resolution_data().resolved_at.is_some(), true);
        assert_eq!(contract.get_fee_data().claimed_at.is_some(), false);
        assert_eq!(contract.get_collateral_token_metadata().fee_balance, 0);

        contract.claim_fees();
    }

    #[test]
    #[should_panic(expected = "ERR_SELF_DESTRUCT_FEES_UNCLAIMED")]
    fn err_self_destruct_unresolved() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        // now is after the resolution window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::minutes(2);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        // Check timestamps and flags
        assert_eq!(contract.is_open(), false);
        assert_eq!(contract.is_over(), true);
        assert_eq!(contract.is_reveal_window_expired(), true);
        assert_eq!(contract.is_expired_unresolved(), true);
        assert_eq!(contract.is_resolved(), false);
        assert_eq!(contract.is_resolution_window_expired(), true);

        assert_eq!(contract.get_fee_data().claimed_at.is_some(), false);

        // now is after the self_destruct window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::days(8);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        contract.self_destruct();
        contract.on_claim_balance_self_destruct_callback(
            contract.get_management_data().dao_account_id,
            contract.get_collateral_token_metadata().balance,
        );
    }

    #[test]
    #[should_panic(expected = "ERR_SELF_DESTRUCT_WINDOW_NOT_EXPIRED")]
    fn err_self_destruct_window_not_expired() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        // now is after the resolution window
        // called by owner
        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::minutes(2);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        // Check timestamps and flags
        assert_eq!(contract.is_open(), false);
        assert_eq!(contract.is_over(), true);
        assert_eq!(contract.is_reveal_window_expired(), true);
        assert_eq!(contract.is_expired_unresolved(), true);
        assert_eq!(contract.is_resolved(), false);
        assert_eq!(contract.is_resolution_window_expired(), true);

        assert_eq!(contract.get_fee_data().claimed_at.is_some(), false);

        contract.self_destruct();
    }

    #[test]
    #[should_panic(expected = "ERR_ASSERT_PRICE_TOO_LOW")]
    fn should_fail_on_create_outcome_token_for_player_when_amount_lt_price() {
        let mut context = setup_context();

        let now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        // Attempt to create an outcome token with an amount lower than CREATE_OUTCOME_TOKEN_PRICE
        let amount = CREATE_OUTCOME_TOKEN_PRICE - 1;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        contract.self_destruct();
    }

    #[test]
    #[should_panic(expected = "ERR_MARKET_IS_CLOSED")]
    fn should_fail_on_create_outcome_token_for_player_after_threshold() {
        let mut context = setup_context();

        let mut now = Utc::now();
        let starts_at = now + Duration::hours(1);
        let ends_at = starts_at + Duration::hours(1);

        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        now = ends_at + Duration::hours(1);
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        contract.self_destruct();
    }

    #[test]
    #[should_panic(expected = "ERR_MARKET_RESOLVED")]
    fn should_fail_on_create_outcome_token_for_player_when_resolved() {
        let mut context = setup_context();

        let now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let player_1 = alice();

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        testing_env!(context
            .signer_account_id(market_creator_account_id())
            .build());

        let outcome_id = alice();
        let result = 0.3;
        let output_img_uri = "".to_string();

        reveal(&mut contract, outcome_id, result, output_img_uri.clone());

        // Set the market as resolved
        resolve(&mut contract);

        assert_eq!(contract.is_resolved(), true);

        let player_2 = bob();

        testing_env!(context
            .block_timestamp(block_timestamp(now))
            .signer_account_id(player_2.clone())
            .build());

        // Attempt to create an outcome token for a player after the market is resolved
        create_outcome_token(
            &mut contract,
            player_2.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );
    }

    #[test]
    #[should_panic(expected = "ERR_SET_RESULT_ALREADY_SET")]
    fn should_fail_on_reveal_set_result() {
        let mut context = setup_context();

        let now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let player_1 = alice();

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        testing_env!(context
            .signer_account_id(market_creator_account_id())
            .build());

        let outcome_id = alice();
        let result = 0.3;
        let output_img_uri = "".to_string();

        reveal(
            &mut contract,
            outcome_id.clone(),
            result,
            output_img_uri.clone(),
        );

        // Attempt to reveal the result again, which should fail with ERR_SET_RESULT_ALREADY_SET
        reveal(
            &mut contract,
            outcome_id.clone(),
            0.5,
            output_img_uri.clone(),
        );
    }

    // @TODO test for ERR_GET_AMOUNT_PAYABLE_UNRESOLVED_INVALID_AMOUNT
    // labels: 100 USDT

    // #[test]
    // #[should_panic(expected = "ERR_GET_AMOUNT_PAYABLE_UNRESOLVED_INVALID_AMOUNT")]
    // fn should_fail_on_selling_greater_than_balance() {}

    // @TODO test for ERR_MARKET_IS_UNDER_RESOLUTION
    // labels: 100 USDT

    // #[test]
    // #[should_panic(expected = "ERR_MARKET_IS_UNDER_RESOLUTION")]
    // fn should_fail_on_selling_under_resolution_window() {}

    #[test]
    #[should_panic(expected = "ERR_SIGNER_IS_NOT_OWNER")]
    fn should_fail_on_reveal_not_owner() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        let player_1 = alice();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        now = Utc.timestamp_nanos(contract.get_market_data().ends_at) + Duration::minutes(2);
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        // Ensure the market is resolved first
        resolve(&mut contract);

        // Attempt to reveal the result by a non-owner account
        testing_env!(context.signer_account_id(bob()).build());

        // The following call to the reveal function should fail with ERR_SIGNER_IS_NOT_OWNER
        reveal(&mut contract, player_1.clone(), 0.3, "".to_string());
    }

    // #[test]
    // #[should_panic(expected = "ERR_PLAYER_IS_NOT_WINNER")]
    // fn should_fail_on_sell_player_is_not_winner() {}

    #[test]
    #[should_panic(expected = "ERR_FEES_CLAIMED")]
    fn should_fail_on_fees_claimed_after_resolution() {
        let mut context = setup_context();

        let mut now = Utc::now();
        testing_env!(context.block_timestamp(block_timestamp(now)).build());

        let market_data: MarketData = create_market_data();
        let mut contract: Market = setup_contract(market_data);

        let player_1 = alice();

        let amount = CREATE_OUTCOME_TOKEN_PRICE;
        let prompt =
            json!({ "value": "a prompt", "negative_prompt": "a negative prompt" }).to_string();

        create_outcome_token(
            &mut contract,
            player_1.clone(),
            amount,
            CreateOutcomeTokenArgs {
                prompt: prompt.clone(),
            },
        );

        testing_env!(context
            .signer_account_id(market_creator_account_id())
            .build());

        let outcome_id = alice();
        let result = 0.3;
        let output_img_uri = "".to_string();

        reveal(&mut contract, outcome_id, result, output_img_uri.clone());

        // Set the market as resolved
        resolve(&mut contract);
        assert_eq!(contract.is_resolved(), true);

        now = Utc.timestamp_nanos(contract.get_resolution_data().window) + Duration::minutes(2);
        testing_env!(
            context
                .block_timestamp(block_timestamp(now))
                .signer_account_id(market_creator_account_id())
                .build(),
            near_sdk::VMConfig::test(),
            near_sdk::RuntimeFeesConfig::test(),
            Default::default(),
            vec![PromiseResult::Successful(vec![])],
        );

        contract.claim_fees();

        contract.on_claim_fees_resolved_callback(
            contract.management.dao_account_id.clone(),
            contract.collateral_token.fee_balance,
        );

        contract.claim_fees();
    }
}
