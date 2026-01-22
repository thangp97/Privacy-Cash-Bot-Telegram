import fs from 'node:fs';
import path from 'node:path';
import { PrivacyCash } from 'privacycash';
import { PublicKey, Connection, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import bs58 from 'bs58';
import { config, SUPPORTED_TOKENS, TokenSymbol } from '../config.js';
import { globalRequestQueue } from './requestQueue.js';
import { balanceCache } from './balanceCache.js';

export interface UserWallet {
    chatId: number;
    privateKey: string;
    publicKey: string;
    createdAt: string;
    monitoringEnabled: boolean;
}

export interface BalanceInfo {
    sol: {
        public: number;
        private: number;
    };
    tokens: {
        [key in TokenSymbol]?: {
            public: number;
            private: number;
        };
    };
}

/**
 * Service to manage user wallets and Privacy Cash operations
 */
export class WalletService {
    private userWallets: Map<number, UserWallet> = new Map();
    private privacyCashClients: Map<number, PrivacyCash> = new Map();
    private connection: Connection;
    private dataDir: string;

    constructor() {
        this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
        this.dataDir = config.paths.userData;
        this.ensureDataDir();
        this.loadWallets();
    }

    private ensureDataDir(): void {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private getWalletFilePath(chatId: number): string {
        return path.join(this.dataDir, `wallet_${chatId}.json`);
    }

    private loadWallets(): void {
        try {
            const files = fs.readdirSync(this.dataDir);
            for (const file of files) {
                if (file.startsWith('wallet_') && file.endsWith('.json')) {
                    const filePath = path.join(this.dataDir, file);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as UserWallet;
                    this.userWallets.set(data.chatId, data);
                }
            }
            console.log(`Loaded ${this.userWallets.size} user wallets`);
        } catch (error) {
            console.error('Error loading wallets:', error);
        }
    }

    private saveWallet(wallet: UserWallet): void {
        const filePath = this.getWalletFilePath(wallet.chatId);
        fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2));
    }

    /**
     * Check if user has a connected wallet
     */
    hasWallet(chatId: number): boolean {
        return this.userWallets.has(chatId);
    }

    /**
     * Get user's wallet info
     */
    getWallet(chatId: number): UserWallet | null {
        return this.userWallets.get(chatId) || null;
    }

    /**
     * Connect a wallet using private key
     */
    async connectWallet(chatId: number, privateKey: string): Promise<{ success: boolean; publicKey?: string; error?: string }> {
        try {
            // Create Privacy Cash client to validate the private key
            const client = new PrivacyCash({
                RPC_url: config.solana.rpcUrl,
                owner: privateKey,
                enableDebug: config.debug,
            });

            const publicKey = client.publicKey.toString();

            const wallet: UserWallet = {
                chatId,
                privateKey,
                publicKey,
                createdAt: new Date().toISOString(),
                monitoringEnabled: true,
            };

            this.userWallets.set(chatId, wallet);
            this.privacyCashClients.set(chatId, client);
            this.saveWallet(wallet);

            return { success: true, publicKey };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid private key',
            };
        }
    }

    /**
     * Create a new wallet and connect it
     */
    async createNewWallet(chatId: number): Promise<{ success: boolean; publicKey?: string; privateKey?: string; error?: string }> {
        try {
            // Generate a new keypair
            const keypair = Keypair.generate();
            const privateKey = bs58.encode(keypair.secretKey);
            const publicKey = keypair.publicKey.toString();

            // Create Privacy Cash client with the new keypair
            const client = new PrivacyCash({
                RPC_url: config.solana.rpcUrl,
                owner: privateKey,
                enableDebug: config.debug,
            });

            const wallet: UserWallet = {
                chatId,
                privateKey,
                publicKey,
                createdAt: new Date().toISOString(),
                monitoringEnabled: true,
            };

            this.userWallets.set(chatId, wallet);
            this.privacyCashClients.set(chatId, client);
            this.saveWallet(wallet);

            return { success: true, publicKey, privateKey };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create wallet',
            };
        }
    }

    /**
     * Disconnect wallet
     */
    disconnectWallet(chatId: number): boolean {
        const wallet = this.userWallets.get(chatId);
        if (!wallet) return false;

        this.userWallets.delete(chatId);
        this.privacyCashClients.delete(chatId);

        const filePath = this.getWalletFilePath(chatId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return true;
    }

    /**
     * Get Privacy Cash client for user
     */
    getClient(chatId: number): PrivacyCash | null {
        if (this.privacyCashClients.has(chatId)) {
            return this.privacyCashClients.get(chatId)!;
        }

        const wallet = this.userWallets.get(chatId);
        if (!wallet) return null;

        const client = new PrivacyCash({
            RPC_url: config.solana.rpcUrl,
            owner: wallet.privateKey,
            enableDebug: config.debug,
        });

        this.privacyCashClients.set(chatId, client);
        return client;
    }

    /**
     * Get all balances (public and private) for a user
     * Uses caching and request queue for better performance
     */
    async getBalances(chatId: number, forceRefresh: boolean = false): Promise<BalanceInfo | null> {
        const cacheKey = `${chatId}:balances`;
        
        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = balanceCache.get<BalanceInfo>(cacheKey);
            if (cached) {
                console.log(`Using cached balance for user ${chatId}`);
                return cached;
            }
        }

        // Use queue to prevent too many concurrent operations
        return globalRequestQueue.enqueue(
            String(chatId),
            async () => {
                // Double-check cache after waiting in queue
                if (!forceRefresh) {
                    const cached = balanceCache.get<BalanceInfo>(cacheKey);
                    if (cached) return cached;
                }

                const wallet = this.getWallet(chatId);
                const client = this.getClient(chatId);
                if (!wallet || !client) return null;

                const publicKey = new PublicKey(wallet.publicKey);

                // Get SOL balances in parallel
                const [publicSolBalance, privateSOLBalance] = await Promise.all([
                    this.connection.getBalance(publicKey),
                    client.getPrivateBalance()
                ]);

                const balances: BalanceInfo = {
                    sol: {
                        public: publicSolBalance,
                        private: privateSOLBalance.lamports,
                    },
                    tokens: {},
                };

                // Get SPL token balances - limit concurrency
                const tokenPromises = Object.entries(SUPPORTED_TOKENS)
                    .filter(([symbol]) => symbol !== 'SOL')
                    .map(async ([symbol, tokenInfo]) => {
                        try {
                            const mintPubkey = new PublicKey((tokenInfo as typeof SUPPORTED_TOKENS[TokenSymbol]).mintAddress);
                            const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
                            
                            // Public balance
                            let publicBalance = 0;
                            try {
                                const accountInfo = await getAccount(this.connection, ata);
                                publicBalance = Number(accountInfo.amount);
                            } catch {
                                // ATA doesn't exist, balance is 0
                            }

                            // Private balance
                            let privateBalance = 0;
                            try {
                                const privateBalanceResult = await client.getPrivateBalanceSpl(mintPubkey);
                                privateBalance = privateBalanceResult.amount;
                            } catch {
                                // No private balance
                            }

                            return { symbol, publicBalance, privateBalance };
                        } catch (error) {
                            console.error(`Error getting ${symbol} balance:`, error);
                            return null;
                        }
                    });

                const tokenResults = await Promise.all(tokenPromises);
                
                for (const result of tokenResults) {
                    if (result) {
                        balances.tokens[result.symbol as TokenSymbol] = {
                            public: result.publicBalance,
                            private: result.privateBalance,
                        };
                    }
                }

                // Cache the result
                balanceCache.set(cacheKey, balances);
                console.log(`Cached balance for user ${chatId}`);

                return balances;
            },
            1 // Normal priority
        );
    }

    /**
     * Get only SOL balance (faster, for quick checks)
     */
    async getSOLBalance(chatId: number): Promise<{ public: number; private: number } | null> {
        const cacheKey = `${chatId}:sol_balance`;
        
        const cached = balanceCache.get<{ public: number; private: number }>(cacheKey);
        if (cached) return cached;

        return globalRequestQueue.enqueue(
            String(chatId),
            async () => {
                const wallet = this.getWallet(chatId);
                const client = this.getClient(chatId);
                if (!wallet || !client) return null;

                const publicKey = new PublicKey(wallet.publicKey);

                const [publicSolBalance, privateSOLBalance] = await Promise.all([
                    this.connection.getBalance(publicKey),
                    client.getPrivateBalance()
                ]);

                const result = {
                    public: publicSolBalance,
                    private: privateSOLBalance.lamports,
                };

                balanceCache.set(cacheKey, result, 15000); // 15 second cache for SOL only
                return result;
            },
            2 // Higher priority for SOL-only checks
        );
    }

    /**
     * Invalidate balance cache for a user (call after deposit/withdraw)
     */
    invalidateBalanceCache(chatId: number): void {
        balanceCache.clearUser(String(chatId));
    }

    /**
     * Deposit SOL to Privacy Cash
     */
    async depositSOL(chatId: number, amountSOL: number): Promise<{ success: boolean; signature?: string; error?: string }> {
        const client = this.getClient(chatId);
        if (!client) {
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);
            const result = await client.deposit({ lamports });
            // Invalidate cache after successful deposit
            this.invalidateBalanceCache(chatId);
            return { success: true, signature: result.tx };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Deposit failed',
            };
        }
    }

    /**
     * Withdraw SOL from Privacy Cash
     */
    async withdrawSOL(
        chatId: number,
        amountSOL: number,
        recipientAddress?: string
    ): Promise<{ success: boolean; signature?: string; actualAmount?: number; fee?: number; error?: string }> {
        const client = this.getClient(chatId);
        if (!client) {
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);
            const result = await client.withdraw({
                lamports,
                recipientAddress,
            });
            // Invalidate cache after successful withdrawal
            this.invalidateBalanceCache(chatId);
            return {
                success: true,
                signature: result.tx,
                actualAmount: result.amount_in_lamports,
                fee: result.fee_in_lamports,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Withdrawal failed',
            };
        }
    }

    /**
     * Deposit SPL token to Privacy Cash
     */
    async depositSPL(
        chatId: number,
        symbol: TokenSymbol,
        amount: number
    ): Promise<{ success: boolean; signature?: string; error?: string }> {
        const client = this.getClient(chatId);
        if (!client) {
            return { success: false, error: 'Wallet not connected' };
        }

        const tokenInfo = SUPPORTED_TOKENS[symbol];
        if (!tokenInfo || symbol === 'SOL') {
            return { success: false, error: 'Invalid token' };
        }

        try {
            const result = await client.depositSPL({
                amount,
                mintAddress: new PublicKey(tokenInfo.mintAddress),
            });
            // Invalidate cache after successful deposit
            this.invalidateBalanceCache(chatId);
            return { success: true, signature: result.tx };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Deposit failed',
            };
        }
    }

    /**
     * Withdraw SPL token from Privacy Cash
     */
    async withdrawSPL(
        chatId: number,
        symbol: TokenSymbol,
        amount: number,
        recipientAddress?: string
    ): Promise<{ success: boolean; signature?: string; error?: string }> {
        const client = this.getClient(chatId);
        if (!client) {
            return { success: false, error: 'Wallet not connected' };
        }

        const tokenInfo = SUPPORTED_TOKENS[symbol];
        if (!tokenInfo || symbol === 'SOL') {
            return { success: false, error: 'Invalid token' };
        }

        try {
            const result = await client.withdrawSPL({
                amount,
                mintAddress: new PublicKey(tokenInfo.mintAddress),
                recipientAddress,
            });
            // Invalidate cache after successful withdrawal
            this.invalidateBalanceCache(chatId);
            return { success: true, signature: result.tx };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Withdrawal failed',
            };
        }
    }

    /**
     * Toggle balance monitoring for a user
     */
    toggleMonitoring(chatId: number, enabled: boolean): boolean {
        const wallet = this.userWallets.get(chatId);
        if (!wallet) return false;

        wallet.monitoringEnabled = enabled;
        this.saveWallet(wallet);
        return true;
    }

    /**
     * Get all users with monitoring enabled
     */
    getMonitoredUsers(): UserWallet[] {
        return Array.from(this.userWallets.values()).filter(w => w.monitoringEnabled);
    }

    /**
     * Clear cache for a user
     */
    async clearCache(chatId: number): Promise<boolean> {
        const client = this.getClient(chatId);
        if (!client) return false;

        await client.clearCache();
        return true;
    }
}
