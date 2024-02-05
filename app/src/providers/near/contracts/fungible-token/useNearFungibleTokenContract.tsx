import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { AccountId } from "../market/market.types";
import currency from "providers/currency";

import { FungibleTokenContract } from "./contract";
import { FungibleTokenMetadata } from "./fungible-token.types";

export default ({ contractAddress }: { contractAddress?: string }) => {
  const [actions, setActions] = useState<{
    ftTransferCall: { isLoading: boolean };
    balanceOf: { isLoading: boolean };
  }>({
    ftTransferCall: {
      isLoading: false,
    },
    balanceOf: {
      isLoading: false,
    },
  });
  const [metadata, setMetadata] = useState<FungibleTokenMetadata>();
  const [guestContract, setGuestContract] = useState<FungibleTokenContract>();
  const [balanceOf, setBalanceOf] = useState("0.00");

  const { isConnected, address } = useAccount();

  // TODO: What is connection ?
  const connection = null;

  const assertWalletConnection = () => {
    if (!isConnected) {
      throw new Error("ERR_USE_NEAR_FT_CONTRACT_INVALID_WALLET_CONNECTION");
    }
  };

  const assertGuestContractConnection = () => {
    if (!guestContract) {
      throw new Error("ERR_USE_NEAR_FT_CONTRACT_INVALID_GUEST_CONTRACT_CONNECTION");
    }
  };

  const assertContractMetadata = () => {
    if (!metadata) {
      throw new Error("ERR_USE_NEAR_FT_CONTRACT_INVALID_CONTRACT_METADATA");
    }
  };

  const assertContractAddress = () => {
    if (!contractAddress) {
      throw new Error("ERR_USE_NEAR_FT_CONTRACT_INVALID_CONTRACT_ADDRESS");
    }
  };

  const loadGuestContract = async () => {
    try {
      assertContractAddress();

      setGuestContract(await FungibleTokenContract.loadFromGuestConnection(contractAddress!));
    } catch {
      // void
    }
  };

  const getFtMetadata = async () => {
    try {
      assertGuestContractConnection();

      const ftMetadata = await guestContract!.ftMetadata();

      setMetadata(ftMetadata);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadGuestContract();
  }, [connection, contractAddress]);

  useEffect(() => {
    if (!guestContract) {
      return;
    }

    getFtMetadata();
  }, [guestContract]);

  const getWalletBalance = async () => {
    try {
      assertWalletConnection();
      assertGuestContractConnection();
      assertContractMetadata();

      const balance = await guestContract!.ftBalanceOf({ account_id: address! });

      return currency.convert.toDecimalsPrecisionString(balance, metadata!.decimals);
    } catch {
      return "0.00";
    }
  };

  const getBalanceOf = async (account_id: AccountId) => {
    try {
      setActions((prev) => ({
        ...prev,
        balanceOf: {
          ...prev.balanceOf,
          isLoading: true,
        },
      }));

      const contract = await FungibleTokenContract.loadFromGuestConnection(contractAddress!);
      const ftMetadata = await contract!.ftMetadata();

      const balance = await contract!.ftBalanceOf({ account_id });

      setBalanceOf(currency.convert.toDecimalsPrecisionString(balance, ftMetadata!.decimals));
    } catch (error) {
      console.log(error);
      setBalanceOf("0.00");
    }

    setActions((prev) => ({
      ...prev,
      balanceOf: {
        ...prev.balanceOf,
        isLoading: false,
      },
    }));
  };

  return {
    contract: FungibleTokenContract,
    getWalletBalance,
    getBalanceOf,
    ftTransferCall: (_marketId: string, _amount: string, _outcomeId: number) => undefined,
    balanceOf,
    metadata,
    actions,
  };
};
