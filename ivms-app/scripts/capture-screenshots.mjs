import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');
const PDF_OUTPUT = path.join(__dirname, '..', 'screenshots', 'all-pages.pdf');

// Viewport sizes
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

// Admin pages (navigation by clicking sidebar items)
const ADMIN_PAGES = [
  { name: 'dashboard', label: 'مركز التحكم الموحد', index: 0 },
  { name: 'vehicles', label: 'الأسطول والعمليات', index: 1 },
  { name: 'maintenance', label: 'الصيانة التنبؤية', index: 2 },
  { name: 'reports', label: 'الامتثال والتراخيص', index: 3 },
  { name: 'inventory', label: 'المخزون اللوجستي', index: 4 },
];

// Driver pages (navigation by clicking bottom nav items)
const DRIVER_PAGES = [
  { name: 'home', label: 'الرئيسية', buttonIndex: 0 },
  { name: 'tasks', label: 'المهام', buttonIndex: 1 },
  { name: 'history', label: 'السجل', buttonIndex: 3 },
  { name: 'profile', label: 'حسابي', buttonIndex: 4 },
];

async function startDevServer() {
  console.log('🚀 Starting development server...');

  const server = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  return new Promise((resolve, reject) => {
    let serverReady = false;
    let serverUrl = BASE_URL;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);

      // Extract the actual port from output
      const match = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
      if (match) {
        serverUrl = `http://localhost:${match[1]}`;
      }

      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        console.log('✅ Development server is ready at', serverUrl);
        resolve({ server, url: serverUrl });
      }
    });

    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    server.on('error', reject);

    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server startup timed out'));
      }
    }, 30000);
  });
}

async function captureScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let serverInfo;
  let browser;
  const screenshots = [];

  try {
    serverInfo = await startDevServer();
    const BASE = serverInfo.url;

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📸 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // ========================================
    // ADMIN PAGES - Desktop
    // ========================================
    console.log('\n📱 Capturing Admin Pages (Desktop)...');
    await page.setViewport(DESKTOP_VIEWPORT);
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await page.waitForSelector('aside');
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < ADMIN_PAGES.length; i++) {
      const pageInfo = ADMIN_PAGES[i];
      console.log(`  📄 Capturing: Admin - ${pageInfo.name} (Desktop)`);

      if (i > 0) {
        const navButtons = await page.$$('aside nav button');
        if (navButtons[pageInfo.index]) {
          await navButtons[pageInfo.index].click();
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      const screenshotPath = path.join(OUTPUT_DIR, `admin-${pageInfo.name}-desktop.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push({ path: screenshotPath, name: `Admin - ${pageInfo.name} (Desktop)`, viewport: 'desktop' });
    }

    // ========================================
    // ADMIN PAGES - Mobile
    // ========================================
    console.log('\n📱 Capturing Admin Pages (Mobile)...');
    await page.setViewport(MOBILE_VIEWPORT);

    for (let i = 0; i < ADMIN_PAGES.length; i++) {
      const pageInfo = ADMIN_PAGES[i];
      console.log(`  📄 Capturing: Admin - ${pageInfo.name} (Mobile)`);

      // Reload the page fresh for each capture to avoid state issues
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 500));

      if (i > 0) {
        // Click hamburger menu to open sidebar
        const hamburgerBtn = await page.$('button svg.lucide-menu');
        if (hamburgerBtn) {
          const parent = await hamburgerBtn.evaluateHandle(el => el.closest('button'));
          await parent.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Click the nav item in sidebar
        const navButtons = await page.$$('aside nav button');
        if (navButtons[pageInfo.index]) {
          await navButtons[pageInfo.index].click();
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      const screenshotPath = path.join(OUTPUT_DIR, `admin-${pageInfo.name}-mobile.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push({ path: screenshotPath, name: `Admin - ${pageInfo.name} (Mobile)`, viewport: 'mobile' });
    }

    // ========================================
    // DRIVER PAGES - Desktop
    // ========================================
    console.log('\n📱 Capturing Driver Pages (Desktop)...');
    await page.setViewport(DESKTOP_VIEWPORT);
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Switch to driver mode - click the smartphone icon button in header toggle
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.title === 'واجهة السائق') {
          btn.click();
          return;
        }
        // Also check for smartphone icon
        const svg = btn.querySelector('svg.lucide-smartphone');
        if (svg) {
          btn.click();
          return;
        }
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < DRIVER_PAGES.length; i++) {
      const pageInfo = DRIVER_PAGES[i];
      console.log(`  📄 Capturing: Driver - ${pageInfo.name} (Desktop)`);

      if (i > 0) {
        const navButtons = await page.$$('nav.fixed button');
        if (navButtons.length > 0 && navButtons[pageInfo.buttonIndex]) {
          await navButtons[pageInfo.buttonIndex].click();
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      const screenshotPath = path.join(OUTPUT_DIR, `driver-${pageInfo.name}-desktop.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push({ path: screenshotPath, name: `Driver - ${pageInfo.name} (Desktop)`, viewport: 'desktop' });
    }

    // ========================================
    // DRIVER PAGES - Mobile
    // ========================================
    console.log('\n📱 Capturing Driver Pages (Mobile)...');
    await page.setViewport(MOBILE_VIEWPORT);
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Switch to driver mode - click the smartphone icon button in mobile header toggle
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.title === 'واجهة السائق') {
          btn.click();
          return;
        }
        // Also check for smartphone icon
        const svg = btn.querySelector('svg.lucide-smartphone');
        if (svg) {
          btn.click();
          return;
        }
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < DRIVER_PAGES.length; i++) {
      const pageInfo = DRIVER_PAGES[i];
      console.log(`  📄 Capturing: Driver - ${pageInfo.name} (Mobile)`);

      if (i > 0) {
        const navButtons = await page.$$('nav.fixed button');
        if (navButtons.length > 0 && navButtons[pageInfo.buttonIndex]) {
          await navButtons[pageInfo.buttonIndex].click();
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      const screenshotPath = path.join(OUTPUT_DIR, `driver-${pageInfo.name}-mobile.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push({ path: screenshotPath, name: `Driver - ${pageInfo.name} (Mobile)`, viewport: 'mobile' });
    }

    console.log(`\n✅ Captured ${screenshots.length} screenshots`);

    // ========================================
    // GENERATE PDF
    // ========================================
    console.log('\n📄 Generating PDF...');
    await generatePDF(screenshots);

    console.log(`\n🎉 Done! PDF saved to: ${PDF_OUTPUT}`);
    console.log(`   Screenshots saved to: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverInfo?.server) {
      serverInfo.server.kill();
    }
  }
}

async function generatePDF(screenshots) {
  const pdfDoc = await PDFDocument.create();

  for (const screenshot of screenshots) {
    const imageBytes = fs.readFileSync(screenshot.path);
    const image = await pdfDoc.embedPng(imageBytes);

    const { width, height } = image;

    // Scale to fit reasonably in PDF
    const maxWidth = screenshot.viewport === 'mobile' ? 400 : 800;
    const scale = maxWidth / width;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    const page = pdfDoc.addPage([scaledWidth + 40, scaledHeight + 80]);

    page.drawText(screenshot.name, {
      x: 20,
      y: scaledHeight + 50,
      size: 14,
    });

    page.drawImage(image, {
      x: 20,
      y: 20,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(PDF_OUTPUT, pdfBytes);
}

captureScreenshots().catch(console.error);
