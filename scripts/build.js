#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const archiver = require('archiver');

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');
const packageJson = require('../package.json');

// カラー出力用のヘルパー
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDistDir() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    log('✓ Created dist directory', 'green');
  }
}

function runTests() {
  log('🧪 Running tests...', 'blue');
  try {
    execSync('npm test', { stdio: 'inherit' });
    log('✓ All tests passed!', 'green');
  } catch (error) {
    log('✗ Tests failed! Build aborted.', 'red');
    process.exit(1);
  }
}

function runLint() {
  log('🔍 Running linter...', 'blue');
  try {
    execSync('npm run check', { stdio: 'inherit' });
    log('✓ Linting passed!', 'green');
  } catch (error) {
    log('✗ Linting failed! Build aborted.', 'red');
    process.exit(1);
  }
}

function createZip() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const zipName = `${packageJson.name}-v${packageJson.version}-${timestamp}.zip`;
    const zipPath = path.join(distDir, zipName);

    log(`📦 Creating zip file: ${zipName}`, 'blue');

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 最高圧縮率
    });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      log(`✓ ZIP created successfully: ${zipName} (${sizeMB} MB)`, 'green');
      resolve(zipPath);
    });

    archive.on('error', (err) => {
      log(`✗ Error creating ZIP: ${err.message}`, 'red');
      reject(err);
    });

    archive.pipe(output);

    // src ディレクトリの全内容を追加
    archive.directory(srcDir, false);

    archive.finalize();
  });
}

async function build() {
  try {
    log('🚀 Starting build process...', 'blue');

    // 1. テスト実行
    runTests();

    // 2. リント実行
    runLint();

    // 3. dist ディレクトリ確保
    ensureDistDir();

    // 4. ZIP作成
    const zipPath = await createZip();

    log('🎉 Build completed successfully!', 'green');
    log(`📁 Output: ${path.relative(process.cwd(), zipPath)}`, 'yellow');
  } catch (error) {
    log(`✗ Build failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみbuildを実行
if (require.main === module) {
  build();
}

module.exports = { build };