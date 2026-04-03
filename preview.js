#!/usr/bin/env node
/**
 * preview.js — Ad preview & screenshot helper for Pop-Up Panic
 *
 * Opens index.html in a headless Chromium browser with a specific ad displayed
 * (via the ?preview= URL parameter) and saves a screenshot.
 *
 * Requirements: Node.js 18+, `playwright` npm package, and a system Chromium
 *   npm install playwright
 *
 * Usage:
 *   node preview.js [era[:mechanism[:adIndex]]] [outputFile]
 *   node preview.js --list
 *
 * Arguments:
 *   era          Era key (see --list for all keys).  Default: earlyWeb
 *   mechanism    Close mechanism key (see --list).   Default: simpleX
 *   adIndex      Ad index (number) or keyword search within ad text.
 *                Default: 0 (first ad in the era)
 *   outputFile   Where to save the PNG screenshot.
 *                Default: screenshots/<era>-<mechanism>-<adIndex>.png
 *
 * Examples:
 *   node preview.js                                     # earlyWeb, first ad
 *   node preview.js earlyWeb                            # earlyWeb, all defaults
 *   node preview.js earlyWeb:simpleX:2                  # earlyWeb ad[2], simpleX
 *   node preview.js earlyWeb:simpleX:credit             # earlyWeb ad matching "credit"
 *   node preview.js genZ:endlessScroll                  # Strava endless scroll ad
 *   node preview.js genZ:simpleX:BeReal                 # BeReal standalone ad
 *   node preview.js earlyWeb:simpleX:0 my-shot.png      # custom output path
 *   node preview.js --list                              # print available keys
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ── CLI argument parsing ──────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--list') || args.includes('-l')) {
    printList();
    process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
}

// First non-flag arg is the preview spec, second is the output path
const specArg = args.find(a => !a.startsWith('-')) || 'earlyWeb';
const outputArg = args.filter(a => !a.startsWith('-'))[1] || null;

const specParts = specArg.split(':');
const eraKey = specParts[0] || 'earlyWeb';
const mechanismKey = specParts[1] || 'simpleX';
const adSelector = specParts[2] !== undefined ? specParts[2] : '0';

const screenshotsDir = path.join(__dirname, 'screenshots');
const defaultOutput = path.join(
    screenshotsDir,
    `${eraKey}-${mechanismKey}-${adSelector}.png`
);
// Ensure output path always has .png extension
let outputFile = outputArg ? path.resolve(outputArg) : defaultOutput;
if (!outputFile.endsWith('.png') && !outputFile.endsWith('.jpg') && !outputFile.endsWith('.jpeg')) {
    outputFile += '.png';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function printHelp() {
    const src = fs.readFileSync(__filename, 'utf8');
    const start = src.indexOf('/**');
    const end = src.indexOf('*/\n', start);
    const block = src.slice(start + 3, end).trim();
    console.log(block.split('\n').map(l => l.replace(/^ \* ?/, '')).join('\n'));
}

function printList() {
    console.log('Era keys:');
    [
        'earlyWeb', 'myspaceAim', 'aolDialup', 'win95', 'winXP',
        'flash', 'web20', 'mobile', 'genZ', 'ai', 'retroArcade', 'aiAgents'
    ].forEach(k => console.log('  ' + k));
    console.log('\nMechanism keys:');
    [
        'simpleX', 'disabledX', 'movingX', 'fakeX', 'multipleX',
        'keyboardTab', 'puzzle', 'holdX', 'doubleClick', 'typeX',
        'declineBtn', 'endlessScroll', 'aiPicker', 'simonSays'
    ].forEach(k => console.log('  ' + k));
    console.log('\nExamples:');
    console.log('  node preview.js earlyWeb');
    console.log('  node preview.js earlyWeb:simpleX:credit');
    console.log('  node preview.js genZ:endlessScroll');
    console.log('  node preview.js genZ:simpleX:BeReal');
    console.log('  node preview.js ai:aiPicker');
    console.log('  node preview.js retroArcade:simonSays');
    console.log('  node preview.js retroArcade:simpleX:CHEAT');
    console.log('  node preview.js aiAgents:simpleX');
    console.log('  node preview.js aiAgents:simpleX:MoltBook');
    console.log('  node preview.js --list');
}

// Find system Chromium / Chrome executable
function findChromium() {
    const candidates = [
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const p of candidates) {
        try { if (fs.existsSync(p)) return p; } catch (_) { /* skip */ }
    }
    // Try PATH lookups
    for (const cmd of ['chromium', 'chromium-browser', 'google-chrome']) {
        try {
            const p = execFileSync('which', [cmd], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
            if (p) return p;
        } catch (_) { /* skip */ }
    }
    return null;
}

// Minimal static file server for the repo directory
function startServer(dir, port) {
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
    };
    const server = http.createServer(function(req, res) {
        let filePath = path.join(dir, req.url.split('?')[0]);
        if (filePath === path.join(dir, '/') || filePath === dir) {
            filePath = path.join(dir, 'index.html');
        }
        fs.readFile(filePath, function(err, data) {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath);
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise(function(resolve, reject) {
        server.listen(port, '127.0.0.1', function() {
            resolve(server);
        });
        server.on('error', reject);
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const { chromium } = require('playwright');

    const chromiumPath = findChromium();
    if (!chromiumPath) {
        console.error('Error: Could not find a Chromium or Chrome executable.');
        console.error('Install Chromium or set the path in this script.');
        process.exit(1);
    }

    const PORT = 7891;
    const repoDir = __dirname;

    console.log(`Starting local server on port ${PORT}…`);
    const server = await startServer(repoDir, PORT);

    const previewParam = [eraKey, mechanismKey, adSelector].join(':');
    const url = `http://127.0.0.1:${PORT}/?preview=${encodeURIComponent(previewParam)}`;

    console.log(`Opening: ${url}`);

    const browser = await chromium.launch({
        executablePath: chromiumPath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the ad popup to appear in the DOM
    try {
        await page.waitForSelector('.era-popup, .popup-ad', { timeout: 5000 });
    } catch (_) {
        console.warn('Warning: No ad popup detected within 5s — screenshotting anyway.');
    }

    // For endlessScroll ads, click the × button to reveal the Strava feed
    if (mechanismKey === 'endlessScroll') {
        try {
            const closeBtn = await page.$('.popup-ad-close-btn');
            if (closeBtn) {
                await closeBtn.click();
                // Wait for the feed container to appear
                await page.waitForSelector('.endless-scroll-container', { timeout: 3000 });
            }
        } catch (_) {
            console.warn('Warning: Could not reveal endlessScroll feed automatically.');
        }
    }

    // Small extra wait for animations to settle
    await page.waitForTimeout(600);

    // Ensure the screenshots directory exists
    const outDir = path.dirname(outputFile);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    await page.screenshot({ path: outputFile, fullPage: false });
    console.log(`Screenshot saved → ${outputFile}`);

    await browser.close();
    server.close();
}

main().catch(function(err) {
    console.error('Error:', err.message);
    process.exit(1);
});
