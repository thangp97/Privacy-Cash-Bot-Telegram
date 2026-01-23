/**
 * Natural Language Processing Handler
 * Parses user messages to detect intents and extract parameters
 */

import { TokenSymbol, SUPPORTED_TOKENS } from '../config.js';

export type Intent = 
    | 'deposit'
    | 'withdraw'
    | 'transfer'
    | 'balance'
    | 'private_balance'
    | 'wallet_info'
    | 'help'
    | 'create_wallet'
    | 'export_key'
    | 'unknown';

export interface ParsedCommand {
    intent: Intent;
    amount?: number;
    token?: TokenSymbol;
    address?: string;
    confidence: number; // 0-1, how confident we are in the parsing
    originalMessage: string;
}

// Patterns for different intents in multiple languages
const intentPatterns: Record<Intent, RegExp[]> = {
    deposit: [
        // English
        /(?:deposit|add|put|send\s+to\s+private|nạp|gửi|chuyển\s+vào)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /(?:i\s+want\s+to\s+)?deposit\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /nạp\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /存入\s*(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
    ],
    withdraw: [
        // Withdraw to self
        /(?:withdraw|rút|取出|lấy\s+ra)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?(?:\s+(?:to\s+)?(?:my\s+)?(?:wallet|ví|自己))?$/i,
        /(?:i\s+want\s+to\s+)?withdraw\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /rút\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
    ],
    transfer: [
        // Transfer/withdraw to specific address
        /(?:transfer|send|chuyển|gửi|转账)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến|tới|给)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
        /(?:withdraw|rút|取出)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến|tới|给)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
        /(?:send|gửi)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến)\s+(?:this\s+)?(?:wallet|address|ví|địa\s+chỉ)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
    ],
    balance: [
        /(?:check|show|view|xem|kiểm\s*tra|查看)\s*(?:my\s+)?(?:balance|số\s*dư|余额)/i,
        /(?:what(?:'s|\s+is)\s+)?(?:my\s+)?balance/i,
        /số\s*dư\s*(?:của\s+tôi)?/i,
        /(?:how\s+much|bao\s+nhiêu)\s+(?:do\s+i\s+have|tôi\s+có)/i,
    ],
    private_balance: [
        /(?:check|show|view|xem|kiểm\s*tra|查看)\s*(?:my\s+)?(?:private|riêng\s*tư|私密)\s*(?:balance|số\s*dư|余额)/i,
        /(?:private|riêng\s*tư)\s*(?:balance|số\s*dư)/i,
        /số\s*dư\s*riêng\s*tư/i,
    ],
    wallet_info: [
        /(?:show|view|xem|check)\s*(?:my\s+)?(?:wallet|ví|钱包)/i,
        /(?:wallet|ví)\s*(?:info|information|thông\s*tin|信息)?/i,
        /(?:my\s+)?(?:address|địa\s*chỉ|地址)/i,
    ],
    help: [
        /(?:help|trợ\s*giúp|hướng\s*dẫn|帮助|怎么用)/i,
        /(?:how\s+(?:to|do\s+i)|làm\s+sao|cách)/i,
        /(?:what\s+can\s+(?:you|this\s+bot)\s+do)/i,
    ],
    create_wallet: [
        /(?:create|tạo|新建)\s*(?:new\s+)?(?:wallet|ví|钱包)/i,
        /(?:i\s+)?(?:want|need|muốn|cần)\s+(?:a\s+)?(?:new\s+)?(?:wallet|ví)/i,
    ],
    export_key: [
        /(?:export|xuất|导出)\s*(?:my\s+)?(?:private\s*)?(?:key|khóa|密钥)/i,
        /(?:show|xem|显示)\s*(?:my\s+)?(?:private\s*)?(?:key|khóa)/i,
        /(?:private\s*key|khóa\s*riêng)/i,
    ],
    unknown: [],
};

// Quick responses for simple queries
const quickResponses: Record<string, Intent> = {
    'balance': 'balance',
    'số dư': 'balance',
    '余额': 'balance',
    'wallet': 'wallet_info',
    'ví': 'wallet_info',
    '钱包': 'wallet_info',
    'help': 'help',
    'trợ giúp': 'help',
    '帮助': 'help',
};

/**
 * Parse a natural language message and extract intent and parameters
 */
export function parseNaturalLanguage(message: string): ParsedCommand | null {
    const trimmedMessage = message.trim().toLowerCase();
    
    // Check quick responses first
    for (const [phrase, intent] of Object.entries(quickResponses)) {
        if (trimmedMessage === phrase) {
            return {
                intent,
                confidence: 1.0,
                originalMessage: message,
            };
        }
    }

    // Check transfer patterns first (most specific)
    for (const pattern of intentPatterns.transfer) {
        const match = message.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            const token = parseTokenFromMatch(match[2]);
            const address = match[3];
            
            if (amount > 0 && isValidSolanaAddress(address)) {
                return {
                    intent: 'transfer',
                    amount,
                    token,
                    address,
                    confidence: 0.9,
                    originalMessage: message,
                };
            }
        }
    }

    // Check deposit patterns
    for (const pattern of intentPatterns.deposit) {
        const match = message.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            const token = parseTokenFromMatch(match[2]);
            
            if (amount > 0) {
                return {
                    intent: 'deposit',
                    amount,
                    token,
                    confidence: 0.85,
                    originalMessage: message,
                };
            }
        }
    }

    // Check withdraw patterns
    for (const pattern of intentPatterns.withdraw) {
        const match = message.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            const token = parseTokenFromMatch(match[2]);
            
            if (amount > 0) {
                return {
                    intent: 'withdraw',
                    amount,
                    token,
                    confidence: 0.85,
                    originalMessage: message,
                };
            }
        }
    }

    // Check other intents
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
        if (intent === 'deposit' || intent === 'withdraw' || intent === 'transfer' || intent === 'unknown') {
            continue;
        }
        
        for (const pattern of patterns) {
            if (pattern.test(message)) {
                return {
                    intent: intent as Intent,
                    confidence: 0.8,
                    originalMessage: message,
                };
            }
        }
    }

    // Try to detect if there's an amount and address mentioned
    const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
    const addressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
    const tokenMatch = message.match(/\b(sol|usdc|usdt|zec|ore|store)\b/i);

    if (amountMatch && addressMatch) {
        return {
            intent: 'transfer',
            amount: parseFloat(amountMatch[1]),
            token: parseTokenFromMatch(tokenMatch?.[1]),
            address: addressMatch[1],
            confidence: 0.6,
            originalMessage: message,
        };
    }

    return null;
}

