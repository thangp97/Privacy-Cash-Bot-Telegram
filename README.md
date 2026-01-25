# Privacy Cash Telegram Bot

A Telegram bot for interacting with the Privacy Cash SDK on Solana blockchain - enabling private transactions.

## 🌟 Features

- 💰 **Deposit**: Deposit SOL and SPL tokens into Privacy Cash
- 💸 **Withdraw**: Withdraw SOL and tokens from Privacy Cash privately
- 📊 **Balance Check**: View public and private balances
- 🔔 **Balance Monitoring**: Receive notifications when balance changes
- 🪙 **Multi-token Support**: SOL, USDC, USDT, ZEC, ORE, STORE

## 📋 Requirements

- Node.js version 24 or higher
- Telegram Bot Token (get from [@BotFather](https://t.me/BotFather))
- Solana RPC URL (can use public RPC or services like Helius, QuickNode)

## 🚀 Installation

### 1. Clone and install dependencies

```bash
cd privacy-cash-telegram-bot
npm install
```

### 2. Configure environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
# Telegram Bot Token (required)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Solana RPC URL (private RPC recommended for better performance)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Balance check interval (minutes)
BALANCE_CHECK_INTERVAL=5

# Debug mode
DEBUG_MODE=false
```

### 3. Build and run

```bash
# Build TypeScript
npm run build

# Run bot
npm start

# Or run in development mode
npm run dev
```

## 📱 Usage Guide

### Connect Wallet

1. Open chat with the bot on Telegram
2. Send command `/connect <private_key>` with your private key
3. Bot will confirm successful connection

⚠️ **Security Notice**: 
- Delete the message containing your private key immediately after sending
- Private key is stored locally and encrypted
- Never share your private key with anyone

### Main Commands

#### Wallet Management
| Command | Description |
|---------|-------------|
| `/start` | Start and view guide |
| `/help` | List all commands |
| `/connect <key>` | Connect wallet with private key |
| `/disconnect` | Disconnect wallet |
| `/wallet` | View wallet information |

#### Balance
| Command | Description |
|---------|-------------|
| `/balance` | View all balances (public + private) |
| `/privatebalance` | View only Privacy Cash balance |

#### Deposit
| Command | Description |
|---------|-------------|
| `/deposit <amount>` | Deposit SOL |
| `/deposit <amount> <token>` | Deposit token (USDC, USDT, ...) |
| `/depositsol <amount>` | Deposit SOL |
| `/deposittoken <token> <amount>` | Deposit SPL token |

#### Withdraw
| Command | Description |
|---------|-------------|
| `/withdraw <amount>` | Withdraw SOL to your wallet |
| `/withdraw <amount> <token>` | Withdraw token to your wallet |
| `/withdraw <amount> <token> <address>` | Withdraw to another address |
| `/withdrawsol <amount> [address]` | Withdraw SOL |
| `/withdrawtoken <token> <amount> [address]` | Withdraw SPL token |

#### Balance Monitoring
| Command | Description |
|---------|-------------|
| `/monitor` | Enable notifications on balance changes |
| `/stopmonitor` | Disable notifications |

#### Utilities
| Command | Description |
|---------|-------------|
| `/tokens` | List of supported tokens |
| `/clearcache` | Clear local cache |

### Usage Examples

```
/deposit 0.1                    # Deposit 0.1 SOL
/deposit 10 USDC                # Deposit 10 USDC
/withdraw 0.05                  # Withdraw 0.05 SOL to your wallet
/withdraw 5 USDC                # Withdraw 5 USDC to your wallet
/withdrawsol 0.1 abc...xyz      # Withdraw 0.1 SOL to another address
/withdrawtoken USDC 10 abc...   # Withdraw 10 USDC to another address
```

## 🔧 Supported Tokens

| Token | Mint Address |
|-------|--------------|
| SOL | So11111111111111111111111111111111111111112 |
| USDC | EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v |
| USDT | Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB |
| ZEC | A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS |
| ORE | oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp |
| STORE | sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH |

## 📁 Project Structure

```
privacy-cash-telegram-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Configuration
│   ├── utils.ts              # Utility functions
│   ├── commands/
│   │   └── index.ts          # Command handlers
│   └── services/
│       ├── index.ts          # Services export
│       ├── walletService.ts  # Wallet and transaction management
│       └── balanceMonitor.ts # Balance monitoring
├── user_data/                # User data (auto-created)
├── cache/                    # Cache (auto-created)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## ⚠️ Important Notes

1. **Private Key Security**: The bot stores private keys locally. Make sure to protect the `user_data/` directory.

2. **Transaction Fees**: Withdrawing from Privacy Cash incurs fees. Check the actual received amount after transaction.

3. **RPC URL**: It's recommended to use a private RPC for better speed and stability.

4. **Node.js Version**: Requires Node.js 24+ for Privacy Cash SDK compatibility.

## 🐛 Common Error Handling

### "Insufficient balance"
- Check if public balance is sufficient for deposit transactions
- Check if private balance is sufficient for withdrawal transactions

### "Invalid private key"
- Ensure private key is in correct format (base58)
- Private key must be a valid Solana key

### "Rate limit"
- Wait a moment and try again
- Consider using a private RPC

## 📄 License

ISC License

## 🔗 Links

- [Privacy Cash Website](https://privacycash.org)
- [Privacy Cash SDK](https://github.com/Privacy-Cash/privacy-cash-sdk)
- [Solana Documentation](https://docs.solana.com)
