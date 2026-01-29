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
        const originalImage = await Jimp.read(buffer);

        // Helper to scan a Jimp image
        const scanImage = (img: any): any => {
            const width = img.bitmap.width;
            const height = img.bitmap.height;
            const imageData = new Uint8ClampedArray(img.bitmap.data);
            return jsQR(imageData, width, height, { inversionAttempts: "attemptBoth" });
        };

        // Attempt 1: Original image
        let code = scanImage(originalImage);
        if (code) return processResult(code);

        // Attempt 2: Resize if too large (downscale to speed up and reduce noise)
        // or too small (upscale to help with low res)
        const { width, height } = originalImage.bitmap;
        if (width > 2000 || height > 2000) {
            const resized = originalImage.clone().resize({ w: 1000, h: -1 });
            code = scanImage(resized);
            if (code) return processResult(code);
        } else if (width < 300 || height < 300) {
            const resized = originalImage.clone().resize({ w: 800, h: -1 });
            code = scanImage(resized);
            if (code) return processResult(code);
        }

        // Attempt 3: Increase contrast and normalize
        // Often helps with washed out images or bad lighting
        const sensitiveParams = originalImage.clone().contrast(0.5).normalize();
        code = scanImage(sensitiveParams);
        if (code) return processResult(code);

        // Attempt 4: Greyscale and binarization-like effect (high contrast)
        const highContrast = originalImage.clone().greyscale().contrast(0.8);
        code = scanImage(highContrast);
        if (code) return processResult(code);

        // Attempt 5: Resize to a standard "good" size for QR codes (approx 600-800px) + normalize
        if (width !== 800) {
            const standard = originalImage.clone().resize({ w: 800, h: -1 }).normalize();
            code = scanImage(standard);
            if (code) return processResult(code);
        }

        return {
            success: false,
            error: 'No QR code found in the image after multiple attempts'
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to scan QR code'
        };
    }
}

function processResult(code: any): QRScanResult {
    const data = code.data;
    const parsed = parseSolanaUri(data);
    return {
        success: true,
        data: data,
        isSolanaAddress: parsed !== null
    };
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
