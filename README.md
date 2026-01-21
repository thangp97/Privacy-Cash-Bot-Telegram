# Privacy Cash Telegram Bot

Bot Telegram để tương tác với Privacy Cash SDK trên Solana blockchain - cho phép giao dịch riêng tư.

## 🌟 Tính năng

- 💰 **Nạp tiền (Deposit)**: Nạp SOL và các token SPL vào Privacy Cash
- 💸 **Rút tiền (Withdraw)**: Rút SOL và token từ Privacy Cash một cách riêng tư
- 📊 **Kiểm tra số dư**: Xem số dư công khai và riêng tư
- 🔔 **Theo dõi biến động**: Nhận thông báo khi số dư thay đổi
- 🪙 **Hỗ trợ nhiều token**: SOL, USDC, USDT, ZEC, ORE, STORE

## 📋 Yêu cầu

- Node.js phiên bản 24 trở lên
- Telegram Bot Token (lấy từ [@BotFather](https://t.me/BotFather))
- Solana RPC URL (có thể dùng public RPC hoặc dịch vụ như Helius, QuickNode)

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd privacy-cash-telegram-bot
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Telegram Bot Token (bắt buộc)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Solana RPC URL (khuyến nghị dùng private RPC để tốc độ tốt hơn)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Khoảng thời gian kiểm tra số dư (phút)
BALANCE_CHECK_INTERVAL=5

# Chế độ debug
DEBUG_MODE=false
```

### 3. Build và chạy

```bash
# Build TypeScript
npm run build

# Chạy bot
npm start

# Hoặc chạy ở chế độ development
npm run dev
```

## 📱 Hướng dẫn sử dụng

### Kết nối ví

1. Mở chat với bot trên Telegram
2. Gửi lệnh `/connect <private_key>` với private key của bạn
3. Bot sẽ xác nhận kết nối thành công

⚠️ **Lưu ý bảo mật**: 
- Xóa tin nhắn chứa private key ngay sau khi gửi
- Private key được lưu trữ cục bộ và mã hóa
- Không bao giờ chia sẻ private key với bất kỳ ai

### Các lệnh chính

#### Quản lý ví
| Lệnh | Mô tả |
|------|-------|
| `/start` | Bắt đầu và xem hướng dẫn |
| `/help` | Danh sách tất cả các lệnh |
| `/connect <key>` | Kết nối ví với private key |
| `/disconnect` | Ngắt kết nối ví |
| `/wallet` | Xem thông tin ví |

#### Số dư
| Lệnh | Mô tả |
|------|-------|
| `/balance` | Xem tất cả số dư (công khai + riêng tư) |
| `/privatebalance` | Chỉ xem số dư trong Privacy Cash |

#### Nạp tiền
| Lệnh | Mô tả |
|------|-------|
| `/deposit <amount>` | Nạp SOL |
| `/deposit <amount> <token>` | Nạp token (USDC, USDT, ...) |
| `/depositsol <amount>` | Nạp SOL |
| `/deposittoken <token> <amount>` | Nạp token SPL |

#### Rút tiền
| Lệnh | Mô tả |
|------|-------|
| `/withdraw <amount>` | Rút SOL về ví mình |
| `/withdraw <amount> <token>` | Rút token về ví mình |
| `/withdraw <amount> <token> <address>` | Rút đến địa chỉ khác |
| `/withdrawsol <amount> [address]` | Rút SOL |
| `/withdrawtoken <token> <amount> [address]` | Rút token SPL |

#### Theo dõi số dư
| Lệnh | Mô tả |
|------|-------|
| `/monitor` | Bật thông báo khi số dư thay đổi |
| `/stopmonitor` | Tắt thông báo |

#### Tiện ích
| Lệnh | Mô tả |
|------|-------|
| `/tokens` | Danh sách token được hỗ trợ |
| `/clearcache` | Xóa cache cục bộ |

### Ví dụ sử dụng

```
/deposit 0.1                    # Nạp 0.1 SOL
/deposit 10 USDC                # Nạp 10 USDC
/withdraw 0.05                  # Rút 0.05 SOL về ví mình
/withdraw 5 USDC                # Rút 5 USDC về ví mình
/withdrawsol 0.1 abc...xyz      # Rút 0.1 SOL đến địa chỉ khác
/withdrawtoken USDC 10 abc...   # Rút 10 USDC đến địa chỉ khác
```

## 🔧 Token được hỗ trợ

| Token | Mint Address |
|-------|-------------|
| SOL | So11111111111111111111111111111111111111112 |
| USDC | EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v |
| USDT | Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB |
| ZEC | A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS |
| ORE | oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp |
| STORE | sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH |

## 📁 Cấu trúc dự án

```
privacy-cash-telegram-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Cấu hình
│   ├── utils.ts              # Utility functions
│   ├── commands/
│   │   └── index.ts          # Command handlers
│   └── services/
│       ├── index.ts          # Services export
│       ├── walletService.ts  # Quản lý ví và giao dịch
│       └── balanceMonitor.ts # Theo dõi số dư
├── user_data/                # Dữ liệu người dùng (auto-created)
├── cache/                    # Cache (auto-created)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## ⚠️ Lưu ý quan trọng

1. **Bảo mật Private Key**: Bot lưu trữ private key cục bộ. Đảm bảo bảo vệ thư mục `user_data/`.

2. **Phí giao dịch**: Rút tiền từ Privacy Cash sẽ tính phí. Kiểm tra số dư thực nhận sau giao dịch.

3. **RPC URL**: Nên sử dụng private RPC để có tốc độ và độ ổn định tốt hơn.

4. **Node.js Version**: Yêu cầu Node.js 24+ để tương thích với Privacy Cash SDK.

## 🐛 Xử lý lỗi thường gặp

### "Insufficient balance"
- Kiểm tra số dư công khai có đủ cho giao dịch nạp
- Kiểm tra số dư riêng tư có đủ cho giao dịch rút

### "Invalid private key"
- Đảm bảo private key đúng định dạng (base58)
- Private key phải là key hợp lệ của Solana

### "Rate limit"
- Đợi một lúc và thử lại
- Cân nhắc sử dụng private RPC

## 📄 License

ISC License

## 🔗 Liên kết

- [Privacy Cash Website](https://privacycash.org)
- [Privacy Cash SDK](https://github.com/Privacy-Cash/privacy-cash-sdk)
- [Solana Documentation](https://docs.solana.com)
