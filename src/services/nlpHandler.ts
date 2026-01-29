/**
 * Natural Language Processing Handler
 * Parses user messages to detect intents and extract parameters
 */

import { TokenSymbol, SUPPORTED_TOKENS } from '../config.js';

export type Intent =
    | 'shield'
    | 'unshield'
    | 'private_transfer'
    | 'balance'
    | 'private_balance'
    | 'wallet_info'
    | 'help'
    | 'create_wallet'
    | 'export_key'
    | 'greetings'
    | 'thank_you'
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
    shield: [
        // Shield patterns
        /(?:shield|deposit|add|put|send\s+to\s+private|nạp|gửi|chuyển\s+vào)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /(?:i\s+want\s+to\s+)?(?:shield|deposit)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /nạp\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /存入\s*(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /shield\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
    ],
    unshield: [
        // Unshield to self
        /(?:unshield|withdraw|rút|取出|lấy\s+ra)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?(?:\s+(?:to\s+)?(?:my\s+)?(?:wallet|ví|自己))?$/i,
        /(?:i\s+want\s+to\s+)?(?:unshield|withdraw)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /rút\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
    ],
    private_transfer: [
        // Private Transfer/send to specific address
        /(?:private\s*transfer|chuyển\s*riêng\s*tư|私密转账)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến|tới|给)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
        /(?:transfer|send|pay|give|chuyển|gửi|trả|chuyển\s*cho|转账)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến|tới|cho|给)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
        /(?:transfer|send|pay|give|chuyển|gửi|trả|chuyển\s*cho|转账)\s+(?:to|đến|tới|cho|给)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?/i,
        /(?:unshield|withdraw|rút|取出)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến|tới|给)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
        /(?:send|gửi)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?\s+(?:to|đến)\s+(?:this\s+)?(?:wallet|address|ví|địa\s+chỉ)\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i,
    ],
    balance: [
        /(?:check|show|view|see|xem|kiểm\s*tra|查看)\s*(?:my\s+)?(?:balance|funds|money|số\s*dư|tiền|余额)/i,
        /(?:what(?:'s|\s+is)\s+)?(?:my\s+)?(?:balance|current\s*balance)/i,
        /số\s*dư\s*(?:của\s+tôi)?/i,
        /(?:how\s+much|bao\s+nhiêu)\s+(?:money|funds|sol|token|do\s+i\s+have|tôi\s+có)/i,
        /(?:do\s+i\s+have)\s+(?:any\s+)?(?:money|funds|balance)/i,
    ],
    private_balance: [
        /(?:check|show|view|see|xem|kiểm\s*tra|查看)\s*(?:my\s+)?(?:private|hidden|shielded|riêng\s*tư|ẩn|私密)\s*(?:balance|funds|money|số\s*dư|tiền|余额)/i,
        /(?:private|riêng\s*tư)\s*(?:balance|số\s*dư)/i,
        /số\s*dư\s*(?:riêng\s*tư|ẩn)/i,
    ],
    wallet_info: [
        /(?:show|view|xem|check)\s*(?:my\s+)?(?:wallet|address|info|ví|địa\s*chỉ|thông\s*tin|钱包|地址)/i,
        /(?:wallet|ví)\s*(?:info|information|thông\s*tin|信息|address|địa\s*chỉ)?/i,
        /(?:my\s+)?(?:address|địa\s*chỉ|地址)(?:\s+is)?/i,
        /(?:where\s+is|lấy)\s*(?:my\s+)?(?:wallet|address|ví)/i,
    ],
    help: [
        /(?:help|support|guide|trợ\s*giúp|hướng\s*dẫn|giúp|cách\s*dùng|帮助|怎么用)/i,
        /(?:how\s+(?:to|do\s+i)|làm\s+(?:sao|thế\s*nào)|cách)/i,
        /(?:what\s+can\s+(?:you|this\s+bot)\s+do)/i,
        /(?:chức\s*năng)/i,
    ],
    create_wallet: [
        /(?:create|make|generate|tạo|lập|新建)\s*(?:a\s+)?(?:new\s+)?(?:wallet|account|ví|tài\s*khoản|钱包)/i,
        /(?:i\s+)?(?:want|need|muốn|cần)\s+(?:a\s+)?(?:new\s+)?(?:wallet|ví)/i,
    ],
    export_key: [
        /(?:export|reveal|show|xuất|hiện|xem|lấy|导出)\s*(?:my\s+)?(?:private\s*)?(?:key|secret|khóa|mật\s*khẩu|密钥)/i,
        /(?:private\s*key|khóa\s*riêng)/i,
    ],
    greetings: [
        /(?:hi|hello|hey|yo|greetings|xin\s*chào|chào|alo|你好|您好)/i,
        /(?:good\s+(?:morning|afternoon|evening)|chào\s+buổi\s+(?:sáng|chiều|tối))/i,
    ],
    thank_you: [
        /(?:thank|thanks|tks|ty|cảm\s*ơn|cám\s*ơn|biết\s*ơn|thx|谢谢|感谢)/i,
    ],
    unknown: [],
};

// Quick responses for simple queries
const quickResponses: Record<string, Intent> = {
    'balance': 'balance',
    'số dư': 'balance',
    'tiền': 'balance',
    '余额': 'balance',
    'wallet': 'wallet_info',
    'ví': 'wallet_info',
    'địa chỉ': 'wallet_info',
    'address': 'wallet_info',
    '钱包': 'wallet_info',
    'help': 'help',
    'giúp': 'help',
    'trợ giúp': 'help',
    'hướng dẫn': 'help',
    '帮助': 'help',
    'hi': 'greetings',
    'hello': 'greetings',
    'chào': 'greetings',
    'xin chào': 'greetings',
    'thanks': 'thank_you',
    'thank you': 'thank_you',
    'cảm ơn': 'thank_you',
};

/**
 * Parse a natural language message and extract intent and parameters
 */
export function parseNaturalLanguage(message: string): ParsedCommand | null {
    const trimmedMessage = message.trim().toLowerCase();

    // Check quick responses first
    for (const [phrase, intent] of Object.entries(quickResponses)) {
        if (trimmedMessage === phrase || trimmedMessage.replace(/[^\w\s]/gi, '') === phrase) {
            return {
                intent,
                confidence: 1.0,
                originalMessage: message,
            };
        }
    }

    // Check private_transfer patterns first (most specific)
    for (const pattern of intentPatterns.private_transfer) {
        const match = message.match(pattern);
        if (match) {
            // Need to handle different capturing group positions based on pattern
            // Pattern 1 & 2: amount (1), token (2), address (3)
            // Pattern 3: address (1), amount (2), token (3)
            let amount: number;
            let tokenStr: string | undefined;
            let address: string;

            if (pattern.source.includes('to') && pattern.source.indexOf('to') < pattern.source.indexOf('\\d+')) {
                // Pattern 3: Address first
                address = match[1];
                amount = parseFloat(match[2]);
                tokenStr = match[3];
            } else {
                // Payment/Transfer: Amount first or standard
                // We need to be careful matching the right groups. 
                // Let's rely on looking at the content of the groups
                const g1 = match[1];
                const g2 = match[2];
                const g3 = match[3];

                if (isValidSolanaAddress(g1)) {
                    address = g1;
                    amount = parseFloat(g2);
                    tokenStr = g3;
                } else if (isValidSolanaAddress(g3)) {
                    amount = parseFloat(g1);
                    tokenStr = g2;
                    address = g3;
                } else {
                    continue; // Should not happen with current regexes
                }
            }

            const token = parseTokenFromMatch(tokenStr);

            if (amount > 0 && isValidSolanaAddress(address)) {
                return {
                    intent: 'private_transfer',
                    amount,
                    token,
                    address,
                    confidence: 0.9,
                    originalMessage: message,
                };
            }
        }
    }

    // Check shield patterns
    for (const pattern of intentPatterns.shield) {
        const match = message.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            const token = parseTokenFromMatch(match[2]);

            if (amount > 0) {
                return {
                    intent: 'shield',
                    amount,
                    token,
                    confidence: 0.85,
                    originalMessage: message,
                };
            }
        }
    }

    // Check unshield patterns
    for (const pattern of intentPatterns.unshield) {
        const match = message.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            const token = parseTokenFromMatch(match[2]);

            if (amount > 0) {
                return {
                    intent: 'unshield',
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
        if (intent === 'shield' || intent === 'unshield' || intent === 'private_transfer' || intent === 'unknown' || intent === 'greetings' || intent === 'thank_you') {
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

    // Check partial patterns (lower priority)
    // Partial Transfer: Amount but no address
    const partialTransferAmount = message.match(/(?:transfer|send|pay|give|chuyển|gửi|trả|转账)\s+(\d+(?:\.\d+)?)\s*(sol|usdc|usdt|zec|ore|store)?(?!\s+(?:to|đến|tới|cho|给))/i);
    if (partialTransferAmount) {
        return {
            intent: 'private_transfer',
            amount: parseFloat(partialTransferAmount[1]),
            token: parseTokenFromMatch(partialTransferAmount[2]),
            confidence: 0.7,
            originalMessage: message,
        };
    }

    // Partial Transfer: Address but no amount
    const partialTransferAddress = message.match(/(?:transfer|send|pay|give|chuyển|gửi|trả|转账)\s+(?:to|đến|tới|cho|给)?\s*:?\s*([1-9A-HJ-NP-Za-km-z]{32,44})/i);
    if (partialTransferAddress) {
        return {
            intent: 'private_transfer',
            address: partialTransferAddress[1],
            confidence: 0.7,
            originalMessage: message,
        };
    }

    // Partial Shield: Intent but no amount
    const partialShield = message.match(/(?:shield|deposit|nạp|存入)$/i);
    if (partialShield) {
        return {
            intent: 'shield',
            confidence: 0.6,
            originalMessage: message,
        };
    }

    // Partial Unshield: Intent but no amount
    const partialUnshield = message.match(/(?:unshield|withdraw|rút|取出)$/i);
    if (partialUnshield) {
        return {
            intent: 'unshield',
            confidence: 0.6,
            originalMessage: message,
        };
    }

    // Try to detect if there's an amount and address mentioned
    const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
    const addressMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
    const tokenMatch = message.match(/\b(sol|usdc|usdt|zec|ore|store)\b/i);

    if (amountMatch && addressMatch) {
        return {
            intent: 'private_transfer',
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
        shield: {
            vi: `Tôi hiểu bạn muốn *shield ${parsed.amount} ${parsed.token || 'SOL'}* vào Privacy Cash.\n\nBấm xác nhận để tiếp tục:`,
            en: `I understand you want to *shield ${parsed.amount} ${parsed.token || 'SOL'}* to Privacy Cash.\n\nClick confirm to continue:`,
            zh: `我理解您想要*shield ${parsed.amount} ${parsed.token || 'SOL'}* 到 Privacy Cash。\n\n点击确认继续:`,
        },
        unshield: {
            vi: `Tôi hiểu bạn muốn *unshield ${parsed.amount} ${parsed.token || 'SOL'}* về ví của bạn.\n\nBấm xác nhận để tiếp tục:`,
            en: `I understand you want to *unshield ${parsed.amount} ${parsed.token || 'SOL'}* to your wallet.\n\nClick confirm to continue:`,
            zh: `我理解您想要*unshield ${parsed.amount} ${parsed.token || 'SOL'}* 到您的钱包。\n\n点击确认继续:`,
        },
        private_transfer: {
            vi: `Tôi hiểu bạn muốn *chuyển riêng tư ${parsed.amount} ${parsed.token || 'SOL'}* đến:\n\`${parsed.address}\`\n\nBấm xác nhận để tiếp tục:`,
            en: `I understand you want to *private transfer ${parsed.amount} ${parsed.token || 'SOL'}* to:\n\`${parsed.address}\`\n\nClick confirm to continue:`,
            zh: `我理解您想要*私密转账 ${parsed.amount} ${parsed.token || 'SOL'}* 到:\n\`${parsed.address}\`\n\n点击确认继续:`,
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

    // Check if it contains action words or keywords
    const actionWords = [
        // Actions
        'shield', 'unshield', 'private transfer', 'transfer', 'send', 'check', 'show', 'view', 'see', 'pay', 'give',
        'nạp', 'rút', 'chuyển', 'gửi', 'xem', 'kiểm tra', 'trả', 'lấy',
        '存入', '取出', '转账', '查看', '私密转账',
        'deposit', 'withdraw', 'create', 'make', 'generate', 'export', 'reveal',
        'tạo', 'lập', 'xuất', 'hiện',
        // Nouns
        'balance', 'funds', 'money', 'wallet', 'help', 'guide', 'address', 'key', 'token',
        'số dư', 'ví', 'tiền', 'tài khoản', 'địa chỉ', 'khóa', 'cách dùng', 'chức năng', 'hướng dẫn', 'trợ giúp',
        '余额', '钱包', '地址', '密钥', '帮助',
        // Greetings / Social
        'hi', 'hello', 'hey', 'greetings', 'thanks', 'thank', 'chào', 'cảm ơn', 'cám ơn', '你好', '谢谢'
    ];

    const lowerMessage = message.toLowerCase();
    return actionWords.some(word => lowerMessage.includes(word));
}
