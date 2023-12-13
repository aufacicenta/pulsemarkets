import React from "react";
import { Signer, ethers } from "ethers";

import { Market, Market__factory } from "providers/evm/contracts/prompt-wars";

import { PromptWarsMarketContractContext } from "./PromptWarsMarketContractContext";
import {
  PromptWarsMarketContractContextControllerProps,
  PromptWarsMarketContractContextType,
} from "./PromptWarsMarketContractContext.types";

const deploy = async (
  signer: Signer,
  market: Market.MarketDataStruct,
  management: Market.ManagementStruct,
  collateralToken: Market.CollateralTokenStruct,
) => {
  const contract = new Market__factory(signer);

  const PromptWarsMarketContract = await contract.deploy(market, management, collateralToken);

  if (PromptWarsMarketContract.deploymentTransaction()) {
    await PromptWarsMarketContract.deploymentTransaction()!.wait();
  }

  return PromptWarsMarketContract;
};

const connect = async (address: string, provider: ethers.Signer | ethers.Provider) => {
  const contract = new ethers.Contract(address, Market__factory.abi, provider) as unknown as Market;

  return contract;
};

export const PromptWarsMarketContractContextController = ({
  children,
}: PromptWarsMarketContractContextControllerProps) => {
  const props: PromptWarsMarketContractContextType = {
    deploy,
    connect,
  };

  return <PromptWarsMarketContractContext.Provider value={props}>{children}</PromptWarsMarketContractContext.Provider>;
};
