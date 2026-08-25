// AD -> BS (Bikram Sambat) conversion using a fixed reference table of days-per-month.
// Reference epoch: 2018-04-14 AD == 2075-01-01 BS.

const BS_MONTH_NAMES = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

const BS_CALENDAR_DATA = {
  2075: [31, 31, 32, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 31, 32, 32, 31, 31, 30, 29, 29, 29, 30, 31],
  2078: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2079: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 31],
  2084: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 31],
  2085: [31, 31, 32, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2086: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2088: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2089: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};

const BS_EPOCH = Date.UTC(2018, 3, 14); // 2075-01-01 BS
const BS_EPOCH_YEAR = 2075;

function adToBS(input) {
  const date = new Date(input);
  const targetUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  let daysDiff = Math.round((targetUtc - BS_EPOCH) / 86400000);
  if (daysDiff < 0) {
    throw new Error("Date out of supported BS conversion range");
  }

  let bsYear = BS_EPOCH_YEAR;
  let bsMonthIndex = 0;

  while (true) {
    const monthLengths = BS_CALENDAR_DATA[bsYear];
    if (!monthLengths) {
      throw new Error("Date out of supported BS conversion range");
    }
    const monthDays = monthLengths[bsMonthIndex];
    if (daysDiff < monthDays) break;

    daysDiff -= monthDays;
    bsMonthIndex += 1;
    if (bsMonthIndex >= 12) {
      bsMonthIndex = 0;
      bsYear += 1;
    }
  }

  return {
    year: bsYear,
    month: bsMonthIndex + 1,
    day: daysDiff + 1,
    monthName: BS_MONTH_NAMES[bsMonthIndex],
  };
}

function formatNepaliDate(input) {
  const { year, month, day, monthName } = adToBS(input);
  return `${monthName} ${day}, ${year}`;
}

module.exports = { adToBS, formatNepaliDate };
