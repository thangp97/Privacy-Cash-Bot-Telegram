import { Context, Markup } from 'telegraf';
import { WalletService, DepositResult } from '../services/walletService.js';
import { BalanceMonitor } from '../services/balanceMonitor.js';
import { parseNaturalLanguage, isNaturalLanguageCommand, generateConfirmationMessage, ParsedCommand } from '../services/nlpHandler.js';
import { scanQRFromBuffer, downloadFile, parseSolanaUri, isValidSolanaAddress } from '../services/qrService.js';
import { SUPPORTED_TOKENS, TokenSymbol, PRIVACY_CASH_FEES, calculateWithdrawFee, PCB_TOKEN_SYMBOL } from '../config.js';
import { formatSOL, formatToken, shortenAddress } from '../utils.js';
import { Language, t, getLanguageKeyboard, locales } from '../locales/index.js';
import pcbGate from '../services/pcbGate.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Banner path - go up from dist/commands to project root, then to src/assets/images
const BANNER_PATH = path.join(__dirname, '../../src/assets/images/banner.png');

// Cache banner file_id to avoid re-uploading
let cachedBannerFileId: string | null = null;

// Rate limiting for /start command
const startCommandCooldown: Map<number, number> = new Map();
const START_COOLDOWN_MS = 3000; // 3 seconds cooldown

// Store pending NLP commands for confirmation
const pendingNLPCommands: Map<number, ParsedCommand> = new Map();

// Helper function to convert Markdown formatting to HTML
function markdownToHtml(text: string): string {
    // Convert *bold* to <b>bold</b>
    return text.replace(/\*([^*]+)\*/g, '<b>$1</b>');
}

// User state management for multi-step operations
interface MultiSendRecipient {
    address: string;
    amount: number;
}

interface UserState {
    action?: 'shield' | 'unshield' | 'private_transfer' | 'connect' | 'multi_private_send';
    token?: TokenSymbol;
    amount?: number;
    step?: 'select_token' | 'enter_amount' | 'enter_address' | 'enter_private_key' | 'confirm' | 'enter_recipients';
    recipientAddress?: string;
    // Multi private send fields
    multiRecipients?: MultiSendRecipient[];
}

const userStates: Map<number, UserState> = new Map();
const userLanguages: Map<number, Language> = new Map();

/**
 * Get user's language
 */
function getLang(chatId: number): Language {
    return userLanguages.get(chatId) || 'en';
}

/**
 * Get main menu keyboard
 */
function getMainMenuKeyboard(hasWallet: boolean, lang: Language) {
    if (hasWallet) {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback(t(lang, 'menu_balance'), 'action_balance'),
                Markup.button.callback(t(lang, 'menu_private_balance'), 'action_private_balance')
            ],
            [
                Markup.button.callback(t(lang, 'menu_shield'), 'action_shield'),
                Markup.button.callback(t(lang, 'menu_unshield'), 'action_unshield')
            ],
            [
                Markup.button.callback(t(lang, 'menu_private_transfer'), 'action_private_transfer'),
                Markup.button.callback(t(lang, 'menu_multi_private_send'), 'action_multi_private_send')
            ],
            [
                Markup.button.callback(t(lang, 'menu_wallet_info'), 'action_wallet'),
                Markup.button.callback(t(lang, 'menu_tokens'), 'action_tokens')
            ],
            [
                Markup.button.callback(t(lang, 'menu_monitor_on'), 'action_monitor'),
                Markup.button.callback(t(lang, 'menu_monitor_off'), 'action_stop_monitor')
            ],
            [
                Markup.button.callback(t(lang, 'menu_export_key'), 'action_export_key'),
                Markup.button.callback(t(lang, 'menu_language'), 'action_language')
            ],
            [
                Markup.button.callback(t(lang, 'menu_disconnect'), 'action_disconnect')
            ]
        ]);
    } else {
        return Markup.inlineKeyboard([
            [Markup.button.callback(t(lang, 'wallet_create_new'), 'action_create_wallet')],
            [Markup.button.callback(t(lang, 'wallet_import'), 'action_import_wallet')],
            [Markup.button.callback(t(lang, 'menu_tokens'), 'action_tokens')],
            [
                Markup.button.callback(t(lang, 'menu_language'), 'action_language'),
                Markup.button.callback(t(lang, 'menu_help'), 'action_help')
            ]
        ]);
    }
}

/**
 * Get token selection keyboard for shield
 */
function getShieldTokenKeyboard(lang: Language) {
    const buttons = Object.entries(SUPPORTED_TOKENS).map(([symbol, info]) => 
        Markup.button.callback(`${info.icon} ${symbol}`, `shield_token_${symbol}`)
    );
    
    // Arrange in rows of 3
    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(buttons.slice(i, i + 3));
    }
    rows.push([Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]);
    
    return Markup.inlineKeyboard(rows);
}

/**
 * Get token selection keyboard for unshield
 */
function getUnshieldTokenKeyboard(lang: Language) {
    const buttons = Object.entries(SUPPORTED_TOKENS).map(([symbol, info]) => 
        Markup.button.callback(`${info.icon} ${symbol}`, `unshield_token_${symbol}`)
    );
    
    // Arrange in rows of 3
    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(buttons.slice(i, i + 3));
    }
    rows.push([Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]);
    
    return Markup.inlineKeyboard(rows);
}

/**
 * Get token selection keyboard for private transfer
 */
function getPrivateTransferTokenKeyboard(lang: Language) {
    const buttons = Object.entries(SUPPORTED_TOKENS).map(([symbol, info]) => 
        Markup.button.callback(`${info.icon} ${symbol}`, `ptransfer_token_${symbol}`)
    );
    
    // Arrange in rows of 3
    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(buttons.slice(i, i + 3));
    }
    rows.push([Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]);
    
    return Markup.inlineKeyboard(rows);
}

/**
 * Get token selection keyboard for multi private send
 */
function getMultiPrivateSendTokenKeyboard(lang: Language) {
    const buttons = Object.entries(SUPPORTED_TOKENS).map(([symbol, info]) => 
        Markup.button.callback(`${info.icon} ${symbol}`, `multi_send_token_${symbol}`)
    );
    
    // Arrange in rows of 3
    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(buttons.slice(i, i + 3));
    }
    rows.push([Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]);
    
    return Markup.inlineKeyboard(rows);
}

/**
 * Get unshield destination keyboard
 */
function getUnshieldDestinationKeyboard(lang: Language) {
    return Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, 'unshield_to_self'), 'unshield_to_self')],
        [Markup.button.callback(t(lang, 'unshield_to_other'), 'unshield_to_other')],
        [Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]
    ]);
}

/**
 * Get confirmation keyboard
 */
function getConfirmKeyboard(action: string, lang: Language) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(t(lang, 'confirm'), `confirm_${action}`),
            Markup.button.callback(t(lang, 'cancel'), 'action_cancel')
        ]
    ]);
}

/**
 * Get back to menu keyboard
 */
function getBackToMenuKeyboard(lang: Language) {
    return Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, 'back_to_menu'), 'action_menu')]
    ]);
}

/**
 * Get balance keyboard with refresh and back buttons
 */
function getBalanceKeyboard(lang: Language, isPrivate: boolean = false) {
    const refreshAction = isPrivate ? 'action_private_balance' : 'action_balance';
    return Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, 'refresh_balance'), refreshAction)],
        [Markup.button.callback(t(lang, 'back_to_menu'), 'action_menu')]
    ]);
}

/**
 * Safe edit or reply - handles both text messages and photo messages
 * When the original message is a photo (has caption), we delete it and send a new text message
 * When the original message is text, we edit it
 */
async function safeEditOrReply(ctx: Context, text: string, extra: any = {}): Promise<any> {
    try {
        // Try to edit the message text first
        return await ctx.editMessageText(text, extra);
    } catch (error: any) {
        // If it fails because it's a photo message, delete and send new
        if (error?.description?.includes('no text in the message') || 
            error?.description?.includes('message to edit not found')) {
            try {
                // Try to delete the original message
                await ctx.deleteMessage().catch(() => {});
            } catch {}
            // Send a new message
            return await ctx.reply(text, extra);
        }
        throw error;
    }
}

// Safe reply that ignores 'bot blocked by the user' errors
async function sendSafeReply(ctx: Context, text: string, extra: any = {}): Promise<any> {
    try {
        return await ctx.reply(text, extra);
    } catch (err: any) {
        // Telegram 403 when bot is blocked
        const code = err?.response?.error_code;
        const desc = err?.response?.description || '';
        if (code === 403 && desc.toLowerCase().includes('bot was blocked')) {
            // swallow silently
            console.warn(`sendSafeReply: bot blocked by user; chat ${ctx.chat?.id}`);
            return;
        }
        console.error('sendSafeReply error:', err?.message || err);
    }
}

/**
 * Get language selection keyboard
 */
function getLanguageSelectionKeyboard() {
    return Markup.inlineKeyboard(getLanguageKeyboard());
}

/**
 * Register all command handlers
 */
