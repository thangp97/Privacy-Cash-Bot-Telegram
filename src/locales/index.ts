export type Language = 'vi' | 'en' | 'zh';

export interface LocaleStrings {
    // Language info
    languageName: string;
    languageFlag: string;

    // Common
    cancel: string;
    confirm: string;
    back_to_menu: string;
    loading: string;
    error: string;
    success: string;
    cancelled: string;

    // Errors
    error_no_wallet: string;
    error_invalid_amount: string;
    error_invalid_token: string;
    error_invalid_address: string;
    error_session_expired: string;
    error_unknown: string;

    // Main menu
    menu_title: string;
    menu_balance: string;
    menu_private_balance: string;
    menu_deposit: string;
    menu_withdraw: string;
    menu_wallet_info: string;
    menu_tokens: string;
    menu_monitor_on: string;
    menu_monitor_off: string;
    menu_disconnect: string;
    menu_connect: string;
    menu_help: string;
    menu_language: string;
    menu_export_key: string;

    // Welcome
    welcome_title: string;
    welcome_features: string;
    welcome_feature_deposit: string;
    welcome_feature_withdraw: string;
    welcome_feature_balance: string;
    welcome_feature_monitor: string;
    welcome_feature_tokens: string;
    welcome_connected: string;
    welcome_not_connected: string;
    welcome_security_note: string;

    // Connect wallet
    connect_title: string;
    connect_instruction: string;
    connect_security_note: string;
    connect_security_1: string;
    connect_security_2: string;
    connect_security_3: string;
    connect_processing: string;
    connect_success: string;
    connect_success_address: string;
    connect_success_monitoring: string;
    connect_failed: string;
    connect_delete_message: string;
    connect_retry: string;

    // Disconnect
    disconnect_confirm_title: string;
    disconnect_confirm_message: string;
    disconnect_success: string;
    disconnect_success_message: string;

    // Balance
    balance_title: string;
    balance_loading: string;
    balance_public: string;
    balance_private: string;
    balance_failed: string;
    private_balance_title: string;

    // Wallet info
    wallet_title: string;
    wallet_address: string;
    wallet_connected_date: string;
    wallet_monitoring: string;
    wallet_monitoring_on: string;
    wallet_monitoring_off: string;

    // Tokens
    tokens_title: string;
    tokens_decimals: string;
    tokens_mint: string;

    // Deposit
    deposit_title: string;
    deposit_select_token: string;
    deposit_enter_amount: string;
    deposit_token_info: string;
    deposit_confirm_title: string;
    deposit_confirm_token: string;
    deposit_confirm_amount: string;
    deposit_processing: string;
    deposit_success: string;
    deposit_success_amount: string;
    deposit_success_signature: string;
    deposit_failed: string;

    // Withdraw
    withdraw_title: string;
    withdraw_select_token: string;
    withdraw_enter_amount: string;
    withdraw_select_destination: string;
    withdraw_to_self: string;
    withdraw_to_other: string;
    withdraw_enter_address: string;
    withdraw_confirm_title: string;
    withdraw_confirm_token: string;
    withdraw_confirm_amount: string;
    withdraw_confirm_to: string;
    withdraw_confirm_to_self: string;
    withdraw_confirm_fee_note: string;
    withdraw_processing: string;
    withdraw_success: string;
    withdraw_success_token: string;
    withdraw_success_amount: string;
    withdraw_success_received: string;
    withdraw_success_fee: string;
    withdraw_success_to: string;
    withdraw_success_signature: string;
    withdraw_failed: string;

    // Monitoring
    monitor_enabled_title: string;
    monitor_enabled_message: string;
    monitor_disabled_title: string;
    monitor_disabled_message: string;

    // Help
    help_title: string;
    help_wallet_management: string;
    help_balance: string;
    help_deposit: string;
    help_withdraw: string;
    help_monitoring: string;
    help_utility: string;
    help_tip: string;

    // Language
    language_title: string;
    language_select: string;
    language_changed: string;

    // Cache
    cache_clearing: string;
    cache_cleared: string;
    cache_failed: string;

    // Export private key
    export_key_warning_title: string;
    export_key_warning_1: string;
    export_key_warning_2: string;
    export_key_warning_3: string;
    export_key_confirm_question: string;
    export_key_confirm_yes: string;
    export_key_title: string;
    export_key_auto_delete: string;
    export_key_deleted: string;

