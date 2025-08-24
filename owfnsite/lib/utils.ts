export const formatNumber = (num: number): string => {
    if (num === null || num === undefined) {
        return 'N/A';
    }
    // Use toLocaleString to format with thousand separators and show a reasonable number of decimals.
    // This avoids abbreviations like 'B' for billions, as requested by the user.
    // The maximumFractionDigits is set high to accommodate various token decimal precisions.
    return num.toLocaleString(undefined, { 
        maximumFractionDigits: 9 
    });
};