export function registerCommands(
    bot: any,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): void {
    // Global middleware: require PCB eligibility for most interactions
    bot.use(async (ctx: Context, next: any) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        // Only allow: /start, /help, /language, Wallet Info, Export Private Key, Create New Wallet
        const messageText = (ctx.message as any)?.text || '';
        if (typeof messageText === 'string' && (
            messageText.startsWith('/start') ||
            messageText.startsWith('/help') ||
            messageText.startsWith('/language') ||
            messageText.startsWith('/wallet') ||
            messageText.startsWith('/export') ||
            messageText.startsWith('/connect') ||
            messageText.startsWith('/disconnect') ||
            messageText.startsWith('/tokens')
        )) {
            return await next();
        }

        // Only allow: language, menu, Wallet Info, Export Private Key, Create New Wallet actions
        const cbData = (ctx.callbackQuery as any)?.data;
        if (cbData && (
            cbData.startsWith('lang_') ||
            cbData === 'action_language' ||
            cbData === 'action_menu' ||
            cbData === 'action_create_wallet' ||
            cbData === 'action_export_key' ||
            cbData === 'confirm_export_key' ||
            cbData === 'action_wallet' ||
            cbData === 'action_connect' ||
            cbData === 'action_import_wallet' ||
            cbData === 'action_disconnect' ||
            cbData === 'confirm_disconnect' ||
            cbData === 'action_tokens'
        )) {
            return await next();
        }

        try {
            const res = await pcbGate.checkPCBEligibility(walletService, chatId, 1_000_000, 3);
            if (res.eligible) {
                return await next();
            }

            // If private check failed due to error (e.g., rate limit), log it and fallback to public-only check
            if (res.error) {
                console.error(`[PCB] private check error for chat ${chatId}:`, res.error);
                try {
                    const pcbSymbol: TokenSymbol = PCB_TOKEN_SYMBOL as TokenSymbol;
                    const publicBalances = await walletService.getBalances(chatId, false);
                    if (publicBalances) {
                        const info = SUPPORTED_TOKENS[pcbSymbol];
                        if (info) {
                            const tokenEntry = publicBalances.tokens?.[pcbSymbol] as { publicRaw?: number; public?: number } | undefined;
                            const rawUnits = tokenEntry?.publicRaw ?? tokenEntry?.public ?? 0;
                            const publicAmount = rawUnits / (info.unitsPerToken || 1);
                            if (publicAmount >= 1_000_000) {
                                return await next();
                            }
                            const lang = getLang(chatId);
                            const tokenLabel = info.symbol || 'PCB';
                            const wallet = walletService.getWallet(chatId);
                            if (wallet) {
                                const needed = Math.max(0, 1_000_000 - publicAmount);
                                await sendSafeReply(ctx, t(lang, 'error_pcb_insufficient', { token: tokenLabel, address: wallet.publicKey, amount: needed }), getMainMenuKeyboard(true, lang));
                            } else {
                                await sendSafeReply(ctx, t(lang, 'error_pcb_insufficient', { token: tokenLabel }), getMainMenuKeyboard(false, lang));
                            }
                            return;
                        }
                    }
                } catch (innerErr) {
                    // ignore and fall through to generic error message
                }
                const lang = getLang(chatId);
                const pcbSymbol: TokenSymbol = PCB_TOKEN_SYMBOL as TokenSymbol;
                const tokenLabel = SUPPORTED_TOKENS[pcbSymbol]?.symbol || 'PCB';
                console.error(`[PCB] sending generic failure message to chat ${chatId} due to private-check error`);
                await sendSafeReply(ctx, t(lang, 'error_pcb_check_failed', { token: tokenLabel }), getMainMenuKeyboard(walletService.hasWallet(chatId), lang));
                return;
            }

            // Private check completed but user is not eligible
            const lang = getLang(chatId);
            const pcbSymbol: TokenSymbol = PCB_TOKEN_SYMBOL as TokenSymbol;
            const tokenLabel = SUPPORTED_TOKENS[pcbSymbol]?.symbol || 'PCB';
            try {
                const publicBalances = await walletService.getBalances(chatId, false);
                if (publicBalances) {
                    const info = SUPPORTED_TOKENS[pcbSymbol];
                    if (info) {
                        const tokenEntry = publicBalances.tokens?.[pcbSymbol] as { publicRaw?: number; public?: number } | undefined;
                        const rawUnits = tokenEntry?.publicRaw ?? tokenEntry?.public ?? 0;
                        const publicAmount = rawUnits / (info.unitsPerToken || 1);
                        const wallet = walletService.getWallet(chatId);
                        if (wallet) {
                            const needed = Math.max(0, 1_000_000 - publicAmount);
                            await sendSafeReply(ctx, t(lang, 'error_pcb_insufficient', { token: tokenLabel, address: wallet.publicKey, amount: needed }), getMainMenuKeyboard(true, lang));
                            return;
                        }
                    }
                }
            }
            catch (e) {
                // ignore and fall back to generic message below
            }
            await sendSafeReply(ctx, t(lang, 'error_pcb_insufficient', { token: tokenLabel }), getMainMenuKeyboard(walletService.hasWallet(chatId), lang));
            return;
        } catch (e) {
            // On unexpected errors, log and try public-only check before failing
            console.error(`[PCB] unexpected error for chat ${chatId}:`, e);
            try {
                const publicBalances = await walletService.getBalances(chatId, false);
                if (publicBalances) {
                    const pcbSymbol: TokenSymbol = PCB_TOKEN_SYMBOL as TokenSymbol;
                    const info = SUPPORTED_TOKENS[pcbSymbol];
                    if (info) {
                        const tokenEntry = publicBalances.tokens?.[pcbSymbol] as { publicRaw?: number; public?: number } | undefined;
                        const rawUnits = tokenEntry?.publicRaw ?? tokenEntry?.public ?? 0;
                        const publicAmount = rawUnits / (info.unitsPerToken || 1);
                        if (publicAmount >= 1_000_000) {
                            return await next();
                        }
                        const lang = getLang(chatId);
                        const tokenLabel = info.symbol || 'PCB';
                        const wallet = walletService.getWallet(chatId);
                        if (wallet) {
                            const needed = Math.max(0, 1_000_000 - publicAmount);
                            await sendSafeReply(ctx, t(lang, 'error_pcb_insufficient', { token: tokenLabel, address: wallet.publicKey, amount: needed }), getMainMenuKeyboard(true, lang));
                            return;
                        }
                    }
                    const lang2 = getLang(chatId);
                    const pcbSymbol2: TokenSymbol = PCB_TOKEN_SYMBOL as TokenSymbol;
                    const tokenLabel2 = SUPPORTED_TOKENS[pcbSymbol2]?.symbol || 'PCB';
                    await sendSafeReply(ctx, t(lang2, 'error_pcb_insufficient', { token: tokenLabel2 }), getMainMenuKeyboard(walletService.hasWallet(chatId), lang2));
                    return;
                }
            } catch (innerErr) {
                // ignore
            }

            const lang2 = getLang(chatId);
            const pcbSymbol2: TokenSymbol = PCB_TOKEN_SYMBOL as TokenSymbol;
            const tokenLabel2 = SUPPORTED_TOKENS[pcbSymbol2]?.symbol || 'PCB';
            console.error(`[PCB] final failure sending generic message to chat ${chatId}`);
            await sendSafeReply(ctx, t(lang2, 'error_pcb_check_failed', { token: tokenLabel2 }), getMainMenuKeyboard(walletService.hasWallet(chatId), lang2));
            return;
        }
    });
    // Start command
    bot.command('start', (ctx: Context) => handleStart(ctx, walletService));

    // Help command
    bot.command('help', (ctx: Context) => handleHelp(ctx));

    // Language command
    bot.command('language', (ctx: Context) => handleLanguageCommand(ctx, walletService));

    // Wallet commands
    bot.command('connect', (ctx: Context) => handleConnect(ctx, walletService));
    bot.command('disconnect', (ctx: Context) => handleDisconnect(ctx, walletService, balanceMonitor));
    bot.command('wallet', (ctx: Context) => handleWalletInfo(ctx, walletService));

    // Balance commands
    bot.command('balance', (ctx: Context) => handleBalance(ctx, walletService));
    bot.command('privatebalance', (ctx: Context) => handlePrivateBalance(ctx, walletService));

    // Deposit commands
    bot.command('deposit', (ctx: Context) => handleDeposit(ctx, walletService, balanceMonitor));
    bot.command('depositsol', (ctx: Context) => handleDepositSOL(ctx, walletService, balanceMonitor));
    bot.command('deposittoken', (ctx: Context) => handleDepositToken(ctx, walletService, balanceMonitor));

    // Withdraw commands
    bot.command('withdraw', (ctx: Context) => handleWithdraw(ctx, walletService, balanceMonitor));
    bot.command('withdrawsol', (ctx: Context) => handleWithdrawSOL(ctx, walletService, balanceMonitor));
    bot.command('withdrawtoken', (ctx: Context) => handleWithdrawToken(ctx, walletService, balanceMonitor));

    // Private transfer commands
    bot.command('transfer', (ctx: Context) => handlePrivateTransfer(ctx, walletService));
    bot.command('multisend', (ctx: Context) => handleMultiPrivateSend(ctx, walletService));

    // Monitoring commands
    bot.command('monitor', (ctx: Context) => handleMonitor(ctx, walletService));
    bot.command('stopmonitor', (ctx: Context) => handleStopMonitor(ctx, walletService));

    // Utility commands
    bot.command('tokens', (ctx: Context) => handleTokens(ctx));
    bot.command('clearcache', (ctx: Context) => handleClearCache(ctx, walletService));
    bot.command('menu', (ctx: Context) => handleMenu(ctx, walletService));

    // ==================== CALLBACK QUERY HANDLERS ====================

    // Language selection handlers
    bot.action('action_language', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        
        await safeEditOrReply(ctx,
            `${t(lang, 'language_title')}\n\n${t(lang, 'language_select')}`,
            { parse_mode: 'Markdown', ...getLanguageSelectionKeyboard() }
        );
    });

    bot.action('lang_vi', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        
        userLanguages.set(chatId, 'en');
        const lang: Language = 'en';
        const hasWallet = walletService.hasWallet(chatId);
        
        await safeEditOrReply(ctx,
            `${locales[lang].languageFlag} ${t(lang, 'language_changed')}\n\n${t(lang, 'menu_title')}`,
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
        );
    });

    bot.action('lang_en', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        
        userLanguages.set(chatId, 'en');
        const lang: Language = 'en';
        const hasWallet = walletService.hasWallet(chatId);
        
        await safeEditOrReply(ctx,
            `${locales[lang].languageFlag} ${t(lang, 'language_changed')}\n\n${t(lang, 'menu_title')}`,
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
        );
    });

    bot.action('lang_zh', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        
        userLanguages.set(chatId, 'zh');
        const lang: Language = 'zh';
        const hasWallet = walletService.hasWallet(chatId);
        
        await safeEditOrReply(ctx,
            `${locales[lang].languageFlag} ${t(lang, 'language_changed')}\n\n${t(lang, 'menu_title')}`,
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
        );
    });

    // Main menu actions
    bot.action('action_menu', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const hasWallet = walletService.hasWallet(chatId);
        const lang = getLang(chatId);
        await safeEditOrReply(ctx,
            t(lang, 'menu_title'),
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
        );
    });

    bot.action('action_connect', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        userStates.set(chatId, { action: 'connect', step: 'enter_private_key' });
        await safeEditOrReply(ctx,
            `${t(lang, 'connect_title')}\n\n` +
            `${t(lang, 'connect_instruction')}\n\n` +
            `${t(lang, 'connect_security_note')}\n` +
            `${t(lang, 'connect_security_1')}\n` +
            `${t(lang, 'connect_security_2')}\n` +
            `${t(lang, 'connect_security_3')}`,
            { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
        );
    });

    // Create new wallet action
    bot.action('action_create_wallet', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        // Check if user already has a wallet
        if (walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx,
                t(lang, 'menu_title'),
                { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
            );
            return;
        }

        await safeEditOrReply(ctx, t(lang, 'wallet_creating'), { parse_mode: 'Markdown' });

        const result = await walletService.createNewWallet(chatId);

        if (result.success && result.publicKey && result.privateKey) {
            const message = markdownToHtml(
                `${t(lang, 'wallet_created_title')}\n\n` +
                `${t(lang, 'wallet_created_address')}\n`) +
                `<code>${result.publicKey}</code>\n\n` +
                markdownToHtml(`${t(lang, 'wallet_created_private_key')}\n`) +
                `<tg-spoiler><code>${result.privateKey}</code></tg-spoiler>\n\n` +
                markdownToHtml(
                    `${t(lang, 'wallet_created_warning')}\n` +
                    `${t(lang, 'wallet_created_warning_1')}\n` +
                    `${t(lang, 'wallet_created_warning_2')}\n` +
                    `${t(lang, 'wallet_created_warning_3')}\n` +
                    `${t(lang, 'wallet_created_warning_4')}`);

            const sentMsg = await safeEditOrReply(ctx, message, { parse_mode: 'HTML', ...getMainMenuKeyboard(true, lang) });

            // Auto-delete the message with private key after 60 seconds for security
            setTimeout(async () => {
                try {
                    // Send a new message without the private key
                    await ctx.telegram.editMessageText(
                        chatId,
                        // @ts-ignore
                        sentMsg.message_id,
                        undefined,
                        `${t(lang, 'wallet_created_title')}\n\n` +
                        `${t(lang, 'wallet_created_address')}\n\`${result.publicKey}\`\n\n` +
                        `${t(lang, 'connect_success_monitoring')}`,
                        { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                    );
                } catch (e) {
                    // Message might have been deleted or edited already
                }
            }, 60000);
        } else {
            await safeEditOrReply(ctx,
                `${t(lang, 'connect_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                { parse_mode: 'Markdown', ...getMainMenuKeyboard(false, lang) }
            );
        }
    });

    // Import existing wallet action
    bot.action('action_import_wallet', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        // Check if user already has a wallet
        if (walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx,
                t(lang, 'menu_title'),
                { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
            );
            return;
        }

        userStates.set(chatId, { action: 'connect', step: 'enter_private_key' });
        await safeEditOrReply(ctx,
            `${t(lang, 'wallet_import_title')}\n\n` +
            `${t(lang, 'wallet_import_instruction')}\n\n` +
            `${t(lang, 'connect_security_note')}\n` +
            `${t(lang, 'connect_security_1')}\n` +
            `${t(lang, 'connect_security_2')}\n` +
            `${t(lang, 'connect_security_3')}`,
            { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
        );
    });

    bot.action('action_disconnect', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        
        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getBackToMenuKeyboard(lang));
            return;
        }

        await safeEditOrReply(ctx,
            `${t(lang, 'disconnect_confirm_title')}\n\n${t(lang, 'disconnect_confirm_message')}`,
            { parse_mode: 'Markdown', ...getConfirmKeyboard('disconnect', lang) }
        );
    });

    bot.action('confirm_disconnect', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        walletService.disconnectWallet(chatId);
        balanceMonitor.clearUserBalance(chatId);
        userStates.delete(chatId);

        await safeEditOrReply(ctx,
            `${t(lang, 'disconnect_success')}\n\n${t(lang, 'disconnect_success_message')}`,
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(false, lang) }
        );
    });

    // Export private key action
    bot.action('action_export_key', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        // Show confirmation warning
        await safeEditOrReply(ctx,
            `${t(lang, 'export_key_warning_title')}\n\n` +
            `${t(lang, 'export_key_warning_1')}\n` +
            `${t(lang, 'export_key_warning_2')}\n` +
            `${t(lang, 'export_key_warning_3')}\n\n` +
            `${t(lang, 'export_key_confirm_question')}`,
            { parse_mode: 'Markdown', ...Markup.inlineKeyboard([
                [Markup.button.callback(t(lang, 'export_key_confirm_yes'), 'confirm_export_key')],
                [Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]
            ]) }
        );
    });

    // Confirm export private key
    bot.action('confirm_export_key', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        const wallet = walletService.getWallet(chatId);
        if (!wallet) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        const message = markdownToHtml(`${t(lang, 'export_key_title')}\n\n` +
            `${t(lang, 'wallet_created_address')}\n`) +
            `<code>${wallet.publicKey}</code>\n\n` +
            markdownToHtml(`${t(lang, 'wallet_created_private_key')}\n`) +
            `<tg-spoiler><code>${wallet.privateKey}</code></tg-spoiler>\n\n` +
            markdownToHtml(`${t(lang, 'export_key_auto_delete')}`);

        const sentMsg = await safeEditOrReply(ctx, message, { parse_mode: 'HTML', ...getBackToMenuKeyboard(lang) });

        // Auto-delete after 60 seconds for security
        setTimeout(async () => {
            try {
                await ctx.telegram.editMessageText(
                    chatId,
                    // @ts-ignore
                    sentMsg.message_id,
                    undefined,
                    `${t(lang, 'export_key_deleted')}\n\n${t(lang, 'menu_title')}`,
                    { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                );
            } catch (e) {
                // Message might have been deleted or edited already
            }
        }, 60000);
    });

    bot.action('action_balance', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);
        await ctx.answerCbQuery(t(lang, 'balance_loading'));
        
        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        await safeEditOrReply(ctx, t(lang, 'balance_loading'), { parse_mode: 'Markdown' });
        
        try {
            const balances = await walletService.getBalances(chatId);
            if (!balances) {
                await safeEditOrReply(ctx, t(lang, 'balance_failed'), getBackToMenuKeyboard(lang));
                return;
            }

            let message = `${t(lang, 'balance_title')}\n\n`;
            
            // SOL
            message += `*${SUPPORTED_TOKENS.SOL.icon} SOL*\n`;
            message += `  ${t(lang, 'balance_public')} \`${formatSOL(balances.sol.public)}\` SOL\n`;
            message += `  ${t(lang, 'balance_private')} \`${formatSOL(balances.sol.private)}\` SOL\n\n`;

            // Tokens
            for (const [symbol, tokenInfo] of Object.entries(SUPPORTED_TOKENS)) {
                if (symbol === 'SOL') continue;

                const tokenBalance = balances.tokens[symbol as TokenSymbol];
                if (tokenBalance && (tokenBalance.public > 0 || tokenBalance.private > 0)) {
                    message += `*${tokenInfo.icon} ${symbol}*\n`;
                    message += `  ${t(lang, 'balance_public')} \`${formatToken(tokenBalance.public, symbol as TokenSymbol)}\` ${symbol}\n`;
                    message += `  ${t(lang, 'balance_private')} \`${formatToken(tokenBalance.private, symbol as TokenSymbol)}\` ${symbol}\n\n`;
                }
            }

            await safeEditOrReply(ctx, message, { parse_mode: 'Markdown', ...getBalanceKeyboard(lang, false) });
        } catch (error) {
            await safeEditOrReply(ctx,
                `${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                getBalanceKeyboard(lang, false)
            );
        }
    });

    bot.action('action_private_balance', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);
        await ctx.answerCbQuery(t(lang, 'loading'));
        
        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        await safeEditOrReply(ctx, t(lang, 'balance_loading'), { parse_mode: 'Markdown' });
        
        try {
            const balances = await walletService.getBalances(chatId);
            if (!balances) {
                await safeEditOrReply(ctx, t(lang, 'balance_failed'), getBackToMenuKeyboard(lang));
                return;
            }

            let message = `${t(lang, 'private_balance_title')}\n\n`;
            message += `*${SUPPORTED_TOKENS.SOL.icon} SOL:* \`${formatSOL(balances.sol.private)}\` SOL\n`;

            for (const [symbol, tokenInfo] of Object.entries(SUPPORTED_TOKENS)) {
                if (symbol === 'SOL') continue;
                const tokenBalance = balances.tokens[symbol as TokenSymbol];
                if (tokenBalance && tokenBalance.private > 0) {
                    message += `*${tokenInfo.icon} ${symbol}:* \`${formatToken(tokenBalance.private, symbol as TokenSymbol)}\` ${symbol}\n`;
                }
            }

            await safeEditOrReply(ctx, message, { parse_mode: 'Markdown', ...getBalanceKeyboard(lang, true) });
        } catch (error) {
            await safeEditOrReply(ctx,
                `${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                getBalanceKeyboard(lang, true)
            );
        }
    });

    bot.action('action_wallet', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        const wallet = walletService.getWallet(chatId);
        if (!wallet) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        await safeEditOrReply(ctx,
            `${t(lang, 'wallet_title')}\n\n` +
            `${t(lang, 'wallet_address')}\n\`${wallet.publicKey}\`\n\n` +
            `${t(lang, 'wallet_connected_date')} ${new Date(wallet.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'vi-VN')}\n` +
            `${t(lang, 'wallet_monitoring')} ${wallet.monitoringEnabled ? t(lang, 'wallet_monitoring_on') : t(lang, 'wallet_monitoring_off')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    });

    bot.action('action_tokens', async (ctx: Context) => {
        const chatId = ctx.chat?.id || 0;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        
        let message = `${t(lang, 'tokens_title')}\n\n`;

        for (const [symbol, info] of Object.entries(SUPPORTED_TOKENS)) {
            message += `${info.icon} *${symbol}* - ${info.name}\n`;
            message += `   ${t(lang, 'tokens_decimals')} ${info.decimals}\n`;
            message += `   ${t(lang, 'tokens_mint')} \`${shortenAddress(info.mintAddress, 6)}\`\n\n`;
        }

        await safeEditOrReply(ctx, message, { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) });
    });

    bot.action('action_help', async (ctx: Context) => {
        const chatId = ctx.chat?.id || 0;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        const hasWallet = walletService.hasWallet(chatId);
        
        const helpMessages: Record<Language, string> = {
            vi: '❓ *Hướng dẫn sử dụng*\n\n' +
                '*1. Kết nối ví:*\n' +
                '   Bấm "Kết nối ví" và gửi private key\n\n' +
                '*2. Nạp tiền:*\n' +
                '   Chọn "Nạp tiền" → Chọn token → Nhập số lượng\n\n' +
                '*3. Rút tiền:*\n' +
                '   Chọn "Rút tiền" → Chọn token → Nhập số lượng → Chọn địa chỉ\n\n' +
                '*4. Xem số dư:*\n' +
                '   Bấm "Số dư" để xem số dư công khai và riêng tư\n\n' +
                '⚠️ *Lưu ý:* Rút tiền từ Privacy Cash sẽ tính phí',
            en: '❓ *User Guide*\n\n' +
                '*1. Connect Wallet:*\n' +
                '   Click "Connect Wallet" and send your private key\n\n' +
                '*2. Deposit:*\n' +
                '   Select "Deposit" → Choose token → Enter amount\n\n' +
                '*3. Withdraw:*\n' +
                '   Select "Withdraw" → Choose token → Enter amount → Choose address\n\n' +
                '*4. Check Balance:*\n' +
                '   Click "Balance" to view public and private balances\n\n' +
                '⚠️ *Note:* Withdrawal from Privacy Cash incurs fees',
            zh: '❓ *使用指南*\n\n' +
                '*1. 连接钱包:*\n' +
                '   点击"连接钱包"并发送私钥\n\n' +
                '*2. 存款:*\n' +
                '   选择"存款" → 选择代币 → 输入数量\n\n' +
                '*3. 取款:*\n' +
                '   选择"取款" → 选择代币 → 输入数量 → 选择地址\n\n' +
                '*4. 查看余额:*\n' +
                '   点击"余额"查看公开和私密余额\n\n' +
                '⚠️ *注意:* 从 Privacy Cash 取款将收取费用'
        };
        
        await safeEditOrReply(ctx, helpMessages[lang], { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) });
    });

    bot.action('action_monitor', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        walletService.toggleMonitoring(chatId, true);
        await safeEditOrReply(ctx,
            `${t(lang, 'monitor_enabled_title')}\n\n${t(lang, 'monitor_enabled_message')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    });

    bot.action('action_stop_monitor', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        walletService.toggleMonitoring(chatId, false);
        await safeEditOrReply(ctx,
            `${t(lang, 'monitor_disabled_title')}\n\n${t(lang, 'monitor_disabled_message')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    });

    bot.action('action_cancel', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        userStates.delete(chatId);
        pendingNLPCommands.delete(chatId);
        const hasWallet = walletService.hasWallet(chatId);
        await safeEditOrReply(ctx,
            t(lang, 'cancelled'),
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
        );
    });

    // ==================== NLP CONFIRMATION HANDLERS ====================

    bot.action('nlp_confirm', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        const parsed = pendingNLPCommands.get(chatId);
        if (!parsed) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        pendingNLPCommands.delete(chatId);
        
        // Default token to SOL if not specified
        const token = parsed.token || 'SOL';

        // Execute the command based on intent
        if (parsed.intent === 'shield' && parsed.amount) {
            // Check public balance before shielding
            try {
                const balances = await walletService.getBalances(chatId, true);
                if (balances) {
                    let publicBalance = 0;
                    if (token === 'SOL') {
                        publicBalance = balances.sol.public;
                    } else {
                        publicBalance = balances.tokens[token]?.public || 0;
                    }

                    if (publicBalance < parsed.amount) {
                        await safeEditOrReply(ctx,
                            t(lang, 'error_insufficient_balance_shield', {
                                balance: publicBalance.toFixed(6),
                                token: token,
                                amount: parsed.amount.toString()
                            }),
                            { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                        );
                        return;
                    }
                }
            } catch (balanceError) {
                console.error('Error checking balance:', balanceError);
            }

            await safeEditOrReply(ctx, t(lang, 'shield_processing', { amount: parsed.amount, token: token }), { parse_mode: 'Markdown' });
            
            try {
                let result;
                if (token === 'SOL') {
                    result = await walletService.depositSOL(chatId, parsed.amount);
                } else {
                    result = await walletService.depositSPL(chatId, token, parsed.amount);
                }

                if (result.success) {
                    await ctx.reply(
                        `${t(lang, 'shield_success')}\n\n` +
                        `${t(lang, 'shield_success_amount', { amount: parsed.amount, token: token })}\n` +
                        `${t(lang, 'shield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n` +
                        `${t(lang, 'shield_success_link', { signature: result.signature || '' })}`,
                        { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                    );
                } else {
                    // Handle detailed error for shield
                    let errorMsg = `${t(lang, 'shield_failed')}\n\n${t(lang, 'error')} ${result.error}`;
                    if (result.errorCode === 'INSUFFICIENT_BALANCE' && result.details) {
                        const { required, available, shortfall, estimatedFee } = result.details;
                        const messages: Record<Language, string> = {
                            vi: `❌ *Không đủ số dư!*\n\n` +
                                `📊 *Chi tiết:*\n` +
                                `• Số dư hiện tại: \`${available.toFixed(6)} ${token}\`\n` +
                                `• Số lượng shield: \`${parsed.amount} ${token}\`\n` +
                                `• Phí giao dịch (ước tính): \`~${estimatedFee?.toFixed(4) || '0.003'} SOL\`\n` +
                                `• Tổng cần: \`${required.toFixed(6)} ${token}\`\n\n` +
                                `💰 *Cần nạp thêm:* \`${shortfall.toFixed(6)} ${token}\``,
                            en: `❌ *Insufficient balance!*\n\n` +
                                `📊 *Details:*\n` +
                                `• Current balance: \`${available.toFixed(6)} ${token}\`\n` +
                                `• Shield amount: \`${parsed.amount} ${token}\`\n` +
                                `• Transaction fee (estimated): \`~${estimatedFee?.toFixed(4) || '0.003'} SOL\`\n` +
                                `• Total required: \`${required.toFixed(6)} ${token}\`\n\n` +
                                `💰 *Need to add:* \`${shortfall.toFixed(6)} ${token}\``,
                            zh: `❌ *余额不足！*\n\n` +
                                `📊 *详情:*\n` +
                                `• 当前余额: \`${available.toFixed(6)} ${token}\`\n` +
                                `• Shield金额: \`${parsed.amount} ${token}\`\n` +
                                `• 交易费用（估计）: \`~${estimatedFee?.toFixed(4) || '0.003'} SOL\`\n` +
                                `• 需要总额: \`${required.toFixed(6)} ${token}\`\n\n` +
                                `💰 *需要充值:* \`${shortfall.toFixed(6)} ${token}\``,
                        };
                        errorMsg = messages[lang];
                    }
                    await ctx.reply(errorMsg, { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) });
                }
            } catch (error) {
                await ctx.reply(
                    `${t(lang, 'error')}\n\n${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                    { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                );
            }
        } else if ((parsed.intent === 'unshield' || parsed.intent === 'private_transfer') && parsed.amount) {
            const recipientAddress = parsed.address; // undefined for unshield to self
            
            // Check private balance before unshielding
            try {
                const balances = await walletService.getBalances(chatId, true);
                if (balances) {
                    let privateBalance = 0;
                    if (token === 'SOL') {
                        privateBalance = balances.sol.private;
                    } else {
                        privateBalance = balances.tokens[token]?.private || 0;
                    }

                    if (privateBalance < parsed.amount) {
                        await safeEditOrReply(ctx,
                            t(lang, 'error_insufficient_balance_unshield', {
                                balance: privateBalance.toFixed(6),
                                token: token,
                                amount: parsed.amount.toString()
                            }),
                            { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                        );
                        return;
                    }
                }
            } catch (balanceError) {
                console.error('Error checking balance:', balanceError);
            }

            await safeEditOrReply(ctx, t(lang, 'unshield_processing', { amount: parsed.amount, token: token }), { parse_mode: 'Markdown' });
            
            try {
                let result;
                if (token === 'SOL') {
                    result = await walletService.withdrawSOL(chatId, parsed.amount, recipientAddress);
                } else {
                    result = await walletService.withdrawSPL(chatId, token, parsed.amount, recipientAddress);
                }

                if (result.success) {
                    const wallet = walletService.getWallet(chatId);
                    const recipient = recipientAddress || wallet?.publicKey || '';
                    let message = `${t(lang, 'unshield_success')}\n\n`;
                    message += `${t(lang, 'unshield_success_to', { address: shortenAddress(recipient) })}\n`;
                    message += `${t(lang, 'unshield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n`;
                    message += `${t(lang, 'unshield_success_link', { signature: result.signature || '' })}`;

                    await ctx.reply(message, { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) });
                } else {
                    await ctx.reply(
                        `${t(lang, 'unshield_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                        { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                    );
                }
            } catch (error) {
                await ctx.reply(
                    `${t(lang, 'error')}\n\n${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                    { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                );
            }
        }
    });

    bot.action('nlp_cancel', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);
        
        pendingNLPCommands.delete(chatId);
        const hasWallet = walletService.hasWallet(chatId);
        
        await safeEditOrReply(ctx,
            t(lang, 'cancelled'),
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
        );
    });

    // ==================== SHIELD FLOW ====================

    bot.action('action_shield', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        userStates.set(chatId, { action: 'shield', step: 'select_token' });
        await safeEditOrReply(ctx,
            `${t(lang, 'shield_title')}\n\n${t(lang, 'shield_select_token')}`,
            { parse_mode: 'Markdown', ...getShieldTokenKeyboard(lang) }
        );
    });

    // Handle shield token selection
    for (const symbol of Object.keys(SUPPORTED_TOKENS)) {
        bot.action(`shield_token_${symbol}`, async (ctx: Context) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;
            await ctx.answerCbQuery();
            const lang = getLang(chatId);

            userStates.set(chatId, { 
                action: 'shield', 
                token: symbol as TokenSymbol, 
                step: 'enter_amount' 
            });

            const tokenInfo = SUPPORTED_TOKENS[symbol as TokenSymbol];
            await safeEditOrReply(ctx,
                `🛡️ *Shield ${symbol}*\n\n` +
                `${t(lang, 'shield_token_info', { name: tokenInfo.name, decimals: tokenInfo.decimals })}\n\n` +
                `${t(lang, 'shield_enter_amount', { token: symbol })}`,
                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
            );
        });
    }

    // ==================== UNSHIELD FLOW ====================

    bot.action('action_unshield', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        userStates.set(chatId, { action: 'unshield', step: 'select_token' });
        await safeEditOrReply(ctx,
            `${t(lang, 'unshield_title')}\n\n${t(lang, 'unshield_select_token')}`,
            { parse_mode: 'Markdown', ...getUnshieldTokenKeyboard(lang) }
        );
    });

    // Handle unshield token selection
    for (const symbol of Object.keys(SUPPORTED_TOKENS)) {
        bot.action(`unshield_token_${symbol}`, async (ctx: Context) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;
            await ctx.answerCbQuery();
            const lang = getLang(chatId);

            userStates.set(chatId, { 
                action: 'unshield', 
                token: symbol as TokenSymbol, 
                step: 'enter_amount' 
            });

            const tokenInfo = SUPPORTED_TOKENS[symbol as TokenSymbol];
            await safeEditOrReply(ctx,
                `📤 *Unshield ${symbol}*\n\n` +
                `Token: ${tokenInfo.name}\n\n` +
                `${t(lang, 'unshield_enter_amount', { token: symbol })}`,
                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
            );
        });
    }

    bot.action('unshield_to_self', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        const state = userStates.get(chatId);
        if (!state || state.action !== 'unshield' || !state.token || !state.amount) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        state.step = 'confirm';
        state.recipientAddress = undefined;
        userStates.set(chatId, state);

        const wallet = walletService.getWallet(chatId);
        await safeEditOrReply(ctx,
            `${t(lang, 'unshield_confirm_title')}\n\n` +
            `${t(lang, 'unshield_confirm_token', { token: state.token })}\n` +
            `${t(lang, 'unshield_confirm_amount', { amount: state.amount })}\n` +
            `${t(lang, 'unshield_confirm_to', { address: shortenAddress(wallet?.publicKey || '') })} ${t(lang, 'unshield_confirm_to_self')}\n\n` +
            `${t(lang, 'unshield_confirm_estimated_fee')}\n` +
            `${t(lang, 'unshield_confirm_fee_note')}`,
            { parse_mode: 'Markdown', ...getConfirmKeyboard('unshield', lang) }
        );
    });

    bot.action('unshield_to_other', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        const state = userStates.get(chatId);
        if (!state || state.action !== 'unshield' || !state.token || !state.amount) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        state.step = 'enter_address';
        userStates.set(chatId, state);

        await safeEditOrReply(ctx,
            `📤 *Unshield ${state.amount} ${state.token}*\n\n` +
            `${t(lang, 'unshield_enter_address')}`,
            { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
        );
    });

    bot.action('confirm_unshield', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);
        await ctx.answerCbQuery(t(lang, 'loading'));

        const state = userStates.get(chatId);
        if (!state || state.action !== 'unshield' || !state.token || !state.amount) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        // Check private balance before unshielding
        try {
            const balances = await walletService.getBalances(chatId, true);
            if (balances) {
                let privateBalance = 0;
                if (state.token === 'SOL') {
                    privateBalance = balances.sol.private;
                } else {
                    const tokenKey = state.token as TokenSymbol;
                    privateBalance = balances.tokens[tokenKey]?.private || 0;
                }

                if (privateBalance < state.amount) {
                    await safeEditOrReply(ctx,
                        t(lang, 'error_insufficient_balance_unshield', {
                            balance: privateBalance.toFixed(6),
                            token: state.token,
                            amount: state.amount.toString()
                        }),
                        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                    );
                    userStates.delete(chatId);
                    return;
                }
            }
        } catch (balanceError) {
            console.error('Error checking balance:', balanceError);
            // Continue with unshield even if balance check fails
        }

        await safeEditOrReply(ctx, t(lang, 'unshield_processing', { amount: state.amount, token: state.token }), { parse_mode: 'Markdown' });

        try {
            let result;
            if (state.token === 'SOL') {
                result = await walletService.withdrawSOL(chatId, state.amount, state.recipientAddress);
            } else {
                result = await walletService.withdrawSPL(chatId, state.token, state.amount, state.recipientAddress);
            }

            if (result.success) {
                await balanceMonitor.refreshUserBalance(chatId);
                const wallet = walletService.getWallet(chatId);
                const recipient = state.recipientAddress || wallet?.publicKey || '';
                
                let message = `${t(lang, 'unshield_success')}\n\n`;
                message += `${t(lang, 'unshield_success_token', { token: state.token })}\n`;
                message += `${t(lang, 'unshield_success_amount', { amount: state.amount })}\n`;
                
                if (state.token === 'SOL' && 'actualAmount' in result && 'fee' in result) {
                    const actualAmount = ((result.actualAmount as number) || 0) / 1e9;
                    const fee = ((result.fee as number) || 0) / 1e9;
                    message += `${t(lang, 'unshield_success_received', { amount: actualAmount.toFixed(6) })}\n`;
                    message += `${t(lang, 'unshield_success_fee', { fee: fee.toFixed(6) })}\n`;
                }
                
                message += `${t(lang, 'unshield_success_to', { address: shortenAddress(recipient) })}\n`;
                message += `${t(lang, 'unshield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n`;
                message += `${t(lang, 'unshield_success_link', { signature: result.signature || '' })}`;

                await safeEditOrReply(ctx, message, { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) });
            } else {
                await safeEditOrReply(ctx,
                    `${t(lang, 'unshield_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            }
        } catch (error) {
            await safeEditOrReply(ctx,
                `${t(lang, 'error')}\n\n${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }

        userStates.delete(chatId);
    });

    bot.action('confirm_shield', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);
        await ctx.answerCbQuery(t(lang, 'loading'));

        const state = userStates.get(chatId);
        if (!state || state.action !== 'shield' || !state.token || !state.amount) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        // Check public balance before shielding
        try {
            const balances = await walletService.getBalances(chatId, true);
            if (balances) {
                let publicBalance = 0;
                if (state.token === 'SOL') {
                    publicBalance = balances.sol.public;
                } else {
                    const tokenKey = state.token as TokenSymbol;
                    publicBalance = balances.tokens[tokenKey]?.public || 0;
                }

                if (publicBalance < state.amount) {
                    await safeEditOrReply(ctx,
                        t(lang, 'error_insufficient_balance_shield', {
                            balance: publicBalance.toFixed(6),
                            token: state.token,
                            amount: state.amount.toString()
                        }),
                        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                    );
                    userStates.delete(chatId);
                    return;
                }
            }
        } catch (balanceError) {
            console.error('Error checking balance:', balanceError);
            // Continue with shield even if balance check fails
        }

        await safeEditOrReply(ctx, t(lang, 'shield_processing', { amount: state.amount, token: state.token }), { parse_mode: 'Markdown' });

        try {
            let result;
            if (state.token === 'SOL') {
                result = await walletService.depositSOL(chatId, state.amount);
            } else {
                result = await walletService.depositSPL(chatId, state.token, state.amount);
            }

            if (result.success) {
                await balanceMonitor.refreshUserBalance(chatId);
                await safeEditOrReply(ctx,
                    `${t(lang, 'shield_success')}\n\n` +
                    `${t(lang, 'shield_success_amount', { amount: state.amount, token: state.token })}\n` +
                    `${t(lang, 'shield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n` +
                    `${t(lang, 'shield_success_link', { signature: result.signature || '' })}`,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            } else {
                await safeEditOrReply(ctx,
                    `${t(lang, 'shield_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            }
        } catch (error) {
            await safeEditOrReply(ctx,
                `${t(lang, 'error')}\n\n${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }

        userStates.delete(chatId);
    });

    // ==================== PRIVATE TRANSFER FLOW ====================

    bot.action('action_private_transfer', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        userStates.set(chatId, { action: 'private_transfer', step: 'select_token' });
        await safeEditOrReply(ctx,
            `${t(lang, 'private_transfer_title')}\n\n` +
            `${t(lang, 'private_transfer_description')}\n\n` +
            `${t(lang, 'private_transfer_select_token')}`,
            { parse_mode: 'Markdown', ...getPrivateTransferTokenKeyboard(lang) }
        );
    });

    // Handle private transfer token selection
    for (const symbol of Object.keys(SUPPORTED_TOKENS)) {
        bot.action(`ptransfer_token_${symbol}`, async (ctx: Context) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;
            await ctx.answerCbQuery();
            const lang = getLang(chatId);

            // Get existing state to preserve recipientAddress if from QR scan
            const existingState = userStates.get(chatId);
            const recipientAddress = existingState?.recipientAddress;

            userStates.set(chatId, { 
                action: 'private_transfer', 
                token: symbol as TokenSymbol, 
                step: 'enter_amount',
                recipientAddress: recipientAddress // Preserve address if exists
            });

            const tokenInfo = SUPPORTED_TOKENS[symbol as TokenSymbol];
            let message = `🔐 *Private Transfer ${symbol}*\n\n` +
                `Token: ${tokenInfo.name}\n`;
            
            // Show recipient address if already set (from QR)
            if (recipientAddress) {
                message += `📍 To: \`${shortenAddress(recipientAddress)}\`\n`;
            }
            
            message += `\n${t(lang, 'private_transfer_enter_amount', { token: symbol })}`;

            await safeEditOrReply(ctx,
                message,
                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
            );
        });
    }

    bot.action('confirm_private_transfer', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);
        await ctx.answerCbQuery(t(lang, 'loading'));

        const state = userStates.get(chatId);
        if (!state || state.action !== 'private_transfer' || !state.token || !state.amount || !state.recipientAddress) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        // Check public balance before private transfer (need balance for shield)
        try {
            const balances = await walletService.getBalances(chatId, true);
            if (balances) {
                let publicBalance = 0;
                if (state.token === 'SOL') {
                    publicBalance = balances.sol.public;
                } else {
                    const tokenKey = state.token as TokenSymbol;
                    publicBalance = balances.tokens[tokenKey]?.public || 0;
                }

                if (publicBalance < state.amount) {
                    await safeEditOrReply(ctx,
                        t(lang, 'error_insufficient_balance_shield', {
                            balance: publicBalance.toFixed(6),
                            token: state.token,
                            amount: state.amount.toString()
                        }),
                        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                    );
                    userStates.delete(chatId);
                    return;
                }
            }
        } catch (balanceError) {
            console.error('Error checking balance:', balanceError);
        }

        // Step 1: Shield
        await safeEditOrReply(ctx, t(lang, 'private_transfer_processing_shield', { amount: state.amount, token: state.token }), { parse_mode: 'Markdown' });

        try {
            let shieldResult;
            if (state.token === 'SOL') {
                shieldResult = await walletService.depositSOL(chatId, state.amount);
            } else {
                shieldResult = await walletService.depositSPL(chatId, state.token, state.amount);
            }

            if (!shieldResult.success) {
                await safeEditOrReply(ctx,
                    `${t(lang, 'private_transfer_failed')}\n\n` +
                    `${t(lang, 'private_transfer_failed_shield', { error: shieldResult.error || 'Unknown error' })}`,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
                userStates.delete(chatId);
                return;
            }

            // Step 2: Unshield to recipient
            await safeEditOrReply(ctx, t(lang, 'private_transfer_processing_unshield'), { parse_mode: 'Markdown' });

            let unshieldResult;
            if (state.token === 'SOL') {
                unshieldResult = await walletService.withdrawSOL(chatId, state.amount, state.recipientAddress);
            } else {
                unshieldResult = await walletService.withdrawSPL(chatId, state.token, state.amount, state.recipientAddress);
            }

            if (unshieldResult.success) {
                await balanceMonitor.refreshUserBalance(chatId);
                
                let totalFee = 0;
                if (state.token === 'SOL' && 'fee' in unshieldResult) {
                    totalFee = ((unshieldResult.fee as number) || 0) / 1e9;
                }
                
                let message = `${t(lang, 'private_transfer_success')}\n\n`;
                message += `${t(lang, 'private_transfer_success_amount', { amount: state.amount, token: state.token })}\n`;
                message += `${t(lang, 'private_transfer_success_to', { address: shortenAddress(state.recipientAddress) })}\n`;
                if (totalFee > 0) {
                    message += `${t(lang, 'private_transfer_success_fee', { fee: totalFee.toFixed(6) })}\n`;
                }
                message += `${t(lang, 'private_transfer_success_signature', { signature: shortenAddress(unshieldResult.signature || '', 8) })}\n`;
                message += `${t(lang, 'private_transfer_success_link', { signature: unshieldResult.signature || '' })}`;

                await safeEditOrReply(ctx, message, { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) });
            } else {
                await safeEditOrReply(ctx,
                    `${t(lang, 'private_transfer_failed')}\n\n` +
                    `${t(lang, 'private_transfer_failed_unshield', { error: unshieldResult.error || 'Unknown error' })}`,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            }
        } catch (error) {
            await safeEditOrReply(ctx,
                `${t(lang, 'private_transfer_failed')}\n\n${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }

        userStates.delete(chatId);
    });

    // ==================== MULTI PRIVATE SEND FLOW ====================

    bot.action('action_multi_private_send', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        if (!walletService.hasWallet(chatId)) {
            await safeEditOrReply(ctx, t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        userStates.set(chatId, { action: 'multi_private_send', step: 'select_token' });
        await safeEditOrReply(ctx,
            `${t(lang, 'multi_send_title')}\n\n` +
            `${t(lang, 'multi_send_description')}\n\n` +
            `${t(lang, 'multi_send_select_token')}`,
            { parse_mode: 'Markdown', ...getMultiPrivateSendTokenKeyboard(lang) }
        );
    });

    // Handle multi send token selection
    for (const symbol of Object.keys(SUPPORTED_TOKENS)) {
        bot.action(`multi_send_token_${symbol}`, async (ctx: Context) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;
            await ctx.answerCbQuery();
            const lang = getLang(chatId);

            userStates.set(chatId, { 
                action: 'multi_private_send', 
                token: symbol as TokenSymbol, 
                step: 'enter_recipients' 
            });

            const tokenInfo = SUPPORTED_TOKENS[symbol as TokenSymbol];
            await safeEditOrReply(ctx,
                `📤 *Multi Private Send ${symbol}*\n\n` +
                `Token: ${tokenInfo.name}\n\n` +
                `${t(lang, 'multi_send_enter_recipients')}\n\n` +
                `${t(lang, 'multi_send_format_example')}`,
                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
            );
        });
    }

    bot.action('confirm_multi_private_send', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);
        await ctx.answerCbQuery(t(lang, 'loading'));

        const state = userStates.get(chatId);
        if (!state || state.action !== 'multi_private_send' || !state.token || !state.multiRecipients || state.multiRecipients.length === 0) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        const totalAmount = state.multiRecipients.reduce((sum, r) => sum + r.amount, 0);
        const totalRecipients = state.multiRecipients.length;

        // Check public balance before multi send
        try {
            const balances = await walletService.getBalances(chatId, true);
            if (balances) {
                let publicBalance = 0;
                if (state.token === 'SOL') {
                    publicBalance = balances.sol.public / 1e9; // Convert lamports to SOL
                } else {
                    const tokenKey = state.token as TokenSymbol;
                    const tokenInfo = SUPPORTED_TOKENS[tokenKey];
                    publicBalance = (balances.tokens[tokenKey]?.public || 0) / tokenInfo.unitsPerToken;
                }

                if (publicBalance < totalAmount) {
                    await safeEditOrReply(ctx,
                        t(lang, 'error_insufficient_balance_shield', {
                            balance: publicBalance.toFixed(6),
                            token: state.token,
                            amount: totalAmount.toString()
                        }),
                        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                    );
                    userStates.delete(chatId);
                    return;
                }
            }
        } catch (balanceError) {
            console.error('Error checking balance:', balanceError);
        }

        // Process each recipient
        let successCount = 0;
        let failedRecipients: { address: string; amount: number; error: string }[] = [];
        
        for (let i = 0; i < state.multiRecipients.length; i++) {
            const recipient = state.multiRecipients[i];
            
            await safeEditOrReply(ctx, 
                `${t(lang, 'multi_send_processing', { current: i + 1, total: totalRecipients })}\n\n` +
                `${t(lang, 'multi_send_processing_recipient', { amount: recipient.amount, token: state.token, address: shortenAddress(recipient.address) })}`,
                { parse_mode: 'Markdown' }
            );

            try {
                // Step 1: Shield
                let shieldResult;
                if (state.token === 'SOL') {
                    shieldResult = await walletService.depositSOL(chatId, recipient.amount);
                } else {
                    shieldResult = await walletService.depositSPL(chatId, state.token, recipient.amount);
                }

                if (!shieldResult.success) {
                    failedRecipients.push({ 
                        address: recipient.address, 
                        amount: recipient.amount, 
                        error: `Shield failed: ${shieldResult.error}` 
                    });
                    continue;
                }

                // Step 2: Unshield to recipient
                let unshieldResult;
                if (state.token === 'SOL') {
                    unshieldResult = await walletService.withdrawSOL(chatId, recipient.amount, recipient.address);
                } else {
                    unshieldResult = await walletService.withdrawSPL(chatId, state.token, recipient.amount, recipient.address);
                }

                if (unshieldResult.success) {
                    successCount++;
                } else {
                    failedRecipients.push({ 
                        address: recipient.address, 
                        amount: recipient.amount, 
                        error: `Unshield failed: ${unshieldResult.error}` 
                    });
                }
            } catch (error) {
                failedRecipients.push({ 
                    address: recipient.address, 
                    amount: recipient.amount, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                });
            }
        }

        // Refresh balance after all transfers
        await balanceMonitor.refreshUserBalance(chatId);

        // Build result message
        let resultMessage = '';
        if (successCount === totalRecipients) {
            resultMessage = `${t(lang, 'multi_send_success')}\n\n`;
            resultMessage += `${t(lang, 'multi_send_success_summary', { success: successCount, total: totalRecipients })}`;
        } else if (successCount > 0) {
            resultMessage = `${t(lang, 'multi_send_partial_success', { success: successCount, total: totalRecipients })}\n\n`;
            if (failedRecipients.length > 0) {
                resultMessage += `❌ *Failed transfers:*\n`;
                for (const failed of failedRecipients) {
                    resultMessage += `• \`${shortenAddress(failed.address)}\`: ${failed.amount} ${state.token} - ${failed.error}\n`;
                }
            }
        } else {
            resultMessage = `${t(lang, 'multi_send_failed')}\n\n`;
            for (const failed of failedRecipients) {
                resultMessage += `• \`${shortenAddress(failed.address)}\`: ${failed.error}\n`;
            }
        }

        await safeEditOrReply(ctx, resultMessage, { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) });
        userStates.delete(chatId);
    });

    // ==================== TEXT MESSAGE HANDLER (for user input) ====================

    bot.on('text', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);

        // @ts-ignore
        const text = ctx.message?.text || '';
        
        // Ignore commands
        if (text.startsWith('/')) return;

        const state = userStates.get(chatId);
        
        // Debug logging
        console.log(`[NLP Debug] chatId: ${chatId}, text: "${text}", hasState: ${!!state}`);
        
        // If no active state, try to parse as natural language command
        if (!state) {
            // Check if it looks like a natural language command
            const isNLP = isNaturalLanguageCommand(text);
            console.log(`[NLP Debug] isNaturalLanguageCommand: ${isNLP}`);
            
            if (isNLP) {
                const parsed = parseNaturalLanguage(text);
                console.log(`[NLP Debug] parsed:`, parsed);
                
                if (parsed && parsed.confidence >= 0.6) {
                    // Handle different intents
                    switch (parsed.intent) {
                        case 'balance':
                            await handleBalance(ctx, walletService);
                            return;
                        case 'private_balance':
                            await handlePrivateBalance(ctx, walletService);
                            return;
                        case 'wallet_info':
                            await handleWalletInfo(ctx, walletService);
                            return;
                        case 'help':
                            await handleHelp(ctx);
                            return;
                        case 'create_wallet':
                            if (!walletService.hasWallet(chatId)) {
                                const result = await walletService.createNewWallet(chatId);
                                if (result.success && result.publicKey) {
                                    const message = markdownToHtml(
                                        `✅ ${t(lang, 'wallet_created_title')}\n\n` +
                                        `${t(lang, 'wallet_created_address')}\n`) +
                                        `<code>${result.publicKey}</code>\n\n` +
                                        markdownToHtml(`${t(lang, 'wallet_created_private_key')}\n`) +
                                        `<tg-spoiler><code>${result.privateKey}</code></tg-spoiler>\n\n` +
                                        markdownToHtml(`${t(lang, 'wallet_created_warning')}`);
                                    await ctx.reply(message, { parse_mode: 'HTML', ...getMainMenuKeyboard(true, lang) });
                                }
                            } else {
                                const msg = lang === 'vi' ? '⚠️ Bạn đã có ví rồi!' :
                                           lang === 'zh' ? '⚠️ 您已经有钱包了！' :
                                           '⚠️ You already have a wallet!';
                                await ctx.reply(msg, getMainMenuKeyboard(true, lang));
                            }
                            return;
                        case 'shield':
                        case 'unshield':
                        case 'private_transfer':
                            // Need wallet for these operations
                            if (!walletService.hasWallet(chatId)) {
                                await ctx.reply(t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
                                return;
                            }
                            
                            // Store parsed command and ask for confirmation
                            pendingNLPCommands.set(chatId, parsed);
                            const confirmMsg = generateConfirmationMessage(parsed, lang);
                            
                            await ctx.reply(
                                confirmMsg,
                                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([
                                    [Markup.button.callback(t(lang, 'confirm'), 'nlp_confirm')],
                                    [Markup.button.callback(t(lang, 'cancel'), 'nlp_cancel')]
                                ]) }
                            );
                            return;
                        case 'export_key':
                            if (!walletService.hasWallet(chatId)) {
                                await ctx.reply(t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
                                return;
                            }
                            // Show warning first
                            await ctx.reply(
                                `${t(lang, 'export_key_warning_title')}\n\n` +
                                `${t(lang, 'export_key_warning_1')}\n` +
                                `${t(lang, 'export_key_warning_2')}\n` +
                                `${t(lang, 'export_key_warning_3')}\n\n` +
                                `${t(lang, 'export_key_confirm_question')}`,
                                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([
                                    [Markup.button.callback(t(lang, 'export_key_confirm_yes'), 'confirm_export_key')],
                                    [Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]
                                ]) }
                            );
                            return;
                    }
                }
            }
            return;
        }

        // Handle connect wallet flow
        if (state.action === 'connect' && state.step === 'enter_private_key') {
            const privateKey = text.trim();

            // Try to delete the message with private key for security
            try {
                // @ts-ignore
                await ctx.deleteMessage(ctx.message?.message_id);
            } catch {
                await ctx.reply(t(lang, 'connect_delete_message'));
            }

            const statusMsg = await ctx.reply(t(lang, 'connect_processing'));

            const result = await walletService.connectWallet(chatId, privateKey);

            if (result.success) {
                userStates.delete(chatId);
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    `${t(lang, 'connect_success')}\n\n` +
                    `${t(lang, 'connect_success_address')} \`${result.publicKey}\`\n\n` +
                    `${t(lang, 'connect_success_monitoring')}`,
                    { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
                );
            } else {
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    `${t(lang, 'connect_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                    { parse_mode: 'Markdown', ...Markup.inlineKeyboard([
                        [Markup.button.callback(t(lang, 'connect_retry'), 'action_connect')],
                        [Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]
                    ]) }
                );
            }
            return;
        }

        // Handle shield amount input
        if (state.action === 'shield' && state.step === 'enter_amount' && state.token) {
            const amount = parseFloat(text);
            
            if (isNaN(amount) || amount <= 0) {
                await ctx.reply(
                    t(lang, 'error_invalid_amount'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            state.amount = amount;
            state.step = 'confirm';
            userStates.set(chatId, state);

            await ctx.reply(
                `${t(lang, 'shield_confirm_title')}\n\n` +
                `${t(lang, 'shield_confirm_token', { token: state.token })}\n` +
                `${t(lang, 'shield_confirm_amount', { amount: amount })}`,
                { parse_mode: 'Markdown', ...getConfirmKeyboard('shield', lang) }
            );
            return;
        }

        // Handle unshield amount input
        if (state.action === 'unshield' && state.step === 'enter_amount' && state.token) {
            const amount = parseFloat(text);
            
            if (isNaN(amount) || amount <= 0) {
                await ctx.reply(
                    t(lang, 'error_invalid_amount'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            state.amount = amount;
            userStates.set(chatId, state);

            await ctx.reply(
                `📤 *Unshield ${amount} ${state.token}*\n\n` +
                `${t(lang, 'unshield_select_destination')}`,
                { parse_mode: 'Markdown', ...getUnshieldDestinationKeyboard(lang) }
            );
            return;
        }

        // Handle unshield address input
        if (state.action === 'unshield' && state.step === 'enter_address' && state.token && state.amount) {
            const address = text.trim();
            
            // Basic Solana address validation (base58, 32-44 chars)
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
                await ctx.reply(
                    t(lang, 'error_invalid_address'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            state.recipientAddress = address;
            state.step = 'confirm';
            userStates.set(chatId, state);

            await ctx.reply(
                `${t(lang, 'unshield_confirm_title')}\n\n` +
                `${t(lang, 'unshield_confirm_token', { token: state.token })}\n` +
                `${t(lang, 'unshield_confirm_amount', { amount: state.amount })}\n` +
                `${t(lang, 'unshield_confirm_to', { address: shortenAddress(address) })}\n\n` +
                `${t(lang, 'unshield_confirm_estimated_fee')}\n` +
                `${t(lang, 'unshield_confirm_fee_note')}`,
                { parse_mode: 'Markdown', ...getConfirmKeyboard('unshield', lang) }
            );
            return;
        }

        // Handle private transfer amount input
        if (state.action === 'private_transfer' && state.step === 'enter_amount' && state.token) {
            const amount = parseFloat(text);
            
            if (isNaN(amount) || amount <= 0) {
                await ctx.reply(
                    t(lang, 'error_invalid_amount'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            state.amount = amount;
            
            // If address already exists (from QR scan), skip to confirm
            if (state.recipientAddress) {
                state.step = 'confirm';
                userStates.set(chatId, state);

                // Calculate estimated fees
                const shieldFee = PRIVACY_CASH_FEES.deposit.estimatedTxFeeSOL;
                const unshieldFee = calculateWithdrawFee(state.amount);
                const totalFee = shieldFee + unshieldFee.totalFee;
                const recipientReceives = state.amount - unshieldFee.totalFee;

                // Check if recipient receives negative amount
                if (recipientReceives <= 0) {
                    await ctx.reply(
                        t(lang, 'error_amount_too_small', {
                            amount: state.amount.toString(),
                            token: state.token,
                            fee: unshieldFee.totalFee.toFixed(4)
                        }),
                        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                    );
                    userStates.delete(chatId);
                    return;
                }

                await ctx.reply(
                    `${t(lang, 'private_transfer_confirm_title')}\n\n` +
                    `${t(lang, 'private_transfer_confirm_token', { token: state.token })}\n` +
                    `${t(lang, 'private_transfer_confirm_amount', { amount: state.amount })}\n` +
                    `${t(lang, 'private_transfer_confirm_to', { address: shortenAddress(state.recipientAddress) })}\n\n` +
                    `${t(lang, 'private_transfer_confirm_fee_breakdown')}\n` +
                    `${t(lang, 'private_transfer_confirm_shield_fee', { fee: shieldFee.toFixed(4) })}\n` +
                    `${t(lang, 'private_transfer_confirm_unshield_fee', { fee: unshieldFee.totalFee.toFixed(4), percent: (PRIVACY_CASH_FEES.withdraw.percentageFee * 100).toFixed(2) })}\n` +
                    `${t(lang, 'private_transfer_confirm_total_fee', { fee: totalFee.toFixed(4) })}\n\n` +
                    `${t(lang, 'private_transfer_confirm_recipient_receives', { amount: recipientReceives.toFixed(6), token: state.token })}`,
                    { parse_mode: 'Markdown', ...getConfirmKeyboard('private_transfer', lang) }
                );
                return;
            }

            // No address yet, ask for it
            state.step = 'enter_address';
            userStates.set(chatId, state);

            await ctx.reply(
                `🔐 *Private Transfer ${amount} ${state.token}*\n\n` +
                `${t(lang, 'private_transfer_enter_address')}`,
                { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
            );
            return;
        }

        // Handle private transfer address input
        if (state.action === 'private_transfer' && state.step === 'enter_address' && state.token && state.amount) {
            const address = text.trim();
            
            // Basic Solana address validation (base58, 32-44 chars)
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
                await ctx.reply(
                    t(lang, 'error_invalid_address'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            state.recipientAddress = address;
            state.step = 'confirm';
            userStates.set(chatId, state);

            // Calculate estimated fees
            const shieldFee = PRIVACY_CASH_FEES.deposit.estimatedTxFeeSOL;
            const unshieldFee = calculateWithdrawFee(state.amount);
            const totalFee = shieldFee + unshieldFee.totalFee;
            const recipientReceives = state.amount - unshieldFee.totalFee;

            // Check if recipient receives negative amount
            if (recipientReceives <= 0) {
                await ctx.reply(
                    t(lang, 'error_amount_too_small', {
                        amount: state.amount.toString(),
                        token: state.token,
                        fee: unshieldFee.totalFee.toFixed(4)
                    }),
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
                userStates.delete(chatId);
                return;
            }

            await ctx.reply(
                `${t(lang, 'private_transfer_confirm_title')}\n\n` +
                `${t(lang, 'private_transfer_confirm_token', { token: state.token })}\n` +
                `${t(lang, 'private_transfer_confirm_amount', { amount: state.amount })}\n` +
                `${t(lang, 'private_transfer_confirm_to', { address: shortenAddress(address) })}\n\n` +
                `${t(lang, 'private_transfer_confirm_fee_breakdown')}\n` +
                `${t(lang, 'private_transfer_confirm_shield_fee', { fee: shieldFee.toFixed(4) })}\n` +
                `${t(lang, 'private_transfer_confirm_unshield_fee', { fee: unshieldFee.totalFee.toFixed(4), percent: (PRIVACY_CASH_FEES.withdraw.percentageFee * 100).toFixed(2) })}\n` +
                `${t(lang, 'private_transfer_confirm_total_fee', { fee: totalFee.toFixed(4) })}\n\n` +
                `${t(lang, 'private_transfer_confirm_recipient_receives', { amount: recipientReceives.toFixed(6), token: state.token })}`,
                { parse_mode: 'Markdown', ...getConfirmKeyboard('private_transfer', lang) }
            );
            return;
        }

        // Handle multi private send recipients input
        if (state.action === 'multi_private_send' && state.step === 'enter_recipients' && state.token) {
            const lines = text.trim().split('\n').filter((line: string) => line.trim().length > 0);
            
            if (lines.length === 0) {
                await ctx.reply(
                    t(lang, 'multi_send_no_recipients'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            const recipients: MultiSendRecipient[] = [];
            const errors: string[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const lineNum = i + 1;
                
                // Parse "address, amount" format
                const parts = line.split(',').map((p: string) => p.trim());
                
                if (parts.length !== 2) {
                    errors.push(t(lang, 'multi_send_invalid_format', { line: lineNum, content: line }));
                    continue;
                }

                const address = parts[0];
                const amountStr = parts[1];
                const amount = parseFloat(amountStr);

                // Validate address
                if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
                    errors.push(t(lang, 'multi_send_invalid_address', { line: lineNum, address: shortenAddress(address) }));
                    continue;
                }

                // Validate amount
                if (isNaN(amount) || amount <= 0) {
                    errors.push(t(lang, 'multi_send_invalid_amount', { line: lineNum, amount: amountStr }));
                    continue;
                }

                recipients.push({ address, amount });
            }

            // If there are errors, show them
            if (errors.length > 0) {
                await ctx.reply(
                    `❌ *Validation Errors:*\n\n${errors.join('\n')}\n\n${t(lang, 'multi_send_format_example')}`,
                    { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]]) }
                );
                return;
            }

            if (recipients.length === 0) {
                await ctx.reply(
                    t(lang, 'multi_send_no_recipients'),
                    Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'cancel'), 'action_cancel')]])
                );
                return;
            }

            // Save recipients and move to confirm
            state.multiRecipients = recipients;
            state.step = 'confirm';
            userStates.set(chatId, state);

            // Build confirmation message
            const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);
            let confirmMessage = `${t(lang, 'multi_send_confirm_title')}\n\n`;
            confirmMessage += `${t(lang, 'multi_send_confirm_token', { token: state.token })}\n`;
            confirmMessage += `${t(lang, 'multi_send_confirm_total_amount', { amount: totalAmount.toFixed(6), token: state.token })}\n`;
            confirmMessage += `${t(lang, 'multi_send_confirm_recipients_count', { count: recipients.length })}\n\n`;
            confirmMessage += `${t(lang, 'multi_send_confirm_recipients_list')}\n`;
            
            for (let i = 0; i < recipients.length; i++) {
                const r = recipients[i];
                confirmMessage += `${i + 1}. \`${shortenAddress(r.address)}\` - ${r.amount} ${state.token}\n`;
            }
            
            confirmMessage += `\n${t(lang, 'multi_send_confirm_fee_note')}`;

            await ctx.reply(
                confirmMessage,
                { parse_mode: 'Markdown', ...getConfirmKeyboard('multi_private_send', lang) }
            );
            return;
        }
    });

    // ==================== PHOTO MESSAGE HANDLER (for QR code scanning) ====================

    bot.on('photo', async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const lang = getLang(chatId);

        // Check if user has a wallet
        if (!walletService.hasWallet(chatId)) {
            await ctx.reply(t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
            return;
        }

        try {
            // Send scanning message
            const statusMsg = await ctx.reply(t(lang, 'qr_scanning'));

            // @ts-ignore - Get the largest photo (best quality)
            const photos = ctx.message?.photo;
            if (!photos || photos.length === 0) {
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    t(lang, 'qr_no_code_found')
                );
                return;
            }

            // Get the largest photo (last in array)
            const largestPhoto = photos[photos.length - 1];
            
            // Get file URL from Telegram
            const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);
            
            // Download the image
            const imageBuffer = await downloadFile(fileLink.href);
            
            // Scan QR code
            const scanResult = await scanQRFromBuffer(imageBuffer);

            if (!scanResult.success) {
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    t(lang, 'qr_no_code_found')
                );
                return;
            }

            // Check if it's a Solana address
            if (scanResult.isSolanaAddress && scanResult.data) {
                const parsed = parseSolanaUri(scanResult.data);
                const address = parsed?.address || scanResult.data;

                // Store the detected address for use in callbacks
                userStates.set(chatId, { 
                    action: 'private_transfer', 
                    step: 'select_token',
                    recipientAddress: address 
                });

                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    `${t(lang, 'qr_address_detected')}\n\n` +
                    `${t(lang, 'qr_address_label')}\n\`${address}\`\n\n` +
                    `${t(lang, 'qr_what_to_do')}`,
                    { 
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback(t(lang, 'qr_private_transfer'), `qr_transfer_${address.substring(0, 20)}`)],
                            [Markup.button.callback(t(lang, 'back_to_menu'), 'action_menu')]
                        ])
                    }
                );
            } else {
                // Not a Solana address, show the content
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    `${t(lang, 'qr_not_solana_address')}\n\n` +
                    `${t(lang, 'qr_content_label')}\n\`${scanResult.data?.substring(0, 200) || ''}\``,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            }
        } catch (error) {
            console.error('QR scan error:', error);
            await ctx.reply(
                t(lang, 'qr_scan_error', { error: error instanceof Error ? error.message : 'Unknown error' }),
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }
    });

    // Handle QR transfer action - starts private transfer with pre-filled address
    bot.action(/^qr_transfer_/, async (ctx: Context) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        await ctx.answerCbQuery();
        const lang = getLang(chatId);

        // Get the stored address from state
        const state = userStates.get(chatId);
        if (!state || !state.recipientAddress) {
            await safeEditOrReply(ctx, t(lang, 'error_session_expired'), getMainMenuKeyboard(true, lang));
            return;
        }

        // Update state for private transfer token selection
        userStates.set(chatId, { 
            action: 'private_transfer', 
            step: 'select_token',
            recipientAddress: state.recipientAddress 
        });

        await safeEditOrReply(ctx,
            `🔐 *Private Transfer*\n\n` +
            `📍 ${t(lang, 'private_transfer_confirm_to', { address: shortenAddress(state.recipientAddress) })}\n\n` +
            `${t(lang, 'private_transfer_select_token')}`,
            { parse_mode: 'Markdown', ...getPrivateTransferTokenKeyboard(lang) }
        );
    });
}

