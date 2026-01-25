export type Language = 'vi' | 'en' | 'zh';

export interface LocaleStrings {
    // Language info
    languageName: string;
    languageFlag: string;

    // Common
    cancel: string;
    confirm: string;
    back_to_menu: string;
    refresh_balance: string;
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
    error_insufficient_balance_shield: string;
    error_insufficient_balance_unshield: string;
    error_amount_too_small: string;

    // Main menu
    menu_title: string;
    menu_balance: string;
    menu_private_balance: string;
    menu_shield: string;
    menu_unshield: string;
    menu_private_transfer: string;
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
    welcome_feature_shield: string;
    welcome_feature_unshield: string;
    welcome_feature_private_transfer: string;
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

    // Shield (Deposit to private)
    shield_title: string;
    shield_select_token: string;
    shield_enter_amount: string;
    shield_token_info: string;
    shield_confirm_title: string;
    shield_confirm_token: string;
    shield_confirm_amount: string;
    shield_processing: string;
    shield_success: string;
    shield_success_amount: string;
    shield_success_signature: string;
    shield_success_link: string;
    shield_failed: string;

    // Unshield (Withdraw from private)
    unshield_title: string;
    unshield_select_token: string;
    unshield_enter_amount: string;
    unshield_select_destination: string;
    unshield_to_self: string;
    unshield_to_other: string;
    unshield_enter_address: string;
    unshield_confirm_title: string;
    unshield_confirm_token: string;
    unshield_confirm_amount: string;
    unshield_confirm_to: string;
    unshield_confirm_to_self: string;
    unshield_confirm_fee_note: string;
    unshield_confirm_estimated_fee: string;
    unshield_processing: string;
    unshield_success: string;
    unshield_success_token: string;
    unshield_success_amount: string;
    unshield_success_received: string;
    unshield_success_fee: string;
    unshield_success_to: string;
    unshield_success_signature: string;
    unshield_success_link: string;
    unshield_failed: string;

    // Private Transfer
    private_transfer_title: string;
    private_transfer_description: string;
    private_transfer_select_token: string;
    private_transfer_enter_amount: string;
    private_transfer_enter_address: string;
    private_transfer_confirm_title: string;
    private_transfer_confirm_token: string;
    private_transfer_confirm_amount: string;
    private_transfer_confirm_to: string;
    private_transfer_confirm_fee_breakdown: string;
    private_transfer_confirm_shield_fee: string;
    private_transfer_confirm_unshield_fee: string;
    private_transfer_confirm_total_fee: string;
    private_transfer_confirm_recipient_receives: string;
    private_transfer_processing_shield: string;
    private_transfer_processing_unshield: string;
    private_transfer_success: string;
    private_transfer_success_amount: string;
    private_transfer_success_to: string;
    private_transfer_success_fee: string;
    private_transfer_success_signature: string;
    private_transfer_success_link: string;
    private_transfer_failed: string;
    private_transfer_failed_shield: string;
    private_transfer_failed_unshield: string;

    // Multi Private Send
    menu_multi_private_send: string;
    multi_send_title: string;
    multi_send_description: string;
    multi_send_select_token: string;
    multi_send_enter_recipients: string;
    multi_send_format_example: string;
    multi_send_confirm_title: string;
    multi_send_confirm_token: string;
    multi_send_confirm_total_amount: string;
    multi_send_confirm_recipients_count: string;
    multi_send_confirm_recipients_list: string;
    multi_send_confirm_fee_note: string;
    multi_send_processing: string;
    multi_send_processing_recipient: string;
    multi_send_success: string;
    multi_send_success_summary: string;
    multi_send_partial_success: string;
    multi_send_failed: string;
    multi_send_invalid_format: string;
    multi_send_invalid_address: string;
    multi_send_invalid_amount: string;
    multi_send_no_recipients: string;

    // Monitoring
    monitor_enabled_title: string;
    monitor_enabled_message: string;
    monitor_disabled_title: string;
    monitor_disabled_message: string;

    // Help
    help_title: string;
    help_wallet_management: string;
    help_balance: string;
    help_shield: string;
    help_unshield: string;
    help_private_transfer: string;
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

    // QR Code scanning
    qr_scanning: string;
    qr_no_code_found: string;
    qr_scan_error: string;
    qr_address_detected: string;
    qr_address_label: string;
    qr_what_to_do: string;
    qr_private_transfer: string;
    qr_multi_send: string;
    qr_copy_address: string;
    qr_not_solana_address: string;
    qr_content_label: string;
}

