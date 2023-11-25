const replacer = (_key: string, value: any) => (typeof value === "bigint" ? `BIGINT::${value}` : value);

export default replacer;
