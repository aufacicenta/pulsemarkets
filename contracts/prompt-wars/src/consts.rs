use near_sdk::{Gas, ONE_YOCTO};
use num_format::Locale;

use crate::{Timestamp, WrappedBalance};

pub const GAS_CREATE_DAO_PROPOSAL: Gas = Gas(8_000_000_000_000);
pub const GAS_CREATE_DAO_PROPOSAL_CALLBACK: Gas = Gas(8_000_000_000_000);

pub const GAS_FT_TRANSFER: Gas = Gas(3_000_000_000_000);
pub const GAS_FT_TRANSFER_CALLBACK: Gas = Gas(3_000_000_000_000);

pub const GAS_FT_BALANCE_OF: Gas = Gas(3_000_000_000_000);
pub const GAS_FT_BALANCE_OF_CALLBACK: Gas = Gas(3_000_000_000_000);

pub const GAS_FT_TOTAL_SUPPLY: Gas = Gas(2_000_000_000_000);
pub const GAS_FT_TOTAL_SUPPLY_CALLBACK: Gas = Gas(2_000_000_000_000);

pub const GAS_FT_METADATA: Gas = Gas(2_000_000_000_000);
pub const GAS_FT_METADATA_CALLBACK: Gas = Gas(2_000_000_000_000);

pub const EVENT_PERIOD_NANOS: Timestamp = 300_000_000_000; // 5 minutes
pub const STAGE_PERIOD_NANOS: Timestamp = 180_000_000_000; // 3 minutes

pub const BUY_SELL_THRESHOLD: f32 = 0.75; // 25% before the event ends

pub const CREATE_OUTCOME_TOKEN_PRICE: WrappedBalance = 10_000; // 0.001 USDT
pub const FEE_RATIO: WrappedBalance = 20_000_000; // 20%

pub const BALANCE_PROPOSAL_BOND: WrappedBalance = 100_000_000_000_000_000_000_000; // 0.1 Near
pub const FT_TRANSFER_BOND: WrappedBalance = ONE_YOCTO;

pub const FORMATTED_STRING_LOCALE: Locale = Locale::en;
