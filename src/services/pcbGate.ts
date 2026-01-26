import { WalletService } from './walletService.js';
import { SUPPORTED_TOKENS, PCB_TOKEN_SYMBOL } from '../config.js';

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

type CachedResult = {
    expiresAt: number;
    result: { eligible: boolean; balance: number; error?: string } | { balance: number; error?: string };
};

// In-memory per-user cache to reduce PrivacyCash requests and avoid 429s
const cache: Map<number, CachedResult> = new Map();
const CACHE_TTL_SUCCESS = 2 * 60 * 1000; // 2 minutes
const CACHE_TTL_ERROR = 10 * 1000; // 10 seconds for errors

export async function checkPCBEligibility(
    walletService: WalletService,
    chatId: number,
    minAmount: number = 1_000_000,
    maxAttempts: number = 3
): Promise<{ eligible: boolean; balance: number; error?: string }> {
    const now = Date.now();
    const cached = cache.get(chatId);
    if (cached && cached.expiresAt > now) {
        const r = cached.result as { eligible: boolean; balance: number; error?: string };
        return { eligible: r.eligible, balance: r.balance, error: r.error };
    }

    let attempt = 0;
    while (true) {
        attempt++;
        try {
            const balances = await walletService.getBalances(chatId, true);
            if (!balances) {
                const res = { eligible: false, balance: 0, error: 'no_balances' };
                cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_ERROR, result: res });
                return res;
            }

            const pcbSymbol = PCB_TOKEN_SYMBOL as keyof typeof SUPPORTED_TOKENS;
            const info = SUPPORTED_TOKENS[pcbSymbol];
            if (!info) {
                const res = { eligible: false, balance: 0, error: 'pcb_not_configured' };
                cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_ERROR, result: res });
                return res;
            }

            // Support either normalized public amount or raw units. Prefer explicit raw field if present.
            const tokenEntry = balances.tokens?.[pcbSymbol] || {};
            const rawUnits = tokenEntry.publicRaw ?? tokenEntry.public ?? 0;
            const balance = rawUnits / (info.unitsPerToken || 1);

            const res = { eligible: balance >= minAmount, balance };
            cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_SUCCESS, result: res });
            return res;
        } catch (err: any) {
            const msg = err?.message || String(err || 'unknown_error');
            const is429 = msg.includes('429') || msg.toLowerCase().includes('too many requests');
            if (is429 && attempt < maxAttempts) {
                await delay(500 * attempt);
                continue;
            }
            const res = { eligible: false, balance: 0, error: msg };
            cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_ERROR, result: res });
            return res;
        }
    }
}

export async function getPCBBalance(
    walletService: WalletService,
    chatId: number
): Promise<{ balance: number; error?: string }> {
    const now = Date.now();
    const cached = cache.get(chatId);
    if (cached && cached.expiresAt > now) {
        const r = cached.result as { balance: number; error?: string };
        if (typeof r.balance === 'number') return { balance: r.balance, error: r.error };
    }

    try {
        const balances = await walletService.getBalances(chatId, true);
        if (!balances) {
            const res = { balance: 0, error: 'no_balances' };
            cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_ERROR, result: res });
            return res;
        }
        const pcbSymbol = PCB_TOKEN_SYMBOL as keyof typeof SUPPORTED_TOKENS;
        const info = SUPPORTED_TOKENS[pcbSymbol];
        if (!info) {
            const res = { balance: 0, error: 'pcb_not_configured' };
            cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_ERROR, result: res });
            return res;
        }

        const tokenEntry = balances.tokens?.[pcbSymbol] || {};
        const rawUnits = tokenEntry.publicRaw ?? tokenEntry.public ?? 0;
        const balance = rawUnits / (info.unitsPerToken || 1);
        const res = { balance };
        cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_SUCCESS, result: res });
        return res;
    } catch (err: any) {
        const res = { balance: 0, error: err?.message || String(err) };
        cache.set(chatId, { expiresAt: Date.now() + CACHE_TTL_ERROR, result: res });
        return res;
    }
}

export default {
    checkPCBEligibility,
    getPCBBalance
};
