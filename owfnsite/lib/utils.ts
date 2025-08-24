export const formatNumber = (num: number, digits: number = 2): string => {
    if (num === 0) return '0';
    if (num === null || num === undefined) return 'N/A';
    
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "B" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup.slice().reverse().find(function(item) {
        return num >= item.value;
    });
    
    if (item) {
        return (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol;
    }
    
    // Fallback for very small numbers to avoid showing "0.00" for non-zero balances
    if (num < 1) {
        return num.toPrecision(digits);
    }
    
    return num.toFixed(digits);
};
