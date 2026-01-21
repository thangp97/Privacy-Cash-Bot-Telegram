import { SUPPORTED_TOKENS, TokenSymbol } from './config.js';

/**
 * Format lamports to SOL with proper decimal places
 */
export function formatSOL(lamports: number): string {
    const sol = lamports / SUPPORTED_TOKENS.SOL.unitsPerToken;
    return sol.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 9,
    });
}

/**
 * Format token base units to human readable amount
 */
export function formatToken(baseUnits: number, symbol: TokenSymbol): string {
    const token = SUPPORTED_TOKENS[symbol];
    const amount = baseUnits / token.unitsPerToken;
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: token.decimals,
    });
}

/**
 * Parse human readable SOL amount to lamports
 */
export function parseSOL(sol: number): number {
    return Math.floor(sol * SUPPORTED_TOKENS.SOL.unitsPerToken);
}

/**
 * Parse human readable token amount to base units
 */
export function parseTokenAmount(amount: number, symbol: TokenSymbol): number {
    const token = SUPPORTED_TOKENS[symbol];
    return Math.floor(amount * token.unitsPerToken);
}

/**
 * Escape markdown special characters for Telegram
 */
export function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

/**
 * Format balance change notification message
 */
export function formatBalanceChange(
    tokenSymbol: string,
    previousBalance: number,
    currentBalance: number,
    unitsPerToken: number
): string {
    const prevAmount = previousBalance / unitsPerToken;
    const currAmount = currentBalance / unitsPerToken;
    const change = currAmount - prevAmount;
    const changePercent = prevAmount !== 0 ? ((change / prevAmount) * 100).toFixed(2) : '∞';
    
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    const sign = change > 0 ? '+' : '';
    
    return `${emoji} *${tokenSymbol} Balance Changed*\n\n` +
        `Previous: \`${prevAmount.toFixed(6)}\` ${tokenSymbol}\n` +
        `Current: \`${currAmount.toFixed(6)}\` ${tokenSymbol}\n` +
        `Change: \`${sign}${change.toFixed(6)}\` ${tokenSymbol} (${sign}${changePercent}%)`;
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
    try {
        // Base58 characters
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return base58Regex.test(address);
    } catch {
        return false;
    }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format error message for user
 */
export function formatError(error: unknown): string {
    if (error instanceof Error) {
        // Clean up common error messages
        let message = error.message;
        
        if (message.includes('Insufficient balance')) {
            return '❌ Insufficient balance for this transaction.';
        }
        if (message.includes('no balance')) {
            return '❌ You have no private balance available.';
        }
        if (message.includes('rate limit')) {
            return '⏳ Too many requests. Please try again in a moment.';
        }
        
        return `❌ Error: ${message}`;
    }
    return '❌ An unexpected error occurred.';
}

/**
 * Generate help text for a command
 */
export function generateCommandHelp(command: string, description: string, usage: string, examples: string[]): string {
    let help = `*/${command}*\n`;
    help += `${description}\n\n`;
    help += `*Usage:*\n\`${usage}\`\n\n`;
    help += `*Examples:*\n`;
    examples.forEach(ex => {
        help += `• \`${ex}\`\n`;
    });
    return help;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse token symbol from user input
 */
export function parseTokenSymbol(input: string): TokenSymbol | null {
    const normalized = input.toUpperCase().trim();
    if (normalized in SUPPORTED_TOKENS) {
        return normalized as TokenSymbol;
    }
    return null;
}

/**
 * Get token info by mint address
 */
export function getTokenByMint(mintAddress: string): { symbol: TokenSymbol; info: typeof SUPPORTED_TOKENS[TokenSymbol] } | null {
    for (const [symbol, info] of Object.entries(SUPPORTED_TOKENS)) {
        if (info.mintAddress === mintAddress) {
            return { symbol: symbol as TokenSymbol, info };
        }
    }
    return null;
}
