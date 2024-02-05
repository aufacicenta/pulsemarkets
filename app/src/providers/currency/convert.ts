import { BigNumberish } from "ethers";

import { DEFAULT_DECIMALS_PRECISION } from "./constants";

const padDecimals = (decimals: number) => Number("1".padEnd(decimals + 1, "0"));

const toUIntAmount = (amount: number | string, decimals: number) => {
  const uIntAmount =
    Number(amount) > 0
      ? (Number(amount) * padDecimals(decimals)).toString().replace(".0", "")
      : Number(amount)
          .toFixed(decimals + 1)
          .replace("0.", "");

  return uIntAmount.toString();
};

const fromUIntAmount = (amount: string | number, decimals: number) =>
  (Number(amount) / padDecimals(decimals)).toFixed(DEFAULT_DECIMALS_PRECISION);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBigInt = (number: any) => typeof number === "bigint";

const toSafeInt = (number: BigNumberish) => Number(number);

const toDecimalsPrecisionString = (amount: string | number | BigNumberish, decimals: number | BigNumberish) =>
  (Number(amount) / padDecimals(toSafeInt(decimals))).toFixed(DEFAULT_DECIMALS_PRECISION);

const toFormattedString = (amount: string | number, decimals: number = 2, currency: string = "USD") => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(Number(amount));
};

export default {
  toUIntAmount,
  fromUIntAmount,
  toDecimalsPrecisionString,
  toFormattedString,
  isBigInt,
  toSafeInt,
};