/**
 * Start command handler
 */
async function handleStart(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const lang = getLang(chatId);
    const hasWallet = walletService.hasWallet(chatId);
    const wallet = walletService.getWallet(chatId);

    let welcomeMessage = `${t(lang, 'welcome_title')}\n\n`;
    
    const featureMessages: Record<Language, string> = {
        vi: `Bot giúp bạn tương tác với Privacy Cash trên Solana blockchain cho các giao dịch riêng tư.\n\n` +
            `${t(lang, 'welcome_features')}\n` +
            `• ${t(lang, 'welcome_feature_shield')}\n` +
            `• ${t(lang, 'welcome_feature_unshield')}\n` +
            `• ${t(lang, 'welcome_feature_private_transfer')}\n` +
            `• ${t(lang, 'welcome_feature_balance')}\n` +
            `• ${t(lang, 'welcome_feature_monitor')}\n` +
            `• ${t(lang, 'welcome_feature_tokens')}`,
        en: `Bot helps you interact with Privacy Cash on Solana blockchain for private transactions.\n\n` +
            `${t(lang, 'welcome_features')}\n` +
            `• ${t(lang, 'welcome_feature_shield')}\n` +
            `• ${t(lang, 'welcome_feature_unshield')}\n` +
            `• ${t(lang, 'welcome_feature_private_transfer')}\n` +
            `• ${t(lang, 'welcome_feature_balance')}\n` +
            `• ${t(lang, 'welcome_feature_monitor')}\n` +
            `• ${t(lang, 'welcome_feature_tokens')}`,
        zh: `Bot 帮助您在 Solana 区块链上与 Privacy Cash 进行私密交易。\n\n` +
            `${t(lang, 'welcome_features')}\n` +
            `• ${t(lang, 'welcome_feature_shield')}\n` +
            `• ${t(lang, 'welcome_feature_unshield')}\n` +
            `• ${t(lang, 'welcome_feature_private_transfer')}\n` +
            `• ${t(lang, 'welcome_feature_balance')}\n` +
            `• ${t(lang, 'welcome_feature_monitor')}\n` +
            `• ${t(lang, 'welcome_feature_tokens')}`
    };
    
    welcomeMessage += featureMessages[lang];

    if (hasWallet && wallet) {
        welcomeMessage += `\n\n${t(lang, 'welcome_connected')}\n\`${shortenAddress(wallet.publicKey, 8)}\`\n`;
    } else {
        welcomeMessage += `\n\n${t(lang, 'wallet_setup_title').replace('*', '').replace('*', '')}\n`;
        welcomeMessage += `${t(lang, 'wallet_setup_message')}\n`;
    }

    welcomeMessage += `\n${t(lang, 'welcome_security_note')}`;

    // Send banner image with welcome message
    try {
        console.log('Banner path:', BANNER_PATH);
        console.log('Banner exists:', fs.existsSync(BANNER_PATH));
        if (fs.existsSync(BANNER_PATH)) {
            await ctx.replyWithPhoto(
                { source: BANNER_PATH },
                { caption: welcomeMessage, parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
            );
        } else {
            // Fallback to text-only if banner doesn't exist
            console.log('Banner not found, falling back to text');
            await ctx.reply(welcomeMessage, { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) });
        }
    } catch (error) {
        // Fallback to text-only if image send fails
        console.error('Error sending banner:', error);
        await ctx.reply(welcomeMessage, { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) });
    }
}