/**
 * Parse token symbol from regex match
 */
function parseTokenFromMatch(tokenStr: string | undefined): TokenSymbol {
    if (!tokenStr) return 'SOL';
    const upper = tokenStr.toUpperCase();
    if (upper in SUPPORTED_TOKENS) {
        return upper as TokenSymbol;
    }
    return 'SOL';
}

/**
 * Validate Solana address
 */
function isValidSolanaAddress(address: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
}

/**
 * Generate confirmation message for parsed command
 */
export function generateConfirmationMessage(parsed: ParsedCommand, lang: 'vi' | 'en' | 'zh'): string {
    const messages: Record<string, Record<string, string>> = {
        deposit: {
            vi: `Tôi hiểu bạn muốn *nạp ${parsed.amount} ${parsed.token || 'SOL'}* vào Privacy Cash.\n\nBấm xác nhận để tiếp tục:`,
            en: `I understand you want to *deposit ${parsed.amount} ${parsed.token || 'SOL'}* to Privacy Cash.\n\nClick confirm to continue:`,
            zh: `我理解您想要*存入 ${parsed.amount} ${parsed.token || 'SOL'}* 到 Privacy Cash。\n\n点击确认继续:`,
        },
        withdraw: {
            vi: `Tôi hiểu bạn muốn *rút ${parsed.amount} ${parsed.token || 'SOL'}* về ví của bạn.\n\nBấm xác nhận để tiếp tục:`,
            en: `I understand you want to *withdraw ${parsed.amount} ${parsed.token || 'SOL'}* to your wallet.\n\nClick confirm to continue:`,
            zh: `我理解您想要*提取 ${parsed.amount} ${parsed.token || 'SOL'}* 到您的钱包。\n\n点击确认继续:`,
        },
        transfer: {
            vi: `Tôi hiểu bạn muốn *chuyển ${parsed.amount} ${parsed.token || 'SOL'}* đến:\n\`${parsed.address}\`\n\nBấm xác nhận để tiếp tục:`,
            en: `I understand you want to *transfer ${parsed.amount} ${parsed.token || 'SOL'}* to:\n\`${parsed.address}\`\n\nClick confirm to continue:`,
            zh: `我理解您想要*转账 ${parsed.amount} ${parsed.token || 'SOL'}* 到:\n\`${parsed.address}\`\n\n点击确认继续:`,
        },
    };

    return messages[parsed.intent]?.[lang] || messages[parsed.intent]?.['en'] || '';
}

/**
 * Check if message looks like a natural language command
 */
export function isNaturalLanguageCommand(message: string): boolean {
    // Skip if it starts with / (regular command)
    if (message.startsWith('/')) return false;
    
    // Skip if it's just a number (amount input for ongoing operation)
    if (/^\d+(\.\d+)?$/.test(message.trim())) return false;
    
    // Skip if it's just an address (address input for ongoing operation)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(message.trim())) return false;
    
    // Check if it contains action words
    const actionWords = [
        'deposit', 'withdraw', 'transfer', 'send', 'check', 'show', 'view',
        'nạp', 'rút', 'chuyển', 'gửi', 'xem', 'kiểm tra',
        '存入', '取出', '转账', '查看',
        'balance', 'wallet', 'help',
        'số dư', 'ví', 'trợ giúp',
        '余额', '钱包', '帮助',
    ];
    
    const lowerMessage = message.toLowerCase();
    return actionWords.some(word => lowerMessage.includes(word));
}