const vi: LocaleStrings = {
    // Language info
    languageName: 'Tiếng Việt',
    languageFlag: '🇻🇳',

    // Common
    cancel: '❌ Hủy',
    confirm: '✅ Xác nhận',
    back_to_menu: '🏠 Quay lại menu',
    refresh_balance: '🔄 Làm mới',
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
    error_insufficient_balance_shield: '❌ *Không đủ số dư để shield!*\n\n💰 Số dư hiện tại: {balance} {token}\n📥 Số lượng cần shield: {amount} {token}\n\nVui lòng nạp thêm {token} vào ví của bạn.',
    error_insufficient_balance_unshield: '❌ *Không đủ số dư riêng tư để unshield!*\n\n🔒 Số dư riêng tư: {balance} {token}\n📤 Số lượng cần unshield: {amount} {token}\n\nVui lòng shield thêm vào Privacy Cash trước.',
    error_amount_too_small: '❌ *Số tiền quá nhỏ!*\n\n💸 Số tiền gửi: {amount} {token}\n💰 Tổng phí: {fee} {token}\n\nSố tiền người nhận sẽ nhận được là âm. Vui lòng nhập số tiền lớn hơn phí giao dịch.',

    // Main menu
    menu_title: '🏠 *Menu chính*\n\nChọn một tùy chọn bên dưới:',
    menu_balance: '💰 Số dư',
    menu_private_balance: '🔒 Số dư riêng tư',
    menu_shield: '🛡️ Shield',
    menu_unshield: '📤 Unshield',
    menu_private_transfer: '🔐 Chuyển riêng tư',
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
    welcome_feature_shield: '🛡️ Shield SOL/token vào ví riêng tư',
    welcome_feature_unshield: '📤 Unshield SOL/token về ví công khai',
    welcome_feature_private_transfer: '🔐 Chuyển tiền riêng tư đến bất kỳ địa chỉ nào',
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

    // Shield (Deposit to private)
    shield_title: '🛡️ *Shield Token*',
    shield_select_token: 'Chọn token bạn muốn shield (chuyển vào ví riêng tư):',
    shield_enter_amount: '💬 Nhập số lượng {token} bạn muốn shield:',
    shield_token_info: 'Token: {name}\nDecimals: {decimals}',
    shield_confirm_title: '🛡️ *Xác nhận Shield*',
    shield_confirm_token: 'Token: *{token}*',
    shield_confirm_amount: 'Số lượng: *{amount}*',
    shield_processing: '🔄 Đang shield {amount} {token}...',
    shield_success: '✅ *Shield thành công!*',
    shield_success_amount: '🛡️ Số lượng: `{amount}` {token}',
    shield_success_signature: '🔗 Signature: `{signature}`',
    shield_success_link: '🔍 [Xem giao dịch trên Explorer](https://orbmarkets.io/tx/{signature}?tab=summary)',
    shield_failed: '❌ *Shield thất bại*',

    // Unshield (Withdraw from private)
    unshield_title: '📤 *Unshield Token*',
    unshield_select_token: 'Chọn token bạn muốn unshield (rút về ví công khai):',
    unshield_enter_amount: '💬 Nhập số lượng {token} bạn muốn unshield:',
    unshield_select_destination: 'Chọn địa chỉ nhận:',
    unshield_to_self: '🏠 Unshield về ví mình',
    unshield_to_other: '📍 Unshield đến địa chỉ khác',
    unshield_enter_address: '💬 Nhập địa chỉ ví nhận (Solana address):',
    unshield_confirm_title: '📤 *Xác nhận Unshield*',
    unshield_confirm_token: 'Token: *{token}*',
    unshield_confirm_amount: 'Số lượng: *{amount}*',
    unshield_confirm_to: 'Đến: `{address}`',
    unshield_confirm_to_self: '(ví của bạn)',
    unshield_confirm_fee_note: '⚠️ Phí sẽ được trừ từ số tiền unshield.',
    unshield_confirm_estimated_fee: '💸 Phí ước tính: *~0.1% - 0.5%* của số tiền unshield',
    unshield_processing: '🔄 Đang unshield {amount} {token}...',
    unshield_success: '✅ *Unshield thành công!*',
    unshield_success_token: '💰 Token: {token}',
    unshield_success_amount: '📤 Số lượng: {amount}',
    unshield_success_received: '💵 Thực nhận: {amount} SOL',
    unshield_success_fee: '💸 Phí: {fee} SOL',
    unshield_success_to: '📍 Đến: `{address}`',
    unshield_success_signature: '🔗 Signature: `{signature}`',
    unshield_success_link: '🔍 [Xem giao dịch trên Explorer](https://orbmarkets.io/tx/{signature}?tab=summary)',
    unshield_failed: '❌ *Unshield thất bại*',

    // Private Transfer
    private_transfer_title: '🔐 *Chuyển Tiền Riêng Tư*',
    private_transfer_description: 'Chuyển tiền ẩn danh: Shield → Unshield đến địa chỉ nhận',
    private_transfer_select_token: 'Chọn token bạn muốn chuyển riêng tư:',
    private_transfer_enter_amount: '💬 Nhập số lượng {token} bạn muốn chuyển:',
    private_transfer_enter_address: '💬 Nhập địa chỉ ví nhận (Solana address):',
    private_transfer_confirm_title: '🔐 *Xác nhận Chuyển Tiền Riêng Tư*',
    private_transfer_confirm_token: 'Token: *{token}*',
    private_transfer_confirm_amount: 'Số lượng gửi: *{amount}*',
    private_transfer_confirm_to: 'Đến: `{address}`',
    private_transfer_confirm_fee_breakdown: '💸 *Chi tiết phí:*',
    private_transfer_confirm_shield_fee: '• Phí Shield: ~{fee} SOL (phí giao dịch)',
    private_transfer_confirm_unshield_fee: '• Phí Unshield: ~{fee} SOL ({percent}%)',
    private_transfer_confirm_total_fee: '• *Tổng phí ước tính:* ~{fee} SOL',
    private_transfer_confirm_recipient_receives: '💵 *Người nhận sẽ nhận:* ~{amount} {token}',
    private_transfer_processing_shield: '🔄 Bước 1/2: Đang shield {amount} {token}...',
    private_transfer_processing_unshield: '🔄 Bước 2/2: Đang unshield đến người nhận...',
    private_transfer_success: '✅ *Chuyển tiền riêng tư thành công!*',
    private_transfer_success_amount: '💰 Số lượng gửi: `{amount}` {token}',
    private_transfer_success_to: '📍 Đến: `{address}`',
    private_transfer_success_fee: '💸 Tổng phí: {fee} SOL',
    private_transfer_success_signature: '🔗 Signature: `{signature}`',
    private_transfer_success_link: '🔍 [Xem giao dịch trên Explorer](https://orbmarkets.io/tx/{signature}?tab=summary)',
    private_transfer_failed: '❌ *Chuyển tiền riêng tư thất bại*',
    private_transfer_failed_shield: '❌ *Lỗi ở bước Shield:* {error}',
    private_transfer_failed_unshield: '❌ *Lỗi ở bước Unshield:* {error}\n\n⚠️ Token đã được shield. Bạn có thể unshield thủ công.',

    // Multi Private Send
    menu_multi_private_send: '📤 Gửi nhiều ví',
    multi_send_title: '📤 *Chuyển Tiền Riêng Tư Đến Nhiều Ví*',
    multi_send_description: 'Gửi token đến nhiều địa chỉ cùng lúc một cách ẩn danh',
    multi_send_select_token: 'Chọn token bạn muốn gửi:',
    multi_send_enter_recipients: '💬 Nhập danh sách người nhận theo format sau:\n\n`Địa chỉ ví, Số lượng`\n\nMỗi dòng một người nhận.',
    multi_send_format_example: '*Ví dụ:*\n```\nAddress1, 100\nAddress2, 200\nAddress3, 300\n```',
    multi_send_confirm_title: '📤 *Xác nhận Gửi Nhiều Ví*',
    multi_send_confirm_token: 'Token: *{token}*',
    multi_send_confirm_total_amount: 'Tổng số lượng: *{amount} {token}*',
    multi_send_confirm_recipients_count: 'Số người nhận: *{count}*',
    multi_send_confirm_recipients_list: '📋 *Danh sách người nhận:*',
    multi_send_confirm_fee_note: '⚠️ Phí sẽ được tính cho mỗi giao dịch',
    multi_send_processing: '🔄 Đang xử lý {current}/{total} giao dịch...',
    multi_send_processing_recipient: '🔄 Đang gửi {amount} {token} đến `{address}`...',
    multi_send_success: '✅ *Gửi nhiều ví thành công!*',
    multi_send_success_summary: '📊 Đã gửi thành công {success}/{total} giao dịch',
    multi_send_partial_success: '⚠️ *Hoàn thành một phần*\n\nThành công: {success}/{total}',
    multi_send_failed: '❌ *Gửi nhiều ví thất bại*',
    multi_send_invalid_format: '❌ Format không hợp lệ ở dòng {line}: `{content}`',
    multi_send_invalid_address: '❌ Địa chỉ không hợp lệ ở dòng {line}: `{address}`',
    multi_send_invalid_amount: '❌ Số lượng không hợp lệ ở dòng {line}: `{amount}`',
    multi_send_no_recipients: '❌ Không tìm thấy người nhận nào. Vui lòng nhập theo format đúng.',

    // Monitoring
    monitor_enabled_title: '✅ *Đã bật theo dõi số dư*',
    monitor_enabled_message: '🔔 Bạn sẽ nhận thông báo khi số dư thay đổi.',
    monitor_disabled_title: '✅ *Đã tắt theo dõi số dư*',
    monitor_disabled_message: '🔕 Bạn sẽ không nhận thông báo khi số dư thay đổi.',

    // Help
    help_title: '📚 *Hướng dẫn sử dụng Privacy Cash Bot*',
    help_wallet_management: '*🔗 Quản lý ví*',
    help_balance: '*💰 Số dư*',
    help_shield: '*🛡️ Shield* - Chuyển token vào ví riêng tư',
    help_unshield: '*📤 Unshield* - Rút token từ ví riêng tư',
    help_private_transfer: '*🔐 Chuyển riêng tư* - Gửi token ẩn danh',
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

    // QR Code scanning
    qr_scanning: '🔍 Đang quét mã QR...',
    qr_no_code_found: '❌ Không tìm thấy mã QR trong ảnh. Vui lòng gửi ảnh rõ hơn.',
    qr_scan_error: '❌ Lỗi quét mã QR: {error}',
    qr_address_detected: '✅ *Phát hiện địa chỉ ví Solana!*',
    qr_address_label: '📍 *Địa chỉ:*',
    qr_what_to_do: 'Bạn muốn làm gì với địa chỉ này?',
    qr_private_transfer: '🔐 Chuyển tiền riêng tư',
    qr_multi_send: '📤 Thêm vào Multi Send',
    qr_copy_address: '📋 Sao chép địa chỉ',
    qr_not_solana_address: '⚠️ *Mã QR không chứa địa chỉ Solana*',
    qr_content_label: '📄 *Nội dung:*',
};