/**
 * Menu command handler
 */
async function handleMenu(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const lang = getLang(chatId);
    const hasWallet = walletService.hasWallet(chatId);
    await ctx.reply(
        t(lang, 'menu_title'),
        { parse_mode: 'Markdown', ...getMainMenuKeyboard(hasWallet, lang) }
    );
}

/**
 * Language command handler
 */
async function handleLanguageCommand(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const lang = getLang(chatId);
    await ctx.reply(
        `${t(lang, 'language_title')}\n\n${t(lang, 'language_select')}`,
        { parse_mode: 'Markdown', ...getLanguageSelectionKeyboard() }
    );
}

/**
 * Help command handler
 */
async function handleHelp(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id || 0;
    const lang = getLang(chatId);
    
    const helpMessages: Record<Language, string> = {
        vi: `
📚 *Hướng dẫn sử dụng Privacy Cash Bot*

*🔗 Quản lý ví*
/connect <private\\_key> - Kết nối ví
/disconnect - Ngắt kết nối ví
/wallet - Thông tin ví

*💰 Số dư*
/balance - Xem tất cả số dư
/privatebalance - Xem số dư riêng tư

*�️ Shield (Nạp vào ví riêng tư)*
/deposit <số\\_lượng> [token]
/depositsol <số\\_lượng>
/deposittoken <token> <số\\_lượng>

*📤 Unshield (Rút từ ví riêng tư)*
/withdraw <số\\_lượng> [token] [địa\\_chỉ]
/withdrawsol <số\\_lượng> [địa\\_chỉ]
/withdrawtoken <token> <số\\_lượng> [địa\\_chỉ]

*🔐 Chuyển tiền riêng tư*
/transfer - Gửi token ẩn danh đến 1 địa chỉ
/multisend - Gửi token ẩn danh đến nhiều địa chỉ cùng lúc
📷 Gửi ảnh QR chứa địa chỉ ví để chuyển tiền nhanh!

*🔔 Theo dõi*
/monitor - Bật thông báo
/stopmonitor - Tắt thông báo

*⚙️ Tiện ích*
/tokens - Danh sách token
/menu - Mở menu chính
/language - Đổi ngôn ngữ
/clearcache - Xóa cache

💡 *Mẹo:* Sử dụng /menu hoặc /start để mở giao diện nút bấm dễ sử dụng hơn!
`,
        en: `
📚 *Privacy Cash Bot Guide*

*🔗 Wallet Management*
/connect <private\\_key> - Connect wallet
/disconnect - Disconnect wallet
/wallet - Wallet info

*💰 Balance*
/balance - View all balances
/privatebalance - View private balance

*🛡️ Shield (Deposit to private)*
/deposit <amount> [token]
/depositsol <amount>
/deposittoken <token> <amount>

*📤 Unshield (Withdraw from private)*
/withdraw <amount> [token] [address]
/withdrawsol <amount> [address]
/withdrawtoken <token> <amount> [address]

*🔐 Private Transfers*
/transfer - Send tokens anonymously to 1 address
/multisend - Send tokens anonymously to multiple addresses at once
📷 Send a QR image with wallet address for quick transfer!

*🔔 Monitoring*
/monitor - Enable notifications
/stopmonitor - Disable notifications

*⚙️ Utility*
/tokens - Token list
/menu - Open main menu
/language - Change language
/clearcache - Clear cache

💡 *Tip:* Use /menu or /start to open the button interface for easier navigation!
`,
        zh: `
📚 *Privacy Cash Bot 使用指南*

*🔗 钱包管理*
/connect <私钥> - 连接钱包
/disconnect - 断开钱包
/wallet - 钱包信息

*💰 余额*
/balance - 查看所有余额
/privatebalance - 查看私密余额

*🛡️ Shield (存入私密钱包)*
/deposit <数量> [代币]
/depositsol <数量>
/deposittoken <代币> <数量>

*📤 Unshield (从私密钱包提取)*
/withdraw <数量> [代币] [地址]
/withdrawsol <数量> [地址]
/withdrawtoken <代币> <数量> [地址]

*🔐 私密转账*
/transfer - 匿名发送代币到1个地址
/multisend - 同时匿名发送代币到多个地址
📷 发送带有钱包地址的二维码图片以快速转账!

*🔔 监控*
/monitor - 启用通知
/stopmonitor - 关闭通知

*⚙️ 工具*
/tokens - 代币列表
/menu - 打开主菜单
/language - 更改语言
/clearcache - 清除缓存

💡 *提示:* 使用 /menu 或 /start 打开按钮界面，操作更便捷！
`
    };
    
    await ctx.reply(helpMessages[lang], { parse_mode: 'Markdown' });
}

