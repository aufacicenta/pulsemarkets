use near_sdk::{
    json_types::U64,
    near_bindgen,
    AccountId
};

use crate::storage::*;

#[near_bindgen]
impl MarketFactory {
    pub fn get_markets_list(&self) -> Vec<AccountId> {
        self.markets.to_vec()
    }

    pub fn get_markets_count(&self) -> U64 {
        near_sdk::json_types::U64(self.markets.len())
    }

    pub fn get_markets(&self, from_index: U64, limit: U64) -> Vec<AccountId> {
        let elements = &self.markets;

        (from_index.0..std::cmp::min(from_index.0 + limit.0, elements.len()))
            .filter_map(|index| elements.get(index))
            .collect()
    }
}