const en: LocaleStrings = {
    // Language info
    languageName: 'English',
    languageFlag: '🇺🇸',

    // Common
    cancel: '❌ Cancel',
    confirm: '✅ Confirm',
    back_to_menu: '🏠 Back to menu',
    refresh_balance: '🔄 Refresh',
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
    error_insufficient_balance_shield: '❌ *Insufficient balance to shield!*\n\n💰 Current balance: {balance} {token}\n📥 Amount to shield: {amount} {token}\n\nPlease add more {token} to your wallet.',
    error_insufficient_balance_unshield: '❌ *Insufficient private balance to unshield!*\n\n🔒 Private balance: {balance} {token}\n📤 Amount to unshield: {amount} {token}\n\nPlease shield more to Privacy Cash first.',
    error_amount_too_small: '❌ *Amount too small!*\n\n💸 Send amount: {amount} {token}\n💰 Total fee: {fee} {token}\n\nThe recipient would receive a negative amount. Please enter an amount larger than the transaction fee.',

    // Main menu
    menu_title: '🏠 *Main Menu*\n\nSelect an option below:',
    menu_balance: '💰 Balance',
    menu_private_balance: '🔒 Private Balance',
    menu_shield: '🛡️ Shield',
    menu_unshield: '📤 Unshield',
    menu_private_transfer: '🔐 Private Transfer',
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
    welcome_feature_shield: '🛡️ Shield SOL/tokens to private wallet',
    welcome_feature_unshield: '📤 Unshield SOL/tokens to public wallet',
    welcome_feature_private_transfer: '🔐 Private transfer to any address',
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

    // Shield (Deposit to private)
    shield_title: '🛡️ *Shield Token*',
    shield_select_token: 'Select a token to shield (transfer to private wallet):',
    shield_enter_amount: '💬 Enter the amount of {token} to shield:',
    shield_token_info: 'Token: {name}\nDecimals: {decimals}',
    shield_confirm_title: '🛡️ *Confirm Shield*',
    shield_confirm_token: 'Token: *{token}*',
    shield_confirm_amount: 'Amount: *{amount}*',
    shield_processing: '🔄 Shielding {amount} {token}...',
    shield_success: '✅ *Shield Successful!*',
    shield_success_amount: '🛡️ Amount: `{amount}` {token}',
    shield_success_signature: '🔗 Signature: `{signature}`',
    shield_success_link: '🔍 [View transaction on Explorer](https://orbmarkets.io/tx/{signature}?tab=summary)',
    shield_failed: '❌ *Shield Failed*',

    // Unshield (Withdraw from private)
    unshield_title: '📤 *Unshield Token*',
    unshield_select_token: 'Select a token to unshield (withdraw to public wallet):',
    unshield_enter_amount: '💬 Enter the amount of {token} to unshield:',
    unshield_select_destination: 'Select destination:',
    unshield_to_self: '🏠 Unshield to my wallet',
    unshield_to_other: '📍 Unshield to another address',
    unshield_enter_address: '💬 Enter the recipient wallet address (Solana address):',
    unshield_confirm_title: '📤 *Confirm Unshield*',
    unshield_confirm_token: 'Token: *{token}*',
    unshield_confirm_amount: 'Amount: *{amount}*',
    unshield_confirm_to: 'To: `{address}`',
    unshield_confirm_to_self: '(your wallet)',
    unshield_confirm_fee_note: '⚠️ Fees will be deducted from the unshield amount.',
    unshield_confirm_estimated_fee: '💸 Estimated fee: *~0.1% - 0.5%* of unshield amount',
    unshield_processing: '🔄 Unshielding {amount} {token}...',
    unshield_success: '✅ *Unshield Successful!*',
    unshield_success_token: '💰 Token: {token}',
    unshield_success_amount: '📤 Amount: {amount}',
    unshield_success_received: '💵 Received: {amount} SOL',
    unshield_success_fee: '💸 Fee: {fee} SOL',
    unshield_success_to: '📍 To: `{address}`',
    unshield_success_signature: '🔗 Signature: `{signature}`',
    unshield_success_link: '🔍 [View transaction on Explorer](https://orbmarkets.io/tx/{signature}?tab=summary)',
    unshield_failed: '❌ *Unshield Failed*',

    // Private Transfer
    private_transfer_title: '🔐 *Private Transfer*',
    private_transfer_description: 'Anonymous transfer: Shield → Unshield to recipient',
    private_transfer_select_token: 'Select a token to transfer privately:',
    private_transfer_enter_amount: '💬 Enter the amount of {token} to transfer:',
    private_transfer_enter_address: '💬 Enter the recipient wallet address (Solana address):',
    private_transfer_confirm_title: '🔐 *Confirm Private Transfer*',
    private_transfer_confirm_token: 'Token: *{token}*',
    private_transfer_confirm_amount: 'Amount to send: *{amount}*',
    private_transfer_confirm_to: 'To: `{address}`',
    private_transfer_confirm_fee_breakdown: '💸 *Fee breakdown:*',
    private_transfer_confirm_shield_fee: '• Shield fee: ~{fee} SOL (transaction fee)',
    private_transfer_confirm_unshield_fee: '• Unshield fee: ~{fee} SOL ({percent}%)',
    private_transfer_confirm_total_fee: '• *Total estimated fee:* ~{fee} SOL',
    private_transfer_confirm_recipient_receives: '💵 *Recipient will receive:* ~{amount} {token}',
    private_transfer_processing_shield: '🔄 Step 1/2: Shielding {amount} {token}...',
    private_transfer_processing_unshield: '🔄 Step 2/2: Unshielding to recipient...',
    private_transfer_success: '✅ *Private Transfer Successful!*',
    private_transfer_success_amount: '💰 Amount sent: `{amount}` {token}',
    private_transfer_success_to: '📍 To: `{address}`',
    private_transfer_success_fee: '💸 Total fee: {fee} SOL',
    private_transfer_success_signature: '🔗 Signature: `{signature}`',
    private_transfer_success_link: '🔍 [View transaction on Explorer](https://orbmarkets.io/tx/{signature}?tab=summary)',
    private_transfer_failed: '❌ *Private Transfer Failed*',
    private_transfer_failed_shield: '❌ *Error at Shield step:* {error}',
    private_transfer_failed_unshield: '❌ *Error at Unshield step:* {error}\n\n⚠️ Tokens have been shielded. You can unshield manually.',

    // Multi Private Send
    menu_multi_private_send: '📤 Multi Send',
    multi_send_title: '📤 *Multi Private Send*',
    multi_send_description: 'Send tokens to multiple addresses anonymously at once',
    multi_send_select_token: 'Select a token to send:',
    multi_send_enter_recipients: '💬 Enter the list of recipients in the following format:\n\n`Wallet address, Amount`\n\nOne recipient per line.',
    multi_send_format_example: '*Example:*\n```\nAddress1, 100\nAddress2, 200\nAddress3, 300\n```',
    multi_send_confirm_title: '📤 *Confirm Multi Send*',
    multi_send_confirm_token: 'Token: *{token}*',
    multi_send_confirm_total_amount: 'Total amount: *{amount} {token}*',
    multi_send_confirm_recipients_count: 'Recipients: *{count}*',
    multi_send_confirm_recipients_list: '📋 *Recipients list:*',
    multi_send_confirm_fee_note: '⚠️ Fees will be charged for each transaction',
    multi_send_processing: '🔄 Processing {current}/{total} transactions...',
    multi_send_processing_recipient: '🔄 Sending {amount} {token} to `{address}`...',
    multi_send_success: '✅ *Multi Send Successful!*',
    multi_send_success_summary: '📊 Successfully sent {success}/{total} transactions',
    multi_send_partial_success: '⚠️ *Partially completed*\n\nSuccess: {success}/{total}',
    multi_send_failed: '❌ *Multi Send Failed*',
    multi_send_invalid_format: '❌ Invalid format at line {line}: `{content}`',
    multi_send_invalid_address: '❌ Invalid address at line {line}: `{address}`',
    multi_send_invalid_amount: '❌ Invalid amount at line {line}: `{amount}`',
    multi_send_no_recipients: '❌ No recipients found. Please enter in the correct format.',

    // Monitoring
    monitor_enabled_title: '✅ *Balance Monitoring Enabled*',
    monitor_enabled_message: '🔔 You will receive notifications when your balance changes.',
    monitor_disabled_title: '✅ *Balance Monitoring Disabled*',
    monitor_disabled_message: '🔕 You will no longer receive notifications when your balance changes.',

    // Help
    help_title: '📚 *Privacy Cash Bot Guide*',
    help_wallet_management: '*🔗 Wallet Management*',
    help_balance: '*💰 Balance*',
    help_shield: '*🛡️ Shield* - Transfer tokens to private wallet',
    help_unshield: '*📤 Unshield* - Withdraw tokens from private wallet',
    help_private_transfer: '*🔐 Private Transfer* - Send tokens anonymously',
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

    // QR Code scanning
    qr_scanning: '🔍 Scanning QR code...',
    qr_no_code_found: '❌ No QR code found in the image. Please send a clearer image.',
    qr_scan_error: '❌ QR scan error: {error}',
    qr_address_detected: '✅ *Solana Wallet Address Detected!*',
    qr_address_label: '📍 *Address:*',
    qr_what_to_do: 'What would you like to do with this address?',
    qr_private_transfer: '🔐 Private Transfer',
    qr_multi_send: '📤 Add to Multi Send',
    qr_copy_address: '📋 Copy Address',
    qr_not_solana_address: '⚠️ *QR code does not contain a Solana address*',
    qr_content_label: '📄 *Content:*',
};