/**
 * Connect wallet handler
 */
async function handleConnect(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    // @ts-ignore - accessing message text
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length === 0) {
        const usageMessages: Record<Language, string> = {
            vi: '⚠️ *Cách sử dụng:* `/connect <private_key>`\n\n' +
                '🔐 Private key sẽ được lưu trữ an toàn.\n' +
                '⚠️ Xóa tin nhắn sau khi gửi để bảo mật!\n\n' +
                '💡 Hoặc bấm nút bên dưới:',
            en: '⚠️ *Usage:* `/connect <private_key>`\n\n' +
                '🔐 Private key will be stored securely.\n' +
                '⚠️ Delete the message after sending for security!\n\n' +
                '💡 Or click the button below:',
            zh: '⚠️ *用法:* `/connect <私钥>`\n\n' +
                '🔐 私钥将被安全存储。\n' +
                '⚠️ 发送后请删除消息以确保安全！\n\n' +
                '💡 或点击下方按钮:'
        };
        
        await ctx.reply(
            usageMessages[lang],
            { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'menu_connect'), 'action_connect')]]) }
        );
        return;
    }

    const privateKey = args[0];

    // Try to delete the message with private key for security
    try {
        // @ts-ignore
        await ctx.deleteMessage(ctx.message?.message_id);
    } catch {
        await ctx.reply(t(lang, 'connect_delete_message'));
    }

    const statusMsg = await ctx.reply(t(lang, 'connect_processing'));

    const result = await walletService.connectWallet(chatId, privateKey);

    if (result.success) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'connect_success')}\n\n` +
            `${t(lang, 'connect_success_address')} \`${result.publicKey}\`\n\n` +
            `${t(lang, 'connect_success_monitoring')}`,
            { parse_mode: 'Markdown', ...getMainMenuKeyboard(true, lang) }
        );
    } else {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'connect_failed')}\n\n${t(lang, 'error')} ${result.error}`,
            { parse_mode: 'Markdown' }
        );
    }
}

/**
 * Disconnect wallet handler
 */
async function handleDisconnect(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    walletService.disconnectWallet(chatId);
    balanceMonitor.clearUserBalance(chatId);

    await ctx.reply(`${t(lang, 'disconnect_success')}\n\n${t(lang, 'disconnect_success_message')}`, getMainMenuKeyboard(false, lang));
}

/**
 * Wallet info handler
 */
async function handleWalletInfo(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    const wallet = walletService.getWallet(chatId);
    if (!wallet) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    await ctx.reply(
        `${t(lang, 'wallet_title')}\n\n` +
        `${t(lang, 'wallet_address')}\n\`${wallet.publicKey}\`\n\n` +
        `${t(lang, 'wallet_connected_date')} ${new Date(wallet.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'vi-VN')}\n` +
        `${t(lang, 'wallet_monitoring')} ${wallet.monitoringEnabled ? t(lang, 'wallet_monitoring_on') : t(lang, 'wallet_monitoring_off')}`,
        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
    );
}

