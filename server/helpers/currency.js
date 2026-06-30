// Currency conversion helper
// Assuming 1 USD = 130 NPR (approximate rate, should be updated with real API)
const USD_TO_NPR = 130;

const convertNPRToUSD = (nprAmount) => {
  return nprAmount / USD_TO_NPR;
};

const convertUSDToNPR = (usdAmount) => {
  return usdAmount * USD_TO_NPR;
};

module.exports = {
  convertNPRToUSD,
  convertUSDToNPR,
  USD_TO_NPR,
};