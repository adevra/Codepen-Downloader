import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import { JSDOM } from "jsdom";

puppeteer.use(StealthPlugin());
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadCodePen(url) {
    console.log(`🔍 Fetching CodePen: ${url} ...`);
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--ignore-certificate-errors",
            "--disable-blink-features=AutomationControlled",
        ],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({ referer: url });
    try {
        console.log("🔗 Navigating to the original pen URL...");
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });


        const iframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector("iframe");
            return iframe ? iframe.src : null;
        });

        if (!iframeSrc) {
            console.error("❌ Failed to locate the iframe on the page.");
            return;
        }

        console.log(`🔗 Found iframe source: ${iframeSrc}`);
        await page.setExtraHTTPHeaders({ referer: url });
        await page.goto(iframeSrc, { waitUntil: "domcontentloaded", timeout: 30000 });
        console.log("👀 Observing canvas elements...");
        await page.evaluate(() => {
            const observer = new MutationObserver(() => {
                const canvases = document.querySelectorAll("canvas");
                if (canvases.length > 1) {
                    console.log("🧹 Removing extra canvas...");
                    canvases[0].remove();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });

        await delay(10000);
        console.log("📄 Extracting cleaned HTML...");
        const rawHtml = await page.evaluate(() => document.documentElement.outerHTML);
        const processedHtml = processHtml(rawHtml);
        fs.writeFileSync("cleaned_codepen.html", processedHtml);
        console.log("✅ Successfully saved as cleaned_codepen.html");
    } catch (error) {
        console.error(`❌ Failed to download CodePen: ${error.message}`);
    } finally {
        await browser.close();
    }
}


function processHtml(rawHtml) {
    const dom = new JSDOM(rawHtml);
    const document = dom.window.document;
    const canvases = document.querySelectorAll("canvas");
    canvases.forEach(canvas => canvas.remove());
    console.log(`🧹 Removed ${canvases.length} canvas elements.`);

    const body = document.querySelector("body");
    if (body) {
        body.style.margin = "0";
        body.style.overflow = "hidden";
        console.log("🎨 Adjusted body styles.");
    }
    return dom.serialize();
}

const codepenUrl = process.argv[2];

if (!codepenUrl) {
    console.error("❌ Please provide a CodePen URL!");
    console.error("Example: node download.js https://codepen.io/username/pen/pen_id");
    process.exit(1);
}

downloadCodePen(codepenUrl);