/**
 * Balance handler
 */
async function handleBalance(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    const statusMsg = await ctx.reply(t(lang, 'balance_loading'));

    try {
        const balances = await walletService.getBalances(chatId);
        if (!balances) {
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                t(lang, 'balance_failed')
            );
            return;
        }

        let message = `${t(lang, 'balance_title')}\n\n`;
        
        // SOL
        message += `*${SUPPORTED_TOKENS.SOL.icon} SOL*\n`;
        message += `  ${t(lang, 'balance_public')} \`${formatSOL(balances.sol.public)}\` SOL\n`;
        message += `  ${t(lang, 'balance_private')} \`${formatSOL(balances.sol.private)}\` SOL\n\n`;

        // Tokens
        for (const [symbol, tokenInfo] of Object.entries(SUPPORTED_TOKENS)) {
            if (symbol === 'SOL') continue;

            const tokenBalance = balances.tokens[symbol as TokenSymbol];
            if (tokenBalance && (tokenBalance.public > 0 || tokenBalance.private > 0)) {
                message += `*${tokenInfo.icon} ${symbol}*\n`;
                message += `  ${t(lang, 'balance_public')} \`${formatToken(tokenBalance.public, symbol as TokenSymbol)}\` ${symbol}\n`;
                message += `  ${t(lang, 'balance_private')} \`${formatToken(tokenBalance.private, symbol as TokenSymbol)}\` ${symbol}\n\n`;
            }
        }

        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            message,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`
        );
    }
}

/**
 * Private balance handler
 */
async function handlePrivateBalance(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    const statusMsg = await ctx.reply(t(lang, 'balance_loading'));

    try {
        const balances = await walletService.getBalances(chatId);
        if (!balances) {
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                t(lang, 'balance_failed')
            );
            return;
        }

        let message = `${t(lang, 'private_balance_title')}\n\n`;
        message += `*${SUPPORTED_TOKENS.SOL.icon} SOL:* \`${formatSOL(balances.sol.private)}\` SOL\n`;

        for (const [symbol, tokenInfo] of Object.entries(SUPPORTED_TOKENS)) {
            if (symbol === 'SOL') continue;
            const tokenBalance = balances.tokens[symbol as TokenSymbol];
            if (tokenBalance && tokenBalance.private > 0) {
                message += `*${tokenInfo.icon} ${symbol}:* \`${formatToken(tokenBalance.private, symbol as TokenSymbol)}\` ${symbol}\n`;
            }
        }

        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            message,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`
        );
    }
}

/**
 * Generic deposit handler
 */
async function handleDeposit(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length === 0) {
        // Show interactive token selection
        userStates.set(chatId, { action: 'shield', step: 'select_token' });
        await ctx.reply(
            `${t(lang, 'shield_title')}\n\n${t(lang, 'shield_select_token')}`,
            { parse_mode: 'Markdown', ...getShieldTokenKeyboard(lang) }
        );
        return;
    }

    const amount = parseFloat(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t(lang, 'error_invalid_amount'));
        return;
    }

    const token = args[1]?.toUpperCase() || 'SOL';

    if (token === 'SOL') {
        await executeDepositSOL(ctx, walletService, balanceMonitor, amount, lang);
    } else {
        const tokenSymbol = token as TokenSymbol;
        if (!(token in SUPPORTED_TOKENS)) {
            await ctx.reply(t(lang, 'error_invalid_token'));
            return;
        }
        await executeDepositToken(ctx, walletService, balanceMonitor, tokenSymbol, amount, lang);
    }
}

/**
 * Deposit SOL handler
 */
async function handleDepositSOL(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length === 0) {
        const usageMessages: Record<Language, string> = {
            vi: '⚠️ *Cách sử dụng:* `/depositsol <số_lượng>`\n\n*Ví dụ:* `/depositsol 0.1`',
            en: '⚠️ *Usage:* `/depositsol <amount>`\n\n*Example:* `/depositsol 0.1`',
            zh: '⚠️ *用法:* `/depositsol <数量>`\n\n*示例:* `/depositsol 0.1`'
        };
        await ctx.reply(usageMessages[lang], { parse_mode: 'Markdown' });
        return;
    }

    const amount = parseFloat(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t(lang, 'error_invalid_amount'));
        return;
    }

    await executeDepositSOL(ctx, walletService, balanceMonitor, amount, lang);
}

/**
 * Deposit token handler
 */
async function handleDepositToken(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length < 2) {
        const usageMessages: Record<Language, string> = {
            vi: '⚠️ *Cách sử dụng:* `/deposittoken <token> <số_lượng>`\n\n*Ví dụ:* `/deposittoken USDC 10`',
            en: '⚠️ *Usage:* `/deposittoken <token> <amount>`\n\n*Example:* `/deposittoken USDC 10`',
            zh: '⚠️ *用法:* `/deposittoken <代币> <数量>`\n\n*示例:* `/deposittoken USDC 10`'
        };
        await ctx.reply(usageMessages[lang], { parse_mode: 'Markdown' });
        return;
    }

    const token = args[0].toUpperCase() as TokenSymbol;
    const amount = parseFloat(args[1]);

    if (!(token in SUPPORTED_TOKENS) || token === 'SOL') {
        await ctx.reply(t(lang, 'error_invalid_token'));
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t(lang, 'error_invalid_amount'));
        return;
    }

    await executeDepositToken(ctx, walletService, balanceMonitor, token, amount, lang);
}

/**
 * Execute SOL deposit
 */
async function executeDepositSOL(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor,
    amount: number,
    lang: Language
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const statusMsg = await ctx.reply(t(lang, 'shield_processing', { amount, token: 'SOL' }));

    try {
        const result = await walletService.depositSOL(chatId, amount);

        if (result.success) {
            await balanceMonitor.refreshUserBalance(chatId);
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                `${t(lang, 'shield_success')}\n\n` +
                `${t(lang, 'shield_success_amount', { amount, token: 'SOL' })}\n` +
                `${t(lang, 'shield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n` +
                `${t(lang, 'shield_success_link', { signature: result.signature || '' })}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        } else {
            // Handle specific error cases
            let errorMessage = '';
            
            if (result.errorCode === 'INSUFFICIENT_BALANCE' && result.details) {
                const { required, available, shortfall, estimatedFee } = result.details;
                const messages: Record<Language, string> = {
                    vi: `❌ *Không đủ số dư!*\n\n` +
                        `📊 *Chi tiết:*\n` +
                        `• Số dư hiện tại: \`${available.toFixed(6)} SOL\`\n` +
                        `• Số lượng shield: \`${amount} SOL\`\n` +
                        `• Phí giao dịch (ước tính): \`~${estimatedFee?.toFixed(4) || '0.003'} SOL\`\n` +
                        `• Tổng cần: \`${required.toFixed(6)} SOL\`\n\n` +
                        `💰 *Cần nạp thêm:* \`${shortfall.toFixed(6)} SOL\`\n\n` +
                        `_Vui lòng nạp thêm SOL vào ví public của bạn._`,
                    en: `❌ *Insufficient balance!*\n\n` +
                        `📊 *Details:*\n` +
                        `• Current balance: \`${available.toFixed(6)} SOL\`\n` +
                        `• Shield amount: \`${amount} SOL\`\n` +
                        `• Transaction fee (estimated): \`~${estimatedFee?.toFixed(4) || '0.003'} SOL\`\n` +
                        `• Total required: \`${required.toFixed(6)} SOL\`\n\n` +
                        `💰 *Need to add:* \`${shortfall.toFixed(6)} SOL\`\n\n` +
                        `_Please add more SOL to your public wallet._`,
                    zh: `❌ *余额不足！*\n\n` +
                        `📊 *详情:*\n` +
                        `• 当前余额: \`${available.toFixed(6)} SOL\`\n` +
                        `• Shield金额: \`${amount} SOL\`\n` +
                        `• 交易费用（估计）: \`~${estimatedFee?.toFixed(4) || '0.003'} SOL\`\n` +
                        `• 需要总额: \`${required.toFixed(6)} SOL\`\n\n` +
                        `💰 *需要充值:* \`${shortfall.toFixed(6)} SOL\`\n\n` +
                        `_请向您的公共钱包添加更多 SOL。_`,
                };
                errorMessage = messages[lang];
            } else {
                errorMessage = `${t(lang, 'shield_failed')}\n\n${t(lang, 'error')} ${result.error}`;
            }

            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                errorMessage,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'shield_failed')}\n\n${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    }
}

