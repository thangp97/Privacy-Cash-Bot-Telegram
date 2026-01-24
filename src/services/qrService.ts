import jsQRModule from 'jsqr';
import { Jimp } from 'jimp';

// Handle both default and named export
const jsQR = (jsQRModule as any).default || jsQRModule;

export interface QRScanResult {
    success: boolean;
    data?: string;
    isSolanaAddress?: boolean;
    error?: string;
}

/**
 * Validate if a string is a valid Solana address
 * Solana addresses are base58 encoded and 32-44 characters long
 */
export function isValidSolanaAddress(address: string): boolean {
    // Base58 characters (no 0, O, I, l)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
}

/**
 * Parse Solana URI format (solana:address?amount=xxx&spl-token=xxx)
 */
export function parseSolanaUri(uri: string): { address: string; amount?: number; token?: string } | null {
    try {
        // Check if it's a solana: URI
        if (uri.startsWith('solana:')) {
            const withoutScheme = uri.substring(7);
            const [addressPart, queryPart] = withoutScheme.split('?');
            
            if (!isValidSolanaAddress(addressPart)) {
                return null;
            }

            const result: { address: string; amount?: number; token?: string } = {
                address: addressPart
            };

            if (queryPart) {
                const params = new URLSearchParams(queryPart);
                const amount = params.get('amount');
                const token = params.get('spl-token');
                
                if (amount) {
                    result.amount = parseFloat(amount);
                }
                if (token) {
                    result.token = token;
                }
            }

            return result;
        }

        // Check if it's just a plain address
        if (isValidSolanaAddress(uri)) {
            return { address: uri };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Scan QR code from image buffer
 */
export async function scanQRFromBuffer(buffer: Buffer): Promise<QRScanResult> {
    try {
        // Load image using Jimp
        const image = await Jimp.read(buffer);
        
        // Get image data
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        // Convert to RGBA format that jsQR expects
        const imageData = new Uint8ClampedArray(image.bitmap.data);
        
        // Scan QR code
        const code = jsQR(imageData, width, height);
        
        if (!code) {
            return {
                success: false,
                error: 'No QR code found in the image'
            };
        }

        const data = code.data;
        
        // Check if it's a Solana address or URI
        const parsed = parseSolanaUri(data);
        
        return {
            success: true,
            data: data,
            isSolanaAddress: parsed !== null
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to scan QR code'
        };
    }
}

/**
 * Download file from URL and return as buffer
 */
export async function downloadFile(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
