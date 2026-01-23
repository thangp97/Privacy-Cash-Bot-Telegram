import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Config {
    telegram: {
        botToken: string;
    };
    solana: {
        rpcUrl: string;
    };
    balanceMonitor: {
        checkIntervalMinutes: number;
    };
    paths: {
        userData: string;
        cache: string;
    };
    debug: boolean;
}

function getEnvVar(name: string, defaultValue?: string): string {
    const value = process.env[name];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || defaultValue || '';
}

export const config: Config = {
    telegram: {
        botToken: getEnvVar('TELEGRAM_BOT_TOKEN'),
    },
    solana: {
        rpcUrl: getEnvVar('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'),
    },
    balanceMonitor: {
        checkIntervalMinutes: parseInt(getEnvVar('BALANCE_CHECK_INTERVAL', '5'), 10),
    },
    paths: {
        userData: path.join(__dirname, '..', 'user_data'),
        cache: path.join(__dirname, '..', 'cache'),
    },
    debug: getEnvVar('DEBUG_MODE', 'false') === 'true',
};

// Supported tokens configuration
export const SUPPORTED_TOKENS = {
    SOL: {
        name: 'SOL',
        symbol: 'SOL',
        decimals: 9,
        unitsPerToken: 1e9,
        mintAddress: 'So11111111111111111111111111111111111111112',
    },
    USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        unitsPerToken: 1e6,
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
    USDT: {
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        unitsPerToken: 1e6,
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    },
    ZEC: {
        name: 'Zcash',
        symbol: 'ZEC',
        decimals: 8,
        unitsPerToken: 1e8,
        mintAddress: 'A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS',
    },
    ORE: {
        name: 'Ore',
        symbol: 'ORE',
        decimals: 11,
        unitsPerToken: 1e11,
        mintAddress: 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp',
    },
    STORE: {
        name: 'Store',
        symbol: 'STORE',
        decimals: 11,
        unitsPerToken: 1e11,
        mintAddress: 'sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH',
    },
} as const;

export type TokenSymbol = keyof typeof SUPPORTED_TOKENS;

// Privacy Cash Fee Configuration
export const PRIVACY_CASH_FEES = {
    // Withdrawal fees
    withdraw: {
        baseFeeSOL: 0.006,          // 0.006 SOL base fee
        percentageFee: 0.0035,      // 0.35% percentage fee
    },
    // Estimated transaction fee for deposits (rent + tx fee)
    deposit: {
        estimatedTxFeeSOL: 0.003,   // Estimated transaction fee for deposit
    },
} as const;

/**
 * Calculate withdrawal fee for SOL
 * @param amountSOL Amount in SOL to withdraw
 * @returns Object containing base fee, percentage fee, and total fee
 */
export function calculateWithdrawFee(amountSOL: number): {
    baseFee: number;
    percentageFee: number;
    totalFee: number;
    amountAfterFee: number;
} {
    const baseFee = PRIVACY_CASH_FEES.withdraw.baseFeeSOL;
    const percentageFee = amountSOL * PRIVACY_CASH_FEES.withdraw.percentageFee;
    const totalFee = baseFee + percentageFee;
    const amountAfterFee = Math.max(0, amountSOL - totalFee);
    
    return {
        baseFee,
        percentageFee,
        totalFee,
        amountAfterFee,
    };
}
