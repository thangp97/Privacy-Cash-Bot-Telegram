/**
 * Post-install script to patch privacycash library
 * Fixes the import.meta.dirname issue that can be undefined in some Node.js contexts
 */

const fs = require('fs');
const path = require('path');

const privacycashIndexPath = path.join(__dirname, '..', 'node_modules', 'privacycash', 'dist', 'index.js');

if (fs.existsSync(privacycashIndexPath)) {
    let content = fs.readFileSync(privacycashIndexPath, 'utf-8');
    
    // Check if already patched
    if (content.includes('getKeyBasePath')) {
        console.log('privacycash already patched, skipping...');
        process.exit(0);
    }
    
    // Add polyfill imports and function after the existing imports
    const importEndMarker = "import { getAssociatedTokenAddress } from '@solana/spl-token';";
    const polyfillCode = `import { getAssociatedTokenAddress } from '@solana/spl-token';
import { fileURLToPath } from 'node:url';

// Polyfill for import.meta.dirname (undefined in some Node.js versions/contexts)
const __privacycash_filename = fileURLToPath(import.meta.url);
const __privacycash_dirname = path.dirname(__privacycash_filename);
function getKeyBasePath() {
    const dirname = import.meta.dirname || __privacycash_dirname;
    return path.join(dirname, '..', 'circuit2', 'transaction2');
}
`;

    content = content.replace(importEndMarker, polyfillCode);
    
    // Replace all instances of path.join(import.meta.dirname, '..', 'circuit2', 'transaction2')
    content = content.replace(
        /path\.join\(import\.meta\.dirname,\s*'\.\.'\s*,\s*'circuit2'\s*,\s*'transaction2'\)/g,
        'getKeyBasePath()'
    );
    
    fs.writeFileSync(privacycashIndexPath, content);
    console.log('Successfully patched privacycash library');
} else {
    console.log('privacycash not found, skipping patch...');
}
