// This file contains constants that are safe to be imported by backend API routes,
// as it has no dependencies on React or other frontend-only libraries.

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

interface MockTokenInfo {
    mintAddress: string;
    description?: string;
}

// A simplified version of MOCK_TOKEN_DETAILS for use in the backend.
// It only contains the fields needed by the API to avoid React type dependencies.
export const MOCK_TOKEN_INFO_API: { [symbol: string]: MockTokenInfo } = {
    'OWFN': {
        mintAddress: 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B',
        description: 'OWFN (Official World Family Network) is a Solana-based token designed to unite families globally through blockchain technology, focusing on social impact, education, health, and humanitarian aid with full transparency.',
    },
    'SOL': {
        mintAddress: 'So11111111111111111111111111111111111111112',
        description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.',
    },
     'USDC': {
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
        description: 'USDC is a fully collateralized US dollar stablecoin. It is an Ethereum-powered coin and is the product of a collaboration between Circle and Coinbase.',
    },
     'USDT': {
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        description: 'Tether (USDT) is a stablecoin pegged to the U.S. dollar. It is issued by the Hong Kong-based company Tether Limited.',
    }
};
