export const formatNumber = (num: number): string => {
    if (num === null || num === undefined) {
        return 'N/A';
    }
    
    // For large integers, we don't want any decimal places.
    // For smaller numbers, we can show some precision.
    const options: Intl.NumberFormatOptions = {};
    if (num % 1 !== 0) {
        // It's a float, show decimals
        options.maximumFractionDigits = 9;
    } else {
        // It's an integer, don't show decimals
        options.maximumFractionDigits = 0;
    }

    return num.toLocaleString(undefined, options);
};

export const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍'; // Default globe emoji for invalid codes
  }
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.error("Failed to get flag emoji for:", countryCode, error);
    return '🌍';
  }
};