    // Wallet setup
    wallet_setup_title: string;
    wallet_setup_message: string;
    wallet_create_new: string;
    wallet_import: string;
    wallet_creating: string;
    wallet_created_title: string;
    wallet_created_address: string;
    wallet_created_private_key: string;
    wallet_created_warning: string;
    wallet_created_warning_1: string;
    wallet_created_warning_2: string;
    wallet_created_warning_3: string;
    wallet_created_warning_4: string;
    wallet_import_title: string;
    wallet_import_instruction: string;
}

const vi: LocaleStrings = {
    // Language info
    languageName: 'Tiếng Việt',
    languageFlag: '🇻🇳',

    // Common
    cancel: '❌ Hủy',
    confirm: '✅ Xác nhận',
    back_to_menu: '🏠 Quay lại menu',
    loading: '🔄 Đang tải...',
    error: '❌ Lỗi',
    success: '✅ Thành công',
    cancelled: '❌ *Đã hủy thao tác*\n\nChọn một tùy chọn bên dưới:',

    // Errors
    error_no_wallet: '❌ Vui lòng kết nối ví trước.',
    error_invalid_amount: '❌ Số lượng không hợp lệ. Vui lòng nhập số dương.',
    error_invalid_token: '❌ Token không được hỗ trợ. Sử dụng /tokens để xem danh sách.',
    error_invalid_address: '❌ Địa chỉ ví không hợp lệ. Vui lòng nhập địa chỉ Solana hợp lệ.',
    error_session_expired: '❌ Phiên đã hết hạn. Vui lòng thử lại.',
    error_unknown: 'Không xác định',

    // Main menu
    menu_title: '🏠 *Menu chính*\n\nChọn một tùy chọn bên dưới:',
    menu_balance: '💰 Số dư',
    menu_private_balance: '🔒 Số dư riêng tư',
    menu_deposit: '📥 Nạp tiền',
    menu_withdraw: '📤 Rút tiền',
    menu_wallet_info: '💳 Thông tin ví',
    menu_tokens: '🪙 Danh sách token',
    menu_monitor_on: '🔔 Bật theo dõi',
    menu_monitor_off: '🔕 Tắt theo dõi',
    menu_disconnect: '🔌 Ngắt kết nối ví',
    menu_connect: '🔗 Kết nối ví',
    menu_help: '❓ Hướng dẫn',
    menu_language: '🌐 Ngôn ngữ',
    menu_export_key: '🔑 Xuất Private Key',

    // Welcome
    welcome_title: '🔒 *Chào mừng đến với Privacy Cash Bot!*',
    welcome_features: '*✨ Tính năng:*',
    welcome_feature_deposit: '💰 Nạp SOL/token vào Privacy Cash',
    welcome_feature_withdraw: '💸 Rút SOL/token một cách riêng tư',
    welcome_feature_balance: '📊 Kiểm tra số dư công khai & riêng tư',
    welcome_feature_monitor: '🔔 Theo dõi biến động số dư',
    welcome_feature_tokens: '🪙 Hỗ trợ nhiều token: SOL, USDC, USDT, ZEC, ORE, STORE',
    welcome_connected: '✅ *Ví đã kết nối:*',
    welcome_not_connected: '⚠️ *Bạn chưa kết nối ví*\nBấm nút bên dưới để bắt đầu.',
    welcome_security_note: '🔐 *Lưu ý bảo mật:* Không bao giờ chia sẻ private key với bất kỳ ai.',

    // Connect wallet
    connect_title: '🔗 *Kết nối ví*',
    connect_instruction: '📝 Vui lòng gửi *Private Key* của bạn.',
    connect_security_note: '⚠️ *Lưu ý bảo mật:*',
    connect_security_1: '• Private key sẽ được lưu trữ an toàn',
    connect_security_2: '• Xóa tin nhắn chứa key ngay sau khi gửi',
    connect_security_3: '• Không bao giờ chia sẻ key với ai',
    connect_processing: '🔄 Đang kết nối ví...',
    connect_success: '✅ *Kết nối ví thành công!*',
    connect_success_address: '📍 Địa chỉ:',
    connect_success_monitoring: '🔔 Theo dõi số dư đã được bật.',
    connect_failed: '❌ *Kết nối thất bại*',
    connect_delete_message: '⚠️ Vui lòng xóa tin nhắn chứa private key để bảo mật!',
    connect_retry: '🔄 Thử lại',

    // Disconnect
    disconnect_confirm_title: '⚠️ *Xác nhận ngắt kết nối*',
    disconnect_confirm_message: 'Bạn có chắc chắn muốn ngắt kết nối ví?\nDữ liệu ví sẽ bị xóa khỏi hệ thống.',
    disconnect_success: '✅ *Đã ngắt kết nối ví*',
    disconnect_success_message: 'Dữ liệu của bạn đã được xóa.',

    // Balance
    balance_title: '💰 *Số dư của bạn*',
    balance_loading: '🔄 Đang tải số dư...',
    balance_public: '📤 Công khai:',
    balance_private: '🔒 Riêng tư:',
    balance_failed: '❌ Không thể tải số dư.',
    private_balance_title: '🔒 *Số dư riêng tư (Privacy Cash)*',

    // Wallet info
    wallet_title: '💳 *Thông tin ví*',
    wallet_address: '📍 *Địa chỉ:*',
    wallet_connected_date: '📅 Kết nối:',
    wallet_monitoring: '🔔 Theo dõi:',
    wallet_monitoring_on: 'Bật ✅',
    wallet_monitoring_off: 'Tắt ❌',

    // Tokens
    tokens_title: '🪙 *Token được hỗ trợ*',
    tokens_decimals: 'Decimals:',
    tokens_mint: 'Mint:',

    // Deposit
    deposit_title: '📥 *Nạp tiền vào Privacy Cash*',
    deposit_select_token: 'Chọn token bạn muốn nạp:',
    deposit_enter_amount: '💬 Nhập số lượng {token} bạn muốn nạp:',
    deposit_token_info: 'Token: {name}\nDecimals: {decimals}',
    deposit_confirm_title: '📥 *Xác nhận nạp tiền*',
    deposit_confirm_token: 'Token: *{token}*',
    deposit_confirm_amount: 'Số lượng: *{amount}*',
    deposit_processing: '🔄 Đang nạp {amount} {token}...',
    deposit_success: '✅ *Nạp tiền thành công!*',
    deposit_success_amount: '💰 Số lượng: `{amount}` {token}',
    deposit_success_signature: '🔗 Signature: `{signature}`',
    deposit_failed: '❌ *Nạp tiền thất bại*',

    // Withdraw
    withdraw_title: '📤 *Rút tiền từ Privacy Cash*',
    withdraw_select_token: 'Chọn token bạn muốn rút:',
    withdraw_enter_amount: '💬 Nhập số lượng {token} bạn muốn rút:',
    withdraw_select_destination: 'Chọn địa chỉ nhận:',
    withdraw_to_self: '🏠 Rút về ví mình',
    withdraw_to_other: '📍 Rút đến địa chỉ khác',
    withdraw_enter_address: '💬 Nhập địa chỉ ví nhận (Solana address):',
    withdraw_confirm_title: '📤 *Xác nhận rút tiền*',
    withdraw_confirm_token: 'Token: *{token}*',
    withdraw_confirm_amount: 'Số lượng: *{amount}*',
    withdraw_confirm_to: 'Đến: `{address}`',
    withdraw_confirm_to_self: '(ví của bạn)',
    withdraw_confirm_fee_note: '⚠️ Phí sẽ được trừ từ số tiền rút.',
    withdraw_processing: '🔄 Đang rút {amount} {token}...',
    withdraw_success: '✅ *Rút tiền thành công!*',
    withdraw_success_token: '💰 Token: {token}',
    withdraw_success_amount: '📤 Số lượng: {amount}',
    withdraw_success_received: '💵 Thực nhận: {amount} SOL',
    withdraw_success_fee: '💸 Phí: {fee} SOL',
    withdraw_success_to: '📍 Đến: `{address}`',
    withdraw_success_signature: '🔗 Signature: `{signature}`',
    withdraw_failed: '❌ *Rút tiền thất bại*',

    // Monitoring
    monitor_enabled_title: '✅ *Đã bật theo dõi số dư*',
    monitor_enabled_message: '🔔 Bạn sẽ nhận thông báo khi số dư thay đổi.',
    monitor_disabled_title: '✅ *Đã tắt theo dõi số dư*',
    monitor_disabled_message: '🔕 Bạn sẽ không nhận thông báo khi số dư thay đổi.',

    // Help
    help_title: '📚 *Hướng dẫn sử dụng Privacy Cash Bot*',
    help_wallet_management: '*🔗 Quản lý ví*',
    help_balance: '*💰 Số dư*',
    help_deposit: '*📥 Nạp tiền*',
    help_withdraw: '*📤 Rút tiền*',
    help_monitoring: '*🔔 Theo dõi*',
    help_utility: '*⚙️ Tiện ích*',
    help_tip: '💡 *Mẹo:* Sử dụng /menu hoặc /start để mở giao diện nút bấm dễ sử dụng hơn!',

    // Language
    language_title: '🌐 *Chọn ngôn ngữ*',
    language_select: 'Chọn ngôn ngữ bạn muốn sử dụng:',
    language_changed: '✅ Đã đổi ngôn ngữ sang *Tiếng Việt*',

    // Cache
    cache_clearing: '🔄 Đang xóa cache...',
    cache_cleared: '✅ Đã xóa cache thành công!',
    cache_failed: '❌ Lỗi xóa cache:',

    // Export private key
    export_key_warning_title: '⚠️ *Cảnh báo bảo mật*',
    export_key_warning_1: '• Private key cho phép truy cập toàn bộ tài sản trong ví',
    export_key_warning_2: '• KHÔNG BAO GIỜ chia sẻ private key với bất kỳ ai',
    export_key_warning_3: '• Đảm bảo không ai nhìn thấy màn hình của bạn',
    export_key_confirm_question: 'Bạn có chắc chắn muốn hiển thị private key?',
    export_key_confirm_yes: '✅ Có, hiển thị Private Key',
    export_key_title: '🔑 *Private Key của bạn*',
    export_key_auto_delete: '⏰ *Tin nhắn này sẽ tự động ẩn sau 60 giây*',
    export_key_deleted: '🔒 *Private key đã được ẩn vì lý do bảo mật*',

    // Wallet setup
    wallet_setup_title: '👋 *Chào mừng bạn!*',
    wallet_setup_message: 'Bạn chưa có ví. Chọn một trong các tùy chọn bên dưới để bắt đầu:',
    wallet_create_new: '🆕 Tạo ví mới',
    wallet_import: '📥 Nhập ví có sẵn',
    wallet_creating: '🔄 Đang tạo ví mới...',
    wallet_created_title: '✅ *Đã tạo ví mới thành công!*',
    wallet_created_address: '📍 *Địa chỉ ví:*',
    wallet_created_private_key: '🔑 *Private Key:*',
    wallet_created_warning: '⚠️ *QUAN TRỌNG:*',
    wallet_created_warning_1: '• Lưu private key ở nơi an toàn',
    wallet_created_warning_2: '• KHÔNG chia sẻ private key với bất kỳ ai',
    wallet_created_warning_3: '• Bạn sẽ cần private key để khôi phục ví',
    wallet_created_warning_4: '• Tin nhắn này sẽ tự động xóa sau 60 giây',
    wallet_import_title: '📥 *Nhập ví có sẵn*',
    wallet_import_instruction: 'Gửi private key của ví bạn muốn nhập.',
};

