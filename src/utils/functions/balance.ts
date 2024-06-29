export const planckBnToUnit = (value: string, units: number): number => {
  const balanceNumber = Number(value) / 10 ** units;
  const balanceString = balanceNumber.toFixed(units);

  return Number(balanceString);
};

export const formatNumber = (num: number): number => {
  if (num < 1) {
    const str = num.toString();
    const nonZeroIndex = str.search(/[1-9]/); // Find the first non-zero digit
    if (nonZeroIndex > 0) {
      // Extract the digits we want to keep.
      const formatted = num.toFixed(nonZeroIndex + 2);
      return parseFloat(formatted);
    }
  }

  const str = num.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex !== -1) {
    const truncated = str.slice(0, decimalIndex + 3); // Keep up to 2 decimal places
    return parseFloat(truncated);
  } else {
    return num;
  }
};

const toFixedWithoutRounding = (value: number, decimalDigits: number) => {
  const factor = Math.pow(10, decimalDigits);
  return Math.floor(value * factor) / factor;
};

export const getBalanceString = (
  balance: string,
  decimals: number,
  symbol: string
): string => {
  if (balance == '0') return `0 ${symbol} `;
  const balanceNumber = Number(balance) / 10 ** decimals;
  if (balanceNumber > 1) {
    return `${toFixedWithoutRounding(balanceNumber, 2)} ${symbol}`;
  }

  let balanceString = balanceNumber.toFixed(decimals);

  // Find the position of the first non-zero digit
  const firstNonZeroPos = balanceString.search(/[1-9]/);

  // Extract the part to keep and limit it to 3 characters after the first non-zero digit
  if (firstNonZeroPos !== -1) {
    balanceString = balanceString.slice(0, firstNonZeroPos + 3);
  }

  return `${balanceString} ${symbol} `;
};
