function generateRandomThreeDigitNumber(digit = 3) {
  // Generate a random number between 100 and 999 (inclusive)
  if (digit == 3) {
    const min = 100;
    const max = 999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  if (digit == 2) {
    const min = 1;
    const max = 20;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = generateRandomThreeDigitNumber;