const en: LocaleStrings = {
    // Language info
    languageName: 'English',
    languageFlag: '🇺🇸',

    // Common
    cancel: '❌ Cancel',
    confirm: '✅ Confirm',
    back_to_menu: '🏠 Back to menu',
    loading: '🔄 Loading...',
    error: '❌ Error',
    success: '✅ Success',
    cancelled: '❌ *Cancelled*\n\nSelect an option below:',

    // Errors
    error_no_wallet: '❌ Please connect your wallet first.',
    error_invalid_amount: '❌ Invalid amount. Please enter a positive number.',
    error_invalid_token: '❌ Unsupported token. Use /tokens to see the list.',
    error_invalid_address: '❌ Invalid wallet address. Please enter a valid Solana address.',
    error_session_expired: '❌ Session expired. Please try again.',
    error_unknown: 'Unknown',

    // Main menu
    menu_title: '🏠 *Main Menu*\n\nSelect an option below:',
    menu_balance: '💰 Balance',
    menu_private_balance: '🔒 Private Balance',
    menu_deposit: '📥 Deposit',
    menu_withdraw: '📤 Withdraw',
    menu_wallet_info: '💳 Wallet Info',
    menu_tokens: '🪙 Token List',
    menu_monitor_on: '🔔 Enable Alerts',
    menu_monitor_off: '🔕 Disable Alerts',
    menu_disconnect: '🔌 Disconnect Wallet',
    menu_connect: '🔗 Connect Wallet',
    menu_help: '❓ Help',
    menu_language: '🌐 Language',
    menu_export_key: '🔑 Export Private Key',

    // Welcome
    welcome_title: '🔒 *Welcome to Privacy Cash Bot!*',
    welcome_features: '*✨ Features:*',
    welcome_feature_deposit: '💰 Deposit SOL/tokens to Privacy Cash',
    welcome_feature_withdraw: '💸 Withdraw SOL/tokens privately',
    welcome_feature_balance: '📊 Check public & private balances',
    welcome_feature_monitor: '🔔 Monitor balance changes',
    welcome_feature_tokens: '🪙 Support multiple tokens: SOL, USDC, USDT, ZEC, ORE, STORE',
    welcome_connected: '✅ *Wallet connected:*',
    welcome_not_connected: '⚠️ *Wallet not connected*\nPress the button below to get started.',
    welcome_security_note: '🔐 *Security Note:* Never share your private key with anyone.',

    // Connect wallet
    connect_title: '🔗 *Connect Wallet*',
    connect_instruction: '📝 Please send your *Private Key*.',
    connect_security_note: '⚠️ *Security Notes:*',
    connect_security_1: '• Your private key will be stored securely',
    connect_security_2: '• Delete the message containing the key immediately after sending',
    connect_security_3: '• Never share your key with anyone',
    connect_processing: '🔄 Connecting wallet...',
    connect_success: '✅ *Wallet Connected Successfully!*',
    connect_success_address: '📍 Address:',
    connect_success_monitoring: '🔔 Balance monitoring is enabled.',
    connect_failed: '❌ *Connection Failed*',
    connect_delete_message: '⚠️ Please delete the message containing your private key for security!',
    connect_retry: '🔄 Retry',

    // Disconnect
    disconnect_confirm_title: '⚠️ *Confirm Disconnect*',
    disconnect_confirm_message: 'Are you sure you want to disconnect your wallet?\nYour wallet data will be removed from the system.',
    disconnect_success: '✅ *Wallet Disconnected*',
    disconnect_success_message: 'Your data has been removed.',

    // Balance
    balance_title: '💰 *Your Balances*',
    balance_loading: '🔄 Loading balances...',
    balance_public: '📤 Public:',
    balance_private: '🔒 Private:',
    balance_failed: '❌ Failed to load balances.',
    private_balance_title: '🔒 *Private Balances (Privacy Cash)*',

    // Wallet info
    wallet_title: '💳 *Wallet Info*',
    wallet_address: '📍 *Address:*',
    wallet_connected_date: '📅 Connected:',
    wallet_monitoring: '🔔 Monitoring:',
    wallet_monitoring_on: 'On ✅',
    wallet_monitoring_off: 'Off ❌',

    // Tokens
    tokens_title: '🪙 *Supported Tokens*',
    tokens_decimals: 'Decimals:',
    tokens_mint: 'Mint:',

    // Deposit
    deposit_title: '📥 *Deposit to Privacy Cash*',
    deposit_select_token: 'Select a token to deposit:',
    deposit_enter_amount: '💬 Enter the amount of {token} to deposit:',
    deposit_token_info: 'Token: {name}\nDecimals: {decimals}',
    deposit_confirm_title: '📥 *Confirm Deposit*',
    deposit_confirm_token: 'Token: *{token}*',
    deposit_confirm_amount: 'Amount: *{amount}*',
    deposit_processing: '🔄 Depositing {amount} {token}...',
    deposit_success: '✅ *Deposit Successful!*',
    deposit_success_amount: '💰 Amount: `{amount}` {token}',
    deposit_success_signature: '🔗 Signature: `{signature}`',
    deposit_failed: '❌ *Deposit Failed*',

    // Withdraw
    withdraw_title: '📤 *Withdraw from Privacy Cash*',
    withdraw_select_token: 'Select a token to withdraw:',
    withdraw_enter_amount: '💬 Enter the amount of {token} to withdraw:',
    withdraw_select_destination: 'Select destination:',
    withdraw_to_self: '🏠 Withdraw to my wallet',
    withdraw_to_other: '📍 Withdraw to another address',
    withdraw_enter_address: '💬 Enter the recipient wallet address (Solana address):',
    withdraw_confirm_title: '📤 *Confirm Withdrawal*',
    withdraw_confirm_token: 'Token: *{token}*',
    withdraw_confirm_amount: 'Amount: *{amount}*',
    withdraw_confirm_to: 'To: `{address}`',
    withdraw_confirm_to_self: '(your wallet)',
    withdraw_confirm_fee_note: '⚠️ Fees will be deducted from the withdrawal amount.',
    withdraw_processing: '🔄 Withdrawing {amount} {token}...',
    withdraw_success: '✅ *Withdrawal Successful!*',
    withdraw_success_token: '💰 Token: {token}',
    withdraw_success_amount: '📤 Amount: {amount}',
    withdraw_success_received: '💵 Received: {amount} SOL',
    withdraw_success_fee: '💸 Fee: {fee} SOL',
    withdraw_success_to: '📍 To: `{address}`',
    withdraw_success_signature: '🔗 Signature: `{signature}`',
    withdraw_failed: '❌ *Withdrawal Failed*',

    // Monitoring
    monitor_enabled_title: '✅ *Balance Monitoring Enabled*',
    monitor_enabled_message: '🔔 You will receive notifications when your balance changes.',
    monitor_disabled_title: '✅ *Balance Monitoring Disabled*',
    monitor_disabled_message: '🔕 You will no longer receive notifications when your balance changes.',

    // Help
    help_title: '📚 *Privacy Cash Bot Guide*',
    help_wallet_management: '*🔗 Wallet Management*',
    help_balance: '*💰 Balance*',
    help_deposit: '*📥 Deposit*',
    help_withdraw: '*📤 Withdraw*',
    help_monitoring: '*🔔 Monitoring*',
    help_utility: '*⚙️ Utility*',
    help_tip: '💡 *Tip:* Use /menu or /start to open the button interface for easier navigation!',

    // Language
    language_title: '🌐 *Select Language*',
    language_select: 'Choose your preferred language:',
    language_changed: '✅ Language changed to *English*',

    // Cache
    cache_clearing: '🔄 Clearing cache...',
    cache_cleared: '✅ Cache cleared successfully!',
    cache_failed: '❌ Failed to clear cache:',

    // Export private key
    export_key_warning_title: '⚠️ *Security Warning*',
    export_key_warning_1: '• Your private key grants full access to all assets in your wallet',
    export_key_warning_2: '• NEVER share your private key with anyone',
    export_key_warning_3: '• Make sure no one can see your screen',
    export_key_confirm_question: 'Are you sure you want to display your private key?',
    export_key_confirm_yes: '✅ Yes, Show Private Key',
    export_key_title: '🔑 *Your Private Key*',
    export_key_auto_delete: '⏰ *This message will be automatically hidden after 60 seconds*',
    export_key_deleted: '🔒 *Private key has been hidden for security reasons*',

    // Wallet setup
    wallet_setup_title: '👋 *Welcome!*',
    wallet_setup_message: 'You don\'t have a wallet yet. Choose one of the options below to get started:',
    wallet_create_new: '🆕 Create New Wallet',
    wallet_import: '📥 Import Existing Wallet',
    wallet_creating: '🔄 Creating new wallet...',
    wallet_created_title: '✅ *New Wallet Created Successfully!*',
    wallet_created_address: '📍 *Wallet Address:*',
    wallet_created_private_key: '🔑 *Private Key:*',
    wallet_created_warning: '⚠️ *IMPORTANT:*',
    wallet_created_warning_1: '• Save your private key in a safe place',
    wallet_created_warning_2: '• NEVER share your private key with anyone',
    wallet_created_warning_3: '• You will need your private key to recover your wallet',
    wallet_created_warning_4: '• This message will be automatically deleted after 60 seconds',
    wallet_import_title: '📥 *Import Existing Wallet*',
    wallet_import_instruction: 'Send the private key of the wallet you want to import.',
};