/**
 * Execute token deposit
 */
async function executeDepositToken(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor,
    token: TokenSymbol,
    amount: number,
    lang: Language
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const statusMsg = await ctx.reply(t(lang, 'shield_processing', { amount, token }));

    try {
        const result = await walletService.depositSPL(chatId, token, amount);

        if (result.success) {
            await balanceMonitor.refreshUserBalance(chatId);
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                `${t(lang, 'shield_success')}\n\n` +
                `${t(lang, 'shield_success_amount', { amount, token })}\n` +
                `${t(lang, 'shield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n` +
                `${t(lang, 'shield_success_link', { signature: result.signature || '' })}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        } else {
            // Handle specific error cases
            let errorMessage = '';
            
            if (result.errorCode === 'INSUFFICIENT_BALANCE' && result.details) {
                const { required, available, shortfall } = result.details;
                const messages: Record<Language, string> = {
                    vi: `❌ *Không đủ số dư ${token}!*\n\n` +
                        `📊 *Chi tiết:*\n` +
                        `• Số dư hiện tại: \`${available.toFixed(6)} ${token}\`\n` +
                        `• Số lượng shield: \`${amount} ${token}\`\n\n` +
                        `💰 *Cần nạp thêm:* \`${shortfall.toFixed(6)} ${token}\`\n\n` +
                        `_Vui lòng nạp thêm ${token} vào ví public của bạn._`,
                    en: `❌ *Insufficient ${token} balance!*\n\n` +
                        `📊 *Details:*\n` +
                        `• Current balance: \`${available.toFixed(6)} ${token}\`\n` +
                        `• Shield amount: \`${amount} ${token}\`\n\n` +
                        `💰 *Need to add:* \`${shortfall.toFixed(6)} ${token}\`\n\n` +
                        `_Please add more ${token} to your public wallet._`,
                    zh: `❌ *${token} 余额不足！*\n\n` +
                        `📊 *详情:*\n` +
                        `• 当前余额: \`${available.toFixed(6)} ${token}\`\n` +
                        `• Shield金额: \`${amount} ${token}\`\n\n` +
                        `💰 *需要充值:* \`${shortfall.toFixed(6)} ${token}\`\n\n` +
                        `_请向您的公共钱包添加更多 ${token}。_`,
                };
                errorMessage = messages[lang];
            } else if (result.errorCode === 'INSUFFICIENT_FEE' && result.details) {
                const { required, available, shortfall } = result.details;
                const messages: Record<Language, string> = {
                    vi: `❌ *Không đủ SOL để trả phí giao dịch!*\n\n` +
                        `📊 *Chi tiết:*\n` +
                        `• Số dư SOL hiện tại: \`${available.toFixed(6)} SOL\`\n` +
                        `• Phí giao dịch cần: \`~${required.toFixed(4)} SOL\`\n\n` +
                        `💰 *Cần nạp thêm:* \`${shortfall.toFixed(6)} SOL\`\n\n` +
                        `_Vui lòng nạp thêm SOL vào ví để trả phí giao dịch._`,
                    en: `❌ *Insufficient SOL for transaction fee!*\n\n` +
                        `📊 *Details:*\n` +
                        `• Current SOL balance: \`${available.toFixed(6)} SOL\`\n` +
                        `• Transaction fee required: \`~${required.toFixed(4)} SOL\`\n\n` +
                        `💰 *Need to add:* \`${shortfall.toFixed(6)} SOL\`\n\n` +
                        `_Please add more SOL to your wallet to pay for transaction fees._`,
                    zh: `❌ *SOL 不足以支付交易费用！*\n\n` +
                        `📊 *详情:*\n` +
                        `• 当前 SOL 余额: \`${available.toFixed(6)} SOL\`\n` +
                        `• 所需交易费用: \`~${required.toFixed(4)} SOL\`\n\n` +
                        `💰 *需要充值:* \`${shortfall.toFixed(6)} SOL\`\n\n` +
                        `_请向您的钱包添加更多 SOL 以支付交易费用。_`,
                };
                errorMessage = messages[lang];
            } else {
                errorMessage = `${t(lang, 'shield_failed')}\n\n${t(lang, 'error')} ${result.error}`;
            }

            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                errorMessage,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'shield_failed')}\n\n${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    }
}