const zh: LocaleStrings = {
    // Language info
    languageName: '中文',
    languageFlag: '🇨🇳',

    // Common
    cancel: '❌ 取消',
    confirm: '✅ 确认',
    back_to_menu: '🏠 返回菜单',
    refresh_balance: '🔄 刷新',
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
    error_insufficient_balance_shield: '❌ *余额不足，无法shield！*\n\n💰 当前余额: {balance} {token}\n📥 Shield金额: {amount} {token}\n\n请向您的钱包添加更多 {token}。',
    error_insufficient_balance_unshield: '❌ *私密余额不足，无法unshield！*\n\n🔒 私密余额: {balance} {token}\n📤 Unshield金额: {amount} {token}\n\n请先向 Privacy Cash shield更多。',
    error_amount_too_small: '❌ *金额太小！*\n\n💸 发送金额: {amount} {token}\n💰 总费用: {fee} {token}\n\n收款人将收到负金额。请输入大于交易费的金额。',

    // Main menu
    menu_title: '🏠 *主菜单*\n\n请选择以下选项:',
    menu_balance: '💰 余额',
    menu_private_balance: '🔒 私密余额',
    menu_shield: '🛡️ Shield',
    menu_unshield: '📤 Unshield',
    menu_private_transfer: '🔐 私密转账',
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
    welcome_feature_shield: '🛡️ Shield SOL/代币到私密钱包',
    welcome_feature_unshield: '📤 Unshield SOL/代币到公开钱包',
    welcome_feature_private_transfer: '🔐 私密转账到任何地址',
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

    // Shield (Deposit to private)
    shield_title: '🛡️ *Shield 代币*',
    shield_select_token: '选择要 shield 的代币 (转入私密钱包):',
    shield_enter_amount: '💬 请输入要 shield 的 {token} 数量:',
    shield_token_info: '代币: {name}\n小数位: {decimals}',
    shield_confirm_title: '🛡️ *确认 Shield*',
    shield_confirm_token: '代币: *{token}*',
    shield_confirm_amount: '数量: *{amount}*',
    shield_processing: '🔄 正在 shield {amount} {token}...',
    shield_success: '✅ *Shield 成功！*',
    shield_success_amount: '🛡️ 数量: `{amount}` {token}',
    shield_success_signature: '🔗 签名: `{signature}`',
    shield_success_link: '🔍 [在 Explorer 上查看交易](https://orbmarkets.io/tx/{signature}?tab=summary)',
    shield_failed: '❌ *Shield 失败*',

    // Unshield (Withdraw from private)
    unshield_title: '📤 *Unshield 代币*',
    unshield_select_token: '选择要 unshield 的代币 (提取到公开钱包):',
    unshield_enter_amount: '💬 请输入要 unshield 的 {token} 数量:',
    unshield_select_destination: '选择接收地址:',
    unshield_to_self: '🏠 Unshield 到我的钱包',
    unshield_to_other: '📍 Unshield 到其他地址',
    unshield_enter_address: '💬 请输入接收钱包地址 (Solana 地址):',
    unshield_confirm_title: '📤 *确认 Unshield*',
    unshield_confirm_token: '代币: *{token}*',
    unshield_confirm_amount: '数量: *{amount}*',
    unshield_confirm_to: '发送至: `{address}`',
    unshield_confirm_to_self: '(您的钱包)',
    unshield_confirm_fee_note: '⚠️ 手续费将从 unshield 金额中扣除。',
    unshield_confirm_estimated_fee: '💸 预估手续费: unshield 金额的 *~0.1% - 0.5%*',
    unshield_processing: '🔄 正在 unshield {amount} {token}...',
    unshield_success: '✅ *Unshield 成功！*',
    unshield_success_token: '💰 代币: {token}',
    unshield_success_amount: '📤 数量: {amount}',
    unshield_success_received: '💵 实际收到: {amount} SOL',
    unshield_success_fee: '💸 手续费: {fee} SOL',
    unshield_success_to: '📍 发送至: `{address}`',
    unshield_success_signature: '🔗 签名: `{signature}`',
    unshield_success_link: '🔍 [在 Explorer 上查看交易](https://orbmarkets.io/tx/{signature}?tab=summary)',
    unshield_failed: '❌ *Unshield 失败*',

    // Private Transfer
    private_transfer_title: '🔐 *私密转账*',
    private_transfer_description: '匿名转账: Shield → Unshield 到收款人',
    private_transfer_select_token: '选择要私密转账的代币:',
    private_transfer_enter_amount: '💬 请输入要转账的 {token} 数量:',
    private_transfer_enter_address: '💬 请输入接收钱包地址 (Solana 地址):',
    private_transfer_confirm_title: '🔐 *确认私密转账*',
    private_transfer_confirm_token: '代币: *{token}*',
    private_transfer_confirm_amount: '发送数量: *{amount}*',
    private_transfer_confirm_to: '发送至: `{address}`',
    private_transfer_confirm_fee_breakdown: '💸 *费用明细:*',
    private_transfer_confirm_shield_fee: '• Shield 费用: ~{fee} SOL (交易费)',
    private_transfer_confirm_unshield_fee: '• Unshield 费用: ~{fee} SOL ({percent}%)',
    private_transfer_confirm_total_fee: '• *预估总费用:* ~{fee} SOL',
    private_transfer_confirm_recipient_receives: '💵 *收款人将收到:* ~{amount} {token}',
    private_transfer_processing_shield: '🔄 步骤 1/2: 正在 shield {amount} {token}...',
    private_transfer_processing_unshield: '🔄 步骤 2/2: 正在 unshield 到收款人...',
    private_transfer_success: '✅ *私密转账成功！*',
    private_transfer_success_amount: '💰 发送数量: `{amount}` {token}',
    private_transfer_success_to: '📍 发送至: `{address}`',
    private_transfer_success_fee: '💸 总费用: {fee} SOL',
    private_transfer_success_signature: '🔗 签名: `{signature}`',
    private_transfer_success_link: '🔍 [在 Explorer 上查看交易](https://orbmarkets.io/tx/{signature}?tab=summary)',
    private_transfer_failed: '❌ *私密转账失败*',
    private_transfer_failed_shield: '❌ *Shield 步骤出错:* {error}',
    private_transfer_failed_unshield: '❌ *Unshield 步骤出错:* {error}\n\n⚠️ 代币已被 shield。您可以手动 unshield。',

    // Multi Private Send
    menu_multi_private_send: '📤 批量发送',
    multi_send_title: '📤 *批量私密转账*',
    multi_send_description: '同时匿名发送代币到多个地址',
    multi_send_select_token: '选择要发送的代币:',
    multi_send_enter_recipients: '💬 请按以下格式输入收款人列表:\n\n`钱包地址, 数量`\n\n每行一个收款人。',
    multi_send_format_example: '*示例:*\n```\nAddress1, 100\nAddress2, 200\nAddress3, 300\n```',
    multi_send_confirm_title: '📤 *确认批量发送*',
    multi_send_confirm_token: '代币: *{token}*',
    multi_send_confirm_total_amount: '总数量: *{amount} {token}*',
    multi_send_confirm_recipients_count: '收款人数: *{count}*',
    multi_send_confirm_recipients_list: '📋 *收款人列表:*',
    multi_send_confirm_fee_note: '⚠️ 每笔交易都会收取费用',
    multi_send_processing: '🔄 正在处理 {current}/{total} 笔交易...',
    multi_send_processing_recipient: '🔄 正在发送 {amount} {token} 到 `{address}`...',
    multi_send_success: '✅ *批量发送成功！*',
    multi_send_success_summary: '📊 成功发送 {success}/{total} 笔交易',
    multi_send_partial_success: '⚠️ *部分完成*\n\n成功: {success}/{total}',
    multi_send_failed: '❌ *批量发送失败*',
    multi_send_invalid_format: '❌ 第 {line} 行格式无效: `{content}`',
    multi_send_invalid_address: '❌ 第 {line} 行地址无效: `{address}`',
    multi_send_invalid_amount: '❌ 第 {line} 行数量无效: `{amount}`',
    multi_send_no_recipients: '❌ 未找到收款人。请按正确格式输入。',

    // Monitoring
    monitor_enabled_title: '✅ *余额监控已启用*',
    monitor_enabled_message: '🔔 当您的余额发生变化时，您将收到通知。',
    monitor_disabled_title: '✅ *余额监控已关闭*',
    monitor_disabled_message: '🔕 当您的余额发生变化时，您将不再收到通知。',

    // Help
    help_title: '📚 *Privacy Cash Bot 使用指南*',
    help_wallet_management: '*🔗 钱包管理*',
    help_balance: '*💰 余额*',
    help_shield: '*🛡️ Shield* - 将代币转入私密钱包',
    help_unshield: '*📤 Unshield* - 从私密钱包提取代币',
    help_private_transfer: '*🔐 私密转账* - 匿名发送代币',
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

    // QR Code scanning
    qr_scanning: '🔍 正在扫描二维码...',
    qr_no_code_found: '❌ 图片中未找到二维码。请发送更清晰的图片。',
    qr_scan_error: '❌ 二维码扫描错误: {error}',
    qr_address_detected: '✅ *检测到 Solana 钱包地址!*',
    qr_address_label: '📍 *地址:*',
    qr_what_to_do: '您想对这个地址做什么?',
    qr_private_transfer: '🔐 私密转账',
    qr_multi_send: '📤 添加到多地址发送',
    qr_copy_address: '📋 复制地址',
    qr_not_solana_address: '⚠️ *二维码不包含 Solana 地址*',
    qr_content_label: '📄 *内容:*',
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
