import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import { WalletService, BalanceInfo } from './walletService.js';
import { config, SUPPORTED_TOKENS, TokenSymbol } from '../config.js';
import { formatBalanceChange } from '../utils.js';

interface StoredBalances {
    [chatId: number]: BalanceInfo;
}

/**
 * Service to monitor balance changes and send notifications
 */
export class BalanceMonitor {
    private walletService: WalletService;
    private bot: Telegraf;
    private previousBalances: StoredBalances = {};
    private cronJob: cron.ScheduledTask | null = null;
    private isRunning = false;

    constructor(walletService: WalletService, bot: Telegraf) {
        this.walletService = walletService;
        this.bot = bot;
    }

    /**
     * Start the balance monitoring service
     */
    start(): void {
        if (this.cronJob) {
            console.log('Balance monitor already running');
            return;
        }

        const intervalMinutes = config.balanceMonitor.checkIntervalMinutes;
        const cronExpression = `*/${intervalMinutes} * * * *`;

        console.log(`Starting balance monitor with ${intervalMinutes} minute interval`);

        this.cronJob = cron.schedule(cronExpression, async () => {
            await this.checkAllBalances();
        });

        // Also do an initial check
        this.checkAllBalances().catch(console.error);
    }

    /**
     * Stop the balance monitoring service
     */
    stop(): void {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
            console.log('Balance monitor stopped');
        }
    }

    /**
     * Check balances for all monitored users
     */
    private async checkAllBalances(): Promise<void> {
        if (this.isRunning) {
            console.log('Balance check already in progress, skipping...');
            return;
        }

        this.isRunning = true;
        console.log('Checking balances for monitored users...');

        try {
            const monitoredUsers = this.walletService.getMonitoredUsers();
            console.log(`Found ${monitoredUsers.length} users with monitoring enabled`);

            for (const user of monitoredUsers) {
                try {
                    await this.checkUserBalance(user.chatId);
                    // Small delay between users to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Error checking balance for user ${user.chatId}:`, error);
                }
            }
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Check balance for a specific user and send notification if changed
     */
    private async checkUserBalance(chatId: number): Promise<void> {
        const currentBalances = await this.walletService.getBalances(chatId);
        if (!currentBalances) return;

        const previousBalances = this.previousBalances[chatId];
        
        if (!previousBalances) {
            // First check, just store the balances
            this.previousBalances[chatId] = currentBalances;
            return;
        }

        const changes: string[] = [];

        // Check SOL private balance change
        if (currentBalances.sol.private !== previousBalances.sol.private) {
            changes.push(
                formatBalanceChange(
                    'SOL (Private)',
                    previousBalances.sol.private,
                    currentBalances.sol.private,
                    SUPPORTED_TOKENS.SOL.unitsPerToken
                )
            );
        }

        // Check SOL public balance change
        if (currentBalances.sol.public !== previousBalances.sol.public) {
            changes.push(
                formatBalanceChange(
                    'SOL (Public)',
                    previousBalances.sol.public,
                    currentBalances.sol.public,
                    SUPPORTED_TOKENS.SOL.unitsPerToken
                )
            );
        }

        // Check token balances
        for (const [symbol, tokenInfo] of Object.entries(SUPPORTED_TOKENS)) {
            if (symbol === 'SOL') continue;

            const tokenSymbol = symbol as TokenSymbol;
            const current = currentBalances.tokens[tokenSymbol];
            const previous = previousBalances.tokens[tokenSymbol];

            if (!current || !previous) continue;

            // Check private balance
            if (current.private !== previous.private) {
                changes.push(
                    formatBalanceChange(
                        `${symbol} (Private)`,
                        previous.private,
                        current.private,
                        tokenInfo.unitsPerToken
                    )
                );
            }

            // Check public balance
            if (current.public !== previous.public) {
                changes.push(
                    formatBalanceChange(
                        `${symbol} (Public)`,
                        previous.public,
                        current.public,
                        tokenInfo.unitsPerToken
                    )
                );
            }
        }

        // Update stored balances
        this.previousBalances[chatId] = currentBalances;

        // Send notifications
        if (changes.length > 0) {
            const message = `🔔 *Balance Alert*\n\n${changes.join('\n\n')}`;
            try {
                await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            } catch (error) {
                console.error(`Failed to send notification to ${chatId}:`, error);
            }
        }
    }

    /**
     * Force refresh balances for a user (useful after transactions)
     */
    async refreshUserBalance(chatId: number): Promise<void> {
        const balances = await this.walletService.getBalances(chatId);
        if (balances) {
            this.previousBalances[chatId] = balances;
        }
    }

    /**
     * Clear stored balances for a user (when disconnecting)
     */
    clearUserBalance(chatId: number): void {
        delete this.previousBalances[chatId];
    }
}