/**
 * Generic withdraw handler
 */
async function handleWithdraw(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length === 0) {
        // Show interactive token selection
        userStates.set(chatId, { action: 'unshield', step: 'select_token' });
        await ctx.reply(
            `${t(lang, 'unshield_title')}\n\n${t(lang, 'unshield_select_token')}`,
            { parse_mode: 'Markdown', ...getUnshieldTokenKeyboard(lang) }
        );
        return;
    }

    const amount = parseFloat(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t(lang, 'error_invalid_amount'));
        return;
    }

    const token = args[1]?.toUpperCase() || 'SOL';
    const recipientAddress = args[2] || undefined;

    if (token === 'SOL') {
        await executeWithdrawSOL(ctx, walletService, balanceMonitor, amount, recipientAddress, lang);
    } else {
        const tokenSymbol = token as TokenSymbol;
        if (!(token in SUPPORTED_TOKENS)) {
            await ctx.reply(t(lang, 'error_invalid_token'));
            return;
        }
        await executeWithdrawToken(ctx, walletService, balanceMonitor, tokenSymbol, amount, recipientAddress, lang);
    }
}

/**
 * Withdraw SOL handler
 */
async function handleWithdrawSOL(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length === 0) {
        const usageMessages: Record<Language, string> = {
            vi: '⚠️ *Cách sử dụng:* `/withdrawsol <số_lượng> [địa_chỉ]`\n\n' +
                '*Ví dụ:*\n' +
                '`/withdrawsol 0.1` - Rút về ví mình\n' +
                '`/withdrawsol 0.1 <địa_chỉ>` - Rút đến ví khác',
            en: '⚠️ *Usage:* `/withdrawsol <amount> [address]`\n\n' +
                '*Examples:*\n' +
                '`/withdrawsol 0.1` - Withdraw to own wallet\n' +
                '`/withdrawsol 0.1 <address>` - Withdraw to another wallet',
            zh: '⚠️ *用法:* `/withdrawsol <数量> [地址]`\n\n' +
                '*示例:*\n' +
                '`/withdrawsol 0.1` - 提取到自己钱包\n' +
                '`/withdrawsol 0.1 <地址>` - 提取到其他钱包'
        };
        await ctx.reply(usageMessages[lang], { parse_mode: 'Markdown' });
        return;
    }

    const amount = parseFloat(args[0]);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t(lang, 'error_invalid_amount'));
        return;
    }

    const recipientAddress = args[1] || undefined;
    await executeWithdrawSOL(ctx, walletService, balanceMonitor, amount, recipientAddress, lang);
}

/**
 * Withdraw token handler
 */
async function handleWithdrawToken(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const args = text.split(' ').slice(1);

    if (args.length < 2) {
        const usageMessages: Record<Language, string> = {
            vi: '⚠️ *Cách sử dụng:* `/withdrawtoken <token> <số_lượng> [địa_chỉ]`\n\n' +
                '*Ví dụ:*\n' +
                '`/withdrawtoken USDC 10` - Rút về ví mình\n' +
                '`/withdrawtoken USDC 10 <địa_chỉ>` - Rút đến ví khác',
            en: '⚠️ *Usage:* `/withdrawtoken <token> <amount> [address]`\n\n' +
                '*Examples:*\n' +
                '`/withdrawtoken USDC 10` - Withdraw to own wallet\n' +
                '`/withdrawtoken USDC 10 <address>` - Withdraw to another wallet',
            zh: '⚠️ *用法:* `/withdrawtoken <代币> <数量> [地址]`\n\n' +
                '*示例:*\n' +
                '`/withdrawtoken USDC 10` - 提取到自己钱包\n' +
                '`/withdrawtoken USDC 10 <地址>` - 提取到其他钱包'
        };
        await ctx.reply(usageMessages[lang], { parse_mode: 'Markdown' });
        return;
    }

    const token = args[0].toUpperCase() as TokenSymbol;
    const amount = parseFloat(args[1]);
    const recipientAddress = args[2] || undefined;

    if (!(token in SUPPORTED_TOKENS) || token === 'SOL') {
        await ctx.reply(t(lang, 'error_invalid_token'));
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        await ctx.reply(t(lang, 'error_invalid_amount'));
        return;
    }

    await executeWithdrawToken(ctx, walletService, balanceMonitor, token, amount, recipientAddress, lang);
}

/**
 * Execute SOL withdrawal
 */
async function executeWithdrawSOL(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor,
    amount: number,
    recipientAddress: string | undefined,
    lang: Language
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const wallet = walletService.getWallet(chatId);
    const recipient = recipientAddress || wallet?.publicKey || '';
    
    // Calculate estimated fees
    const feeInfo = calculateWithdrawFee(amount);

    const statusMsg = await ctx.reply(
        `${t(lang, 'unshield_processing', { amount, token: 'SOL' })}\n` +
        `📍 ${lang === 'vi' ? 'Đến' : lang === 'en' ? 'To' : '发送至'}: \`${shortenAddress(recipient)}\`\n\n` +
        `💰 *${lang === 'vi' ? 'Phí Privacy Cash' : lang === 'en' ? 'Privacy Cash Fee' : '隐私现金费用'}:*\n` +
        `• ${lang === 'vi' ? 'Phí cơ bản' : lang === 'en' ? 'Base fee' : '基础费用'}: \`${PRIVACY_CASH_FEES.withdraw.baseFeeSOL} SOL\`\n` +
        `• ${lang === 'vi' ? 'Phí 0.35%' : lang === 'en' ? '0.35% fee' : '0.35% 费用'}: \`~${feeInfo.percentageFee.toFixed(6)} SOL\`\n` +
        `• ${lang === 'vi' ? 'Tổng phí ước tính' : lang === 'en' ? 'Estimated total fee' : '估计总费用'}: \`~${feeInfo.totalFee.toFixed(6)} SOL\`\n` +
        `• ${lang === 'vi' ? 'Nhận được ước tính' : lang === 'en' ? 'Estimated received' : '预计收到'}: \`~${feeInfo.amountAfterFee.toFixed(6)} SOL\``,
        { parse_mode: 'Markdown' }
    );

    try {
        const result = await walletService.withdrawSOL(chatId, amount, recipientAddress);

        if (result.success) {
            await balanceMonitor.refreshUserBalance(chatId);
            const actualAmount = (result.actualAmount || 0) / 1e9;
            const fee = (result.fee || 0) / 1e9;
            
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                `${t(lang, 'unshield_success')}\n\n` +
                `${t(lang, 'unshield_success_amount', { amount })}\n` +
                `${t(lang, 'unshield_success_received', { amount: actualAmount.toFixed(6) })}\n` +
                `${t(lang, 'unshield_success_fee', { fee: fee.toFixed(6) })}\n` +
                `${t(lang, 'unshield_success_to', { address: shortenAddress(recipient) })}\n` +
                `${t(lang, 'unshield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n` +
                `${t(lang, 'unshield_success_link', { signature: result.signature || '' })}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        } else {
            // Check for insufficient private balance
            const errorMessage = result.error || '';
            const insufficientMatch = errorMessage.match(/insufficient|not enough/i);
            
            if (insufficientMatch) {
                const messages: Record<Language, string> = {
                    vi: `❌ *Không đủ số dư riêng tư!*\n\n` +
                        `Số dư private không đủ để unshield ${amount} SOL.\n\n` +
                        `💡 _Hãy kiểm tra số dư private của bạn bằng lệnh /balance_`,
                    en: `❌ *Insufficient private balance!*\n\n` +
                        `Private balance is not enough to unshield ${amount} SOL.\n\n` +
                        `💡 _Check your private balance with /balance command_`,
                    zh: `❌ *私人余额不足！*\n\n` +
                        `私人余额不足以unshield ${amount} SOL。\n\n` +
                        `💡 _使用 /balance 命令检查您的私人余额_`,
                };
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    messages[lang],
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            } else {
                await ctx.telegram.editMessageText(
                    chatId,
                    statusMsg.message_id,
                    undefined,
                    `${t(lang, 'unshield_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                    { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
                );
            }
        }
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'unshield_failed')}\n\n${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    }
}

/**
 * Execute token withdrawal
 */
async function executeWithdrawToken(
    ctx: Context,
    walletService: WalletService,
    balanceMonitor: BalanceMonitor,
    token: TokenSymbol,
    amount: number,
    recipientAddress: string | undefined,
    lang: Language
): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const wallet = walletService.getWallet(chatId);
    const recipient = recipientAddress || wallet?.publicKey || '';

    const statusMsg = await ctx.reply(
        `${t(lang, 'unshield_processing', { amount, token })}\n` +
        `📍 ${lang === 'vi' ? 'Đến' : lang === 'en' ? 'To' : '发送至'}: \`${shortenAddress(recipient)}\``,
        { parse_mode: 'Markdown' }
    );

    try {
        const result = await walletService.withdrawSPL(chatId, token, amount, recipientAddress);

        if (result.success) {
            await balanceMonitor.refreshUserBalance(chatId);
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                `${t(lang, 'unshield_success')}\n\n` +
                `${t(lang, 'unshield_success_token', { token })}\n` +
                `${t(lang, 'unshield_success_amount', { amount })}\n` +
                `${t(lang, 'unshield_success_to', { address: shortenAddress(recipient) })}\n` +
                `${t(lang, 'unshield_success_signature', { signature: shortenAddress(result.signature || '', 8) })}\n` +
                `${t(lang, 'unshield_success_link', { signature: result.signature || '' })}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        } else {
            await ctx.telegram.editMessageText(
                chatId,
                statusMsg.message_id,
                undefined,
                `${t(lang, 'unshield_failed')}\n\n${t(lang, 'error')} ${result.error}`,
                { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
            );
        }
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'unshield_failed')}\n\n${t(lang, 'error')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`,
            { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
        );
    }
}

/**
 * Enable monitoring handler
 */
async function handleMonitor(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    walletService.toggleMonitoring(chatId, true);
    await ctx.reply(
        `${t(lang, 'monitor_enabled_title')}\n\n${t(lang, 'monitor_enabled_message')}`,
        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
    );
}

/**
 * Disable monitoring handler
 */
async function handleStopMonitor(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    walletService.toggleMonitoring(chatId, false);
    await ctx.reply(
        `${t(lang, 'monitor_disabled_title')}\n\n${t(lang, 'monitor_disabled_message')}`,
        { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) }
    );
}

/**
 * List supported tokens handler
 */
async function handleTokens(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id || 0;
    const lang = getLang(chatId);
    
    let message = `${t(lang, 'tokens_title')}\n\n`;

    for (const [symbol, info] of Object.entries(SUPPORTED_TOKENS)) {
        message += `${info.icon} *${symbol}* - ${info.name}\n`;
        message += `   ${t(lang, 'tokens_decimals')} ${info.decimals}\n`;
        message += `   ${t(lang, 'tokens_mint')} \`${shortenAddress(info.mintAddress, 6)}\`\n\n`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown', ...getBackToMenuKeyboard(lang) });
}

/**
 * Clear cache handler
 */
async function handleClearCache(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'));
        return;
    }

    const statusMsg = await ctx.reply(t(lang, 'cache_clearing'));

    try {
        await walletService.clearCache(chatId);
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            t(lang, 'cache_cleared'),
            getBackToMenuKeyboard(lang)
        );
    } catch (error) {
        await ctx.telegram.editMessageText(
            chatId,
            statusMsg.message_id,
            undefined,
            `${t(lang, 'cache_failed')} ${error instanceof Error ? error.message : t(lang, 'error_unknown')}`
        );
    }
}

/**
 * Private Transfer command handler - /transfer
 */
async function handlePrivateTransfer(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
        return;
    }

    userStates.set(chatId, { action: 'private_transfer', step: 'select_token' });
    await ctx.reply(
        `${t(lang, 'private_transfer_title')}\n\n` +
        `${t(lang, 'private_transfer_description')}\n\n` +
        `${t(lang, 'private_transfer_select_token')}`,
        { parse_mode: 'Markdown', ...getPrivateTransferTokenKeyboard(lang) }
    );
}

/**
 * Multi Private Send command handler - /multisend
 */
async function handleMultiPrivateSend(ctx: Context, walletService: WalletService): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const lang = getLang(chatId);

    if (!walletService.hasWallet(chatId)) {
        await ctx.reply(t(lang, 'error_no_wallet'), getMainMenuKeyboard(false, lang));
        return;
    }

    userStates.set(chatId, { action: 'multi_private_send', step: 'select_token' });
    await ctx.reply(
        `${t(lang, 'multi_send_title')}\n\n` +
        `${t(lang, 'multi_send_description')}\n\n` +
        `${t(lang, 'multi_send_select_token')}`,
        { parse_mode: 'Markdown', ...getMultiPrivateSendTokenKeyboard(lang) }
    );
}
