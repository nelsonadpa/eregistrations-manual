#!/usr/bin/env node
/**
 * Screenshot Annotator
 * Adds red circle/rectangle highlights to screenshots.
 *
 * Usage: node annotate.js <input> <output> <x> <y> <w> <h> [shape]
 *   shape: "rect" (default) or "circle"
 *   x,y: top-left corner (percentage of image, 0-100)
 *   w,h: width/height (percentage of image, 0-100)
 *
 * Example: node annotate.js input.png output.png 60 80 30 10 rect
 *   → draws a red rectangle at 60%,80% covering 30%x10% of the image
 */

const sharp = require('sharp');
const path = require('path');

async function annotate(inputPath, outputPath, xPct, yPct, wPct, hPct, shape = 'rect') {
    const metadata = await sharp(inputPath).metadata();
    const imgW = metadata.width;
    const imgH = metadata.height;

    const x = Math.round((xPct / 100) * imgW);
    const y = Math.round((yPct / 100) * imgH);
    const w = Math.round((wPct / 100) * imgW);
    const h = Math.round((hPct / 100) * imgH);

    const strokeWidth = Math.max(3, Math.round(imgW * 0.003));

    let svgOverlay;
    if (shape === 'circle') {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const rx = w / 2;
        const ry = h / 2;
        svgOverlay = `<svg width="${imgW}" height="${imgH}">
            <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
                fill="none" stroke="#FF0000" stroke-width="${strokeWidth}"/>
        </svg>`;
    } else {
        svgOverlay = `<svg width="${imgW}" height="${imgH}">
            <rect x="${x}" y="${y}" width="${w}" height="${h}"
                fill="none" stroke="#FF0000" stroke-width="${strokeWidth}" rx="4"/>
        </svg>`;
    }

    const tmpPath = outputPath + '.tmp.png';
    await sharp(inputPath)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .toFile(tmpPath);

    const fs = require('fs');
    fs.renameSync(tmpPath, outputPath);
    console.log(`Annotated: ${path.basename(outputPath)} (${shape} at ${xPct}%,${yPct}% ${wPct}x${hPct}%)`);
}

// CLI
const args = process.argv.slice(2);
if (args.length < 6) {
    console.log('Usage: node annotate.js <input> <output> <x%> <y%> <w%> <h%> [rect|circle]');
    process.exit(1);
}

annotate(args[0], args[1], +args[2], +args[3], +args[4], +args[5], args[6] || 'rect')
    .catch(console.error);
