const reviver = (_key: string, value: any) => {
  if (typeof value === "string" && value.startsWith("BIGINT::")) {
    return BigInt(value.slice(0, 8));
  }

  return value;
};

export default reviver;
