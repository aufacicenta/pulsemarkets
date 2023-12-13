/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace Market {
  export type MarketDataStruct = {
    imageUri: string;
    startsAt: BigNumberish;
    endsAt: BigNumberish;
  };

  export type MarketDataStructOutput = [imageUri: string, startsAt: bigint, endsAt: bigint] & {
    imageUri: string;
    startsAt: bigint;
    endsAt: bigint;
  };

  export type ManagementStruct = {
    daoAccountId: string;
    marketCreatorAccountId: string;
    selfDestructWindow: BigNumberish;
    buySellThreshold: BigNumberish;
  };

  export type ManagementStructOutput = [
    daoAccountId: string,
    marketCreatorAccountId: string,
    selfDestructWindow: bigint,
    buySellThreshold: bigint,
  ] & {
    daoAccountId: string;
    marketCreatorAccountId: string;
    selfDestructWindow: bigint;
    buySellThreshold: bigint;
  };

  export type CollateralTokenStruct = {
    id: AddressLike;
    balance: BigNumberish;
    decimals: BigNumberish;
    feeBalance: BigNumberish;
  };

  export type CollateralTokenStructOutput = [id: string, balance: bigint, decimals: bigint, feeBalance: bigint] & {
    id: string;
    balance: bigint;
    decimals: bigint;
    feeBalance: bigint;
  };

  export type FeesStruct = {
    price: BigNumberish;
    feeRatio: BigNumberish;
    claimedAt: BigNumberish;
  };

  export type FeesStructOutput = [price: bigint, feeRatio: bigint, claimedAt: bigint] & {
    price: bigint;
    feeRatio: bigint;
    claimedAt: bigint;
  };

  export type PlayerStruct = {
    id: AddressLike;
    prompt: string;
    outputImgUri: string;
    result: string;
    balance: BigNumberish;
  };

  export type PlayerStructOutput = [
    id: string,
    prompt: string,
    outputImgUri: string,
    result: string,
    balance: bigint,
  ] & {
    id: string;
    prompt: string;
    outputImgUri: string;
    result: string;
    balance: bigint;
  };

  export type ResolutionStruct = {
    window: BigNumberish;
    revealWindow: BigNumberish;
    resolvedAt: BigNumberish;
    playerId: AddressLike;
  };

  export type ResolutionStructOutput = [window: bigint, revealWindow: bigint, resolvedAt: bigint, playerId: string] & {
    window: bigint;
    revealWindow: bigint;
    resolvedAt: bigint;
    playerId: string;
  };
}