const zh: LocaleStrings = {
    // Language info
    languageName: '中文',
    languageFlag: '🇨🇳',

    // Common
    cancel: '❌ 取消',
    confirm: '✅ 确认',
    back_to_menu: '🏠 返回菜单',
    loading: '🔄 加载中...',
    error: '❌ 错误',
    success: '✅ 成功',
    cancelled: '❌ *已取消操作*\n\n请选择以下选项:',

    // Errors
    error_no_wallet: '❌ 请先连接钱包。',
    error_invalid_amount: '❌ 金额无效。请输入正数。',
    error_invalid_token: '❌ 不支持的代币。使用 /tokens 查看列表。',
    error_invalid_address: '❌ 钱包地址无效。请输入有效的 Solana 地址。',
    error_session_expired: '❌ 会话已过期。请重试。',
    error_unknown: '未知',

    // Main menu
    menu_title: '🏠 *主菜单*\n\n请选择以下选项:',
    menu_balance: '💰 余额',
    menu_private_balance: '🔒 私密余额',
    menu_deposit: '📥 存款',
    menu_withdraw: '📤 取款',
    menu_wallet_info: '💳 钱包信息',
    menu_tokens: '🪙 代币列表',
    menu_monitor_on: '🔔 开启提醒',
    menu_monitor_off: '🔕 关闭提醒',
    menu_disconnect: '🔌 断开钱包',
    menu_connect: '🔗 连接钱包',
    menu_help: '❓ 帮助',
    menu_language: '🌐 语言',
    menu_export_key: '🔑 导出私钥',

    // Welcome
    welcome_title: '🔒 *欢迎使用 Privacy Cash Bot！*',
    welcome_features: '*✨ 功能:*',
    welcome_feature_deposit: '💰 将 SOL/代币存入 Privacy Cash',
    welcome_feature_withdraw: '💸 私密提取 SOL/代币',
    welcome_feature_balance: '📊 查看公开和私密余额',
    welcome_feature_monitor: '🔔 监控余额变化',
    welcome_feature_tokens: '🪙 支持多种代币: SOL, USDC, USDT, ZEC, ORE, STORE',
    welcome_connected: '✅ *钱包已连接:*',
    welcome_not_connected: '⚠️ *钱包未连接*\n点击下方按钮开始使用。',
    welcome_security_note: '🔐 *安全提示:* 永远不要与任何人分享您的私钥。',

    // Connect wallet
    connect_title: '🔗 *连接钱包*',
    connect_instruction: '📝 请发送您的 *私钥*。',
    connect_security_note: '⚠️ *安全提示:*',
    connect_security_1: '• 您的私钥将被安全存储',
    connect_security_2: '• 发送后立即删除包含私钥的消息',
    connect_security_3: '• 永远不要与任何人分享私钥',
    connect_processing: '🔄 正在连接钱包...',
    connect_success: '✅ *钱包连接成功！*',
    connect_success_address: '📍 地址:',
    connect_success_monitoring: '🔔 余额监控已启用。',
    connect_failed: '❌ *连接失败*',
    connect_delete_message: '⚠️ 请删除包含私钥的消息以确保安全！',
    connect_retry: '🔄 重试',

    // Disconnect
    disconnect_confirm_title: '⚠️ *确认断开连接*',
    disconnect_confirm_message: '您确定要断开钱包连接吗？\n您的钱包数据将从系统中删除。',
    disconnect_success: '✅ *钱包已断开*',
    disconnect_success_message: '您的数据已被删除。',

    // Balance
    balance_title: '💰 *您的余额*',
    balance_loading: '🔄 正在加载余额...',
    balance_public: '📤 公开:',
    balance_private: '🔒 私密:',
    balance_failed: '❌ 无法加载余额。',
    private_balance_title: '🔒 *私密余额 (Privacy Cash)*',

    // Wallet info
    wallet_title: '💳 *钱包信息*',
    wallet_address: '📍 *地址:*',
    wallet_connected_date: '📅 连接时间:',
    wallet_monitoring: '🔔 监控:',
    wallet_monitoring_on: '开启 ✅',
    wallet_monitoring_off: '关闭 ❌',

    // Tokens
    tokens_title: '🪙 *支持的代币*',
    tokens_decimals: '小数位:',
    tokens_mint: 'Mint:',

    // Deposit
    deposit_title: '📥 *存款到 Privacy Cash*',
    deposit_select_token: '选择要存入的代币:',
    deposit_enter_amount: '💬 请输入要存入的 {token} 数量:',
    deposit_token_info: '代币: {name}\n小数位: {decimals}',
    deposit_confirm_title: '📥 *确认存款*',
    deposit_confirm_token: '代币: *{token}*',
    deposit_confirm_amount: '数量: *{amount}*',
    deposit_processing: '🔄 正在存入 {amount} {token}...',
    deposit_success: '✅ *存款成功！*',
    deposit_success_amount: '💰 数量: `{amount}` {token}',
    deposit_success_signature: '🔗 签名: `{signature}`',
    deposit_failed: '❌ *存款失败*',

    // Withdraw
    withdraw_title: '📤 *从 Privacy Cash 取款*',
    withdraw_select_token: '选择要提取的代币:',
    withdraw_enter_amount: '💬 请输入要提取的 {token} 数量:',
    withdraw_select_destination: '选择接收地址:',
    withdraw_to_self: '🏠 提取到我的钱包',
    withdraw_to_other: '📍 提取到其他地址',
    withdraw_enter_address: '💬 请输入接收钱包地址 (Solana 地址):',
    withdraw_confirm_title: '📤 *确认取款*',
    withdraw_confirm_token: '代币: *{token}*',
    withdraw_confirm_amount: '数量: *{amount}*',
    withdraw_confirm_to: '发送至: `{address}`',
    withdraw_confirm_to_self: '(您的钱包)',
    withdraw_confirm_fee_note: '⚠️ 手续费将从提款金额中扣除。',
    withdraw_processing: '🔄 正在提取 {amount} {token}...',
    withdraw_success: '✅ *取款成功！*',
    withdraw_success_token: '💰 代币: {token}',
    withdraw_success_amount: '📤 数量: {amount}',
    withdraw_success_received: '💵 实际收到: {amount} SOL',
    withdraw_success_fee: '💸 手续费: {fee} SOL',
    withdraw_success_to: '📍 发送至: `{address}`',
    withdraw_success_signature: '🔗 签名: `{signature}`',
    withdraw_failed: '❌ *取款失败*',

    // Monitoring
    monitor_enabled_title: '✅ *余额监控已启用*',
    monitor_enabled_message: '🔔 当您的余额发生变化时，您将收到通知。',
    monitor_disabled_title: '✅ *余额监控已关闭*',
    monitor_disabled_message: '🔕 当您的余额发生变化时，您将不再收到通知。',

    // Help
    help_title: '📚 *Privacy Cash Bot 使用指南*',
    help_wallet_management: '*🔗 钱包管理*',
    help_balance: '*💰 余额*',
    help_deposit: '*📥 存款*',
    help_withdraw: '*📤 取款*',
    help_monitoring: '*🔔 监控*',
    help_utility: '*⚙️ 工具*',
    help_tip: '💡 *提示:* 使用 /menu 或 /start 打开按钮界面，操作更便捷！',

    // Language
    language_title: '🌐 *选择语言*',
    language_select: '选择您想使用的语言:',
    language_changed: '✅ 语言已切换为 *中文*',

    // Cache
    cache_clearing: '🔄 正在清除缓存...',
    cache_cleared: '✅ 缓存已成功清除！',
    cache_failed: '❌ 清除缓存失败:',

    // Export private key
    export_key_warning_title: '⚠️ *安全警告*',
    export_key_warning_1: '• 您的私钥可以完全访问钱包中的所有资产',
    export_key_warning_2: '• 永远不要与任何人分享您的私钥',
    export_key_warning_3: '• 确保没有人能看到您的屏幕',
    export_key_confirm_question: '您确定要显示私钥吗？',
    export_key_confirm_yes: '✅ 是的，显示私钥',
    export_key_title: '🔑 *您的私钥*',
    export_key_auto_delete: '⏰ *此消息将在60秒后自动隐藏*',
    export_key_deleted: '🔒 *为了安全起见，私钥已被隐藏*',

    // Wallet setup
    wallet_setup_title: '👋 *欢迎!*',
    wallet_setup_message: '您还没有钱包。选择以下选项之一开始使用:',
    wallet_create_new: '🆕 创建新钱包',
    wallet_import: '📥 导入现有钱包',
    wallet_creating: '🔄 正在创建新钱包...',
    wallet_created_title: '✅ *新钱包创建成功！*',
    wallet_created_address: '📍 *钱包地址:*',
    wallet_created_private_key: '🔑 *私钥:*',
    wallet_created_warning: '⚠️ *重要提示:*',
    wallet_created_warning_1: '• 将私钥保存在安全的地方',
    wallet_created_warning_2: '• 切勿与任何人分享您的私钥',
    wallet_created_warning_3: '• 您需要私钥来恢复钱包',
    wallet_created_warning_4: '• 此消息将在60秒后自动删除',
    wallet_import_title: '📥 *导入现有钱包*',
    wallet_import_instruction: '发送您要导入的钱包的私钥。',
};

export const locales: Record<Language, LocaleStrings> = {
    vi,
    en,
    zh,
};

export const defaultLanguage: Language = 'en';

export function t(lang: Language, key: keyof LocaleStrings, params?: Record<string, string | number>): string {
    let text = locales[lang][key] || locales[defaultLanguage][key] || key;
    
    if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        }
    }
    
    return text;
}

export function getLanguageKeyboard() {
    return [
        [{ text: '🇻🇳 Tiếng Việt', callback_data: 'lang_vi' }],
        [{ text: '🇺🇸 English', callback_data: 'lang_en' }],
        [{ text: '🇨🇳 中文', callback_data: 'lang_zh' }],
    ];
}
