<<<<<<< HEAD
import { Telegraf } from 'telegraf';
import { config } from './config.js';
import { WalletService, BalanceMonitor } from './services/index.js';
import { registerCommands } from './commands/index.js';

console.log('🚀 Starting Privacy Cash Telegram Bot...');

// Validate configuration
if (!config.telegram.botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables!');
    process.exit(1);
}

// Initialize bot
const bot = new Telegraf(config.telegram.botToken);

// Initialize services
const walletService = new WalletService();
const balanceMonitor = new BalanceMonitor(walletService, bot);

// Register commands
registerCommands(bot, walletService, balanceMonitor);

// Error handling
bot.catch((err: any, ctx: any) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An error occurred. Please try again later.').catch(console.error);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    balanceMonitor.stop();
    bot.stop(signal);
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start bot
async function main() {
    try {
        // Start balance monitor
        balanceMonitor.start();

        // Launch bot
        await bot.launch();
        
        const botInfo = await bot.telegram.getMe();
        console.log(`✅ Bot started successfully!`);
        console.log(`📱 Bot username: @${botInfo.username}`);
        console.log(`🔗 Solana RPC: ${config.solana.rpcUrl}`);
        console.log(`⏰ Balance check interval: ${config.balanceMonitor.checkIntervalMinutes} minutes`);
        console.log(`\nBot is running. Press Ctrl+C to stop.`);
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

main();
=======
import { Telegraf } from 'telegraf';
import { config } from './config.js';
import { WalletService, BalanceMonitor } from './services/index.js';
import { registerCommands } from './commands/index.js';

console.log('🚀 Starting Privacy Cash Telegram Bot...');

// Validate configuration
if (!config.telegram.botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables!');
    process.exit(1);
}

// Initialize bot
const bot = new Telegraf(config.telegram.botToken);

// Initialize services
const walletService = new WalletService();
const balanceMonitor = new BalanceMonitor(walletService, bot);

// Register commands
registerCommands(bot, walletService, balanceMonitor);

// Error handling
bot.catch((err: any, ctx: any) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An error occurred. Please try again later.').catch(console.error);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    balanceMonitor.stop();
    bot.stop(signal);
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start bot
async function main() {
    try {
        // Start balance monitor
        balanceMonitor.start();

        // Launch bot
        await bot.launch();
        
        const botInfo = await bot.telegram.getMe();
        console.log(`✅ Bot started successfully!`);
        console.log(`📱 Bot username: @${botInfo.username}`);
        console.log(`🔗 Solana RPC: ${config.solana.rpcUrl}`);
        console.log(`⏰ Balance check interval: ${config.balanceMonitor.checkIntervalMinutes} minutes`);
        console.log(`\nBot is running. Press Ctrl+C to stop.`);
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

main();
>>>>>>> f9b25aa (fetch)