export interface MarketInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "get_amount_mintable"
      | "get_block_timestamp"
      | "get_collateral_token_data"
      | "get_fees_data"
      | "get_management_data"
      | "get_market_data"
      | "get_player"
      | "get_players_count"
      | "get_resolution_data"
      | "owner"
      | "register"
      | "renounceOwnership"
      | "resolve"
      | "reveal"
      | "sell"
      | "transferOwnership",
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "InternalSellResolved"
      | "InternalSellUnresolved"
      | "OwnershipTransferred"
      | "RegisterPlayer"
      | "ResolutionSuccess"
      | "RevealPlayerResult",
  ): EventFragment;

  encodeFunctionData(functionFragment: "get_amount_mintable", values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: "get_block_timestamp", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_collateral_token_data", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_fees_data", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_management_data", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_market_data", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_player", values: [AddressLike]): string;
  encodeFunctionData(functionFragment: "get_players_count", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_resolution_data", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "register", values: [string]): string;
  encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
  encodeFunctionData(functionFragment: "resolve", values: [AddressLike]): string;
  encodeFunctionData(functionFragment: "reveal", values: [AddressLike, string, string]): string;
  encodeFunctionData(functionFragment: "sell", values?: undefined): string;
  encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;

  decodeFunctionResult(functionFragment: "get_amount_mintable", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_block_timestamp", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_collateral_token_data", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_fees_data", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_management_data", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_market_data", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_player", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_players_count", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_resolution_data", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "register", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "resolve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "reveal", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "sell", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
}

export namespace InternalSellResolvedEvent {
  export type InputTuple = [payee: AddressLike, amount: BigNumberish];
  export type OutputTuple = [payee: string, amount: bigint];
  export interface OutputObject {
    payee: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InternalSellUnresolvedEvent {
  export type InputTuple = [payee: AddressLike, amount: BigNumberish];
  export type OutputTuple = [payee: string, amount: bigint];
  export interface OutputObject {
    payee: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RegisterPlayerEvent {
  export type InputTuple = [
    amount: BigNumberish,
    outcomeId: AddressLike,
    supply: BigNumberish,
    fee: BigNumberish,
    collateralTokenBalance: BigNumberish,
    collateralTokenFeeBalance: BigNumberish,
  ];
  export type OutputTuple = [
    amount: bigint,
    outcomeId: string,
    supply: bigint,
    fee: bigint,
    collateralTokenBalance: bigint,
    collateralTokenFeeBalance: bigint,
  ];
  export interface OutputObject {
    amount: bigint;
    outcomeId: string;
    supply: bigint;
    fee: bigint;
    collateralTokenBalance: bigint;
    collateralTokenFeeBalance: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ResolutionSuccessEvent {
  export type InputTuple = [playerId: AddressLike, result: string, outputImgUri: string];
  export type OutputTuple = [playerId: string, result: string, outputImgUri: string];
  export interface OutputObject {
    playerId: string;
    result: string;
    outputImgUri: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RevealPlayerResultEvent {
  export type InputTuple = [playerId: AddressLike, result: string, outputImgUri: string];
  export type OutputTuple = [playerId: string, result: string, outputImgUri: string];
  export interface OutputObject {
    playerId: string;
    result: string;
    outputImgUri: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Market extends BaseContract {
  connect(runner?: ContractRunner | null): Market;
  waitForDeployment(): Promise<this>;

  interface: MarketInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;

  get_amount_mintable: TypedContractMethod<[amount: BigNumberish], [[bigint, bigint]], "view">;

  get_block_timestamp: TypedContractMethod<[], [bigint], "view">;

  get_collateral_token_data: TypedContractMethod<[], [Market.CollateralTokenStructOutput], "view">;

  get_fees_data: TypedContractMethod<[], [Market.FeesStructOutput], "view">;

  get_management_data: TypedContractMethod<[], [Market.ManagementStructOutput], "view">;

  get_market_data: TypedContractMethod<[], [Market.MarketDataStructOutput], "view">;

  get_player: TypedContractMethod<[playerId: AddressLike], [Market.PlayerStructOutput], "view">;

  get_players_count: TypedContractMethod<[], [bigint], "view">;

  get_resolution_data: TypedContractMethod<[], [Market.ResolutionStructOutput], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  register: TypedContractMethod<[prompt: string], [void], "nonpayable">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  resolve: TypedContractMethod<[playerId: AddressLike], [void], "nonpayable">;

  reveal: TypedContractMethod<[playerId: AddressLike, result: string, outputImgUri: string], [void], "nonpayable">;

  sell: TypedContractMethod<[], [bigint], "nonpayable">;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: "get_amount_mintable",
  ): TypedContractMethod<[amount: BigNumberish], [[bigint, bigint]], "view">;
  getFunction(nameOrSignature: "get_block_timestamp"): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "get_collateral_token_data",
  ): TypedContractMethod<[], [Market.CollateralTokenStructOutput], "view">;
  getFunction(nameOrSignature: "get_fees_data"): TypedContractMethod<[], [Market.FeesStructOutput], "view">;
  getFunction(nameOrSignature: "get_management_data"): TypedContractMethod<[], [Market.ManagementStructOutput], "view">;
  getFunction(nameOrSignature: "get_market_data"): TypedContractMethod<[], [Market.MarketDataStructOutput], "view">;
  getFunction(
    nameOrSignature: "get_player",
  ): TypedContractMethod<[playerId: AddressLike], [Market.PlayerStructOutput], "view">;
  getFunction(nameOrSignature: "get_players_count"): TypedContractMethod<[], [bigint], "view">;
  getFunction(nameOrSignature: "get_resolution_data"): TypedContractMethod<[], [Market.ResolutionStructOutput], "view">;
  getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
  getFunction(nameOrSignature: "register"): TypedContractMethod<[prompt: string], [void], "nonpayable">;
  getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(nameOrSignature: "resolve"): TypedContractMethod<[playerId: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "reveal",
  ): TypedContractMethod<[playerId: AddressLike, result: string, outputImgUri: string], [void], "nonpayable">;
  getFunction(nameOrSignature: "sell"): TypedContractMethod<[], [bigint], "nonpayable">;
  getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;

  getEvent(
    key: "InternalSellResolved",
  ): TypedContractEvent<
    InternalSellResolvedEvent.InputTuple,
    InternalSellResolvedEvent.OutputTuple,
    InternalSellResolvedEvent.OutputObject
  >;
  getEvent(
    key: "InternalSellUnresolved",
  ): TypedContractEvent<
    InternalSellUnresolvedEvent.InputTuple,
    InternalSellUnresolvedEvent.OutputTuple,
    InternalSellUnresolvedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred",
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "RegisterPlayer",
  ): TypedContractEvent<
    RegisterPlayerEvent.InputTuple,
    RegisterPlayerEvent.OutputTuple,
    RegisterPlayerEvent.OutputObject
  >;
  getEvent(
    key: "ResolutionSuccess",
  ): TypedContractEvent<
    ResolutionSuccessEvent.InputTuple,
    ResolutionSuccessEvent.OutputTuple,
    ResolutionSuccessEvent.OutputObject
  >;
  getEvent(
    key: "RevealPlayerResult",
  ): TypedContractEvent<
    RevealPlayerResultEvent.InputTuple,
    RevealPlayerResultEvent.OutputTuple,
    RevealPlayerResultEvent.OutputObject
  >;

  filters: {
    "InternalSellResolved(address,uint256)": TypedContractEvent<
      InternalSellResolvedEvent.InputTuple,
      InternalSellResolvedEvent.OutputTuple,
      InternalSellResolvedEvent.OutputObject
    >;
    InternalSellResolved: TypedContractEvent<
      InternalSellResolvedEvent.InputTuple,
      InternalSellResolvedEvent.OutputTuple,
      InternalSellResolvedEvent.OutputObject
    >;

    "InternalSellUnresolved(address,uint256)": TypedContractEvent<
      InternalSellUnresolvedEvent.InputTuple,
      InternalSellUnresolvedEvent.OutputTuple,
      InternalSellUnresolvedEvent.OutputObject
    >;
    InternalSellUnresolved: TypedContractEvent<
      InternalSellUnresolvedEvent.InputTuple,
      InternalSellUnresolvedEvent.OutputTuple,
      InternalSellUnresolvedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "RegisterPlayer(uint256,address,uint256,uint256,uint256,uint256)": TypedContractEvent<
      RegisterPlayerEvent.InputTuple,
      RegisterPlayerEvent.OutputTuple,
      RegisterPlayerEvent.OutputObject
    >;
    RegisterPlayer: TypedContractEvent<
      RegisterPlayerEvent.InputTuple,
      RegisterPlayerEvent.OutputTuple,
      RegisterPlayerEvent.OutputObject
    >;

    "ResolutionSuccess(address,string,string)": TypedContractEvent<
      ResolutionSuccessEvent.InputTuple,
      ResolutionSuccessEvent.OutputTuple,
      ResolutionSuccessEvent.OutputObject
    >;
    ResolutionSuccess: TypedContractEvent<
      ResolutionSuccessEvent.InputTuple,
      ResolutionSuccessEvent.OutputTuple,
      ResolutionSuccessEvent.OutputObject
    >;

    "RevealPlayerResult(address,string,string)": TypedContractEvent<
      RevealPlayerResultEvent.InputTuple,
      RevealPlayerResultEvent.OutputTuple,
      RevealPlayerResultEvent.OutputObject
    >;
    RevealPlayerResult: TypedContractEvent<
      RevealPlayerResultEvent.InputTuple,
      RevealPlayerResultEvent.OutputTuple,
      RevealPlayerResultEvent.OutputObject
    >;
  };
}
