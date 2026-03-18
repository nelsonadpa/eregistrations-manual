#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');

const country = process.argv[2] || 'lesotho';
const srcDir = path.join(__dirname, country);
const distDir = path.join(__dirname, 'dist', country);

async function buildManual(htmlFile) {
    const htmlPath = path.join(srcDir, htmlFile);
    const html = fs.readFileSync(htmlPath, 'utf8');
    const $ = cheerio.load(html);

    // Inline CSS
    $('link[rel="stylesheet"][href*="manual.css"]').each(function() {
        const cssPath = path.join(srcDir, $(this).attr('href'));
        const css = fs.readFileSync(cssPath, 'utf8');
        $(this).replaceWith(`<style>${css}</style>`);
    });

    // Inline JS
    $('script[src]').each(function() {
        const jsSrc = $(this).attr('src');
        const jsPath = path.join(srcDir, jsSrc);
        if (fs.existsSync(jsPath)) {
            const js = fs.readFileSync(jsPath, 'utf8');
            $(this).replaceWith(`<script>${js}</script>`);
        }
    });

    // Inline images as base64
    const imgElements = $('img[src^="screenshots/"]').toArray();
    for (const img of imgElements) {
        const imgSrc = $(img).attr('src');
        const imgPath = path.join(srcDir, imgSrc);
        if (fs.existsSync(imgPath)) {
            // Always output as PNG regardless of source format
            const buffer = await sharp(imgPath)
                .resize({ width: 1280, withoutEnlargement: true })
                .png({ compressionLevel: 9 })
                .toBuffer();
            const base64 = buffer.toString('base64');
            const mime = 'image/png';
            $(img).attr('src', `data:${mime};base64,${base64}`);
        }
    }

    // Write output
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, htmlFile), $.html());
    const size = fs.statSync(path.join(distDir, htmlFile)).size;
    console.log(`Built: ${htmlFile} (${(size / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
    // Only process HTML files directly in the country directory (not subdirs)
    const htmlFiles = fs.readdirSync(srcDir).filter(f =>
        f.endsWith('.html') && fs.statSync(path.join(srcDir, f)).isFile()
    );
    console.log(`Building ${htmlFiles.length} manuals for ${country}...\n`);
    for (const file of htmlFiles) {
        await buildManual(file);
    }
    console.log(`\nDone. Output: dist/${country}/`);
}

main().catch(console.error);
