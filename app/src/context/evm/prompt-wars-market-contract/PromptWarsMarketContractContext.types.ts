import { ReactNode } from "react";
import { Signer, ethers } from "ethers";

import { Market } from "providers/evm/contracts/prompt-wars";

export type PromptWarsMarketContractContextControllerProps = {
  children: ReactNode;
};

export type PromptWarsMarketContractContextType = {
  deploy: (
    signer: Signer,
    market: Market.MarketDataStruct,
    management: Market.ManagementStruct,
    collateralToken: Market.CollateralTokenStruct,
  ) => Promise<Market>;

  connect: (address: string, provider: ethers.Signer | ethers.Provider) => Promise<Market>;
};
