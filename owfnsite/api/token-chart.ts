// This API endpoint is responsible for fetching historical OHLCV (candlestick)
// data for a specific token to be displayed on the price chart. It uses the
// Birdeye API, as specified by the user for live price and volume data,
// assuming the API key is securely stored in environment variables.

const BIRDEYE_API_URL = 'https://public-api.birdeye.so/defi/ohlcv';

// Mapping from our app's timeframe keys to Birdeye's API keys
const TIMEFRAME_MAP: { [key: string]: string } = {
    '1m': '1m',
    '5m': '5m',
    '1h': '1H',
    '24h': '1D',
    '7d': '1W',
    '30d': '1W', // Birdeye's finest resolution for long periods is weekly
};

export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;
    const timeframe = req.query?.timeframe; // e.g., '5m', '1h'

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }
    if (!timeframe || !TIMEFRAME_MAP[timeframe]) {
        return res.status(400).json({ error: "A valid timeframe is required." });
    }
    
    // As per instructions, API keys are handled externally via environment variables.
    // We assume BIRDEYE_API_KEY is configured in the deployment environment.
    const apiKey = process.env.BIRDEYE_API_KEY;
    if (!apiKey) {
        console.error("API key for Birdeye is not configured.");
        return res.status(500).json({ error: "Server API key configuration error." });
    }

    const birdeyeTimeframe = TIMEFRAME_MAP[timeframe];
    
    // Calculate time range for the API call based on the selected timeframe
    // to provide a relevant historical view.
    const now = Math.floor(Date.now() / 1000);
    let timeFrom: number;
    switch(timeframe) {
        case '1m':
        case '5m':
        case '1h':
            timeFrom = now - (24 * 60 * 60); // Last 24 hours
            break;
        case '24h':
            timeFrom = now - (30 * 24 * 60 * 60); // Last 30 days
            break;
        case '7d':
             timeFrom = now - (90 * 24 * 60 * 60); // Last 90 days for weekly view
            break;
        case '30d':
            timeFrom = now - (365 * 24 * 60 * 60); // Last year for weekly view
            break;
        default:
            timeFrom = now - (7 * 24 * 60 * 60); // Default to last 7 days
    }
    
    const url = `${BIRDEYE_API_URL}?address=${mintAddress}&type=${birdeyeTimeframe}&time_from=${timeFrom}&time_to=${now}`;

    try {
        const apiResponse = await fetch(url, {
            headers: { 'X-API-KEY': apiKey }
        });

        if (!apiResponse.ok) {
            throw new Error(`Birdeye API error: ${apiResponse.status} ${await apiResponse.text()}`);
        }
        
        const data = await apiResponse.json();

        if (!data.success || !data.data || !Array.isArray(data.data.items)) {
            // Return an empty array if Birdeye has no data, which is a valid response.
            return res.status(200).json([]); 
        }

        // Map data to the format required by the lightweight-charts library.
        // The 'time' property must be a UNIX timestamp in seconds (which Birdeye provides).
        const chartData = data.data.items.map((item: any) => ({
            time: item.unixTimestamp,
            open: item.o,
            high: item.h,
            low: item.l,
            close: item.c,
        })).sort((a: any, b: any) => a.time - b.time); // Ensure data is sorted chronologically

        return res.status(200).json(chartData);

    } catch (error) {
        console.error(`Error fetching chart data for ${mintAddress}:`, error);
        return res.status(500).json({ error: "Failed to fetch chart data." });
    }
}