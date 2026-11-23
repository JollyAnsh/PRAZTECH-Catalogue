/**
 * Converts a numeric currency amount into Indian Currency Words.
 * e.g., 12500 -> "Twelve Thousand Five Hundred Rupees Only"
 *       12500.50 -> "Twelve Thousand Five Hundred Rupees and Fifty Paise Only"
 * Follows the Indian numbering system: Crores, Lakhs, Thousands, Hundreds.
 */
function numberToWordsINR(amount) {
  if (amount === 0) return 'Zero Rupees Only';
  if (!amount || isNaN(amount)) return '';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(num) {
    if (num < 10) return singleDigits[num];
    if (num >= 10 && num < 20) return teenDigits[num - 10];
    const tens = Math.floor(num / 10);
    const rest = num % 10;
    return tensDigits[tens] + (rest > 0 ? ' ' + singleDigits[rest] : '');
  }

  function convertThreeDigits(num) {
    let str = '';
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    if (hundred > 0) {
      str += singleDigits[hundred] + ' Hundred';
      if (rest > 0) str += ' ';
    }
    if (rest > 0) {
      str += convertTwoDigits(rest);
    }
    return str.trim();
  }

  const rounded = Math.round(Number(amount) * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let result = '';

  // 1 Crore = 1,00,00,000
  const crore = Math.floor(rupees / 10000000);
  let rem = rupees % 10000000;

  // 1 Lakh = 1,00,000
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  // 1 Thousand = 1,000
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundredAndBelow = rem;

  if (crore > 0) {
    result += (crore < 100 ? convertTwoDigits(crore) : convertThreeDigits(crore)) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundredAndBelow > 0) {
    result += convertThreeDigits(hundredAndBelow) + ' ';
  }

  result = result.trim();
  if (!result) result = 'Zero';
  result += ' Rupees';

  if (paise > 0) {
    result += ' and ' + convertTwoDigits(paise) + ' Paise';
  }

  return result + ' Only';
}

module.exports = { numberToWordsINR };
