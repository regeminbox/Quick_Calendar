#!/usr/bin/env node
// `npm run demo:web` → dist-demo/quickcalendar-demo.html (스크립트·폰트·이미지가 모두 들어 있는 한 파일)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const pkgPath = path.join(root, 'package.json');
const original = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(original);
pkg.main = './scripts/web-demo/entry.js';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
try {
  fs.rmSync(path.join(root, 'dist-demo'), { recursive: true, force: true });
  execSync('npx expo export --platform web --output-dir dist-demo', { cwd: root, stdio: 'inherit', env: { ...process.env, CI: '1' } });
} finally {
  fs.writeFileSync(pkgPath, original);
}
execSync(`node ${path.join(__dirname, 'inline.js')} dist-demo dist-demo/quickcalendar-demo.html`, { cwd: root, stdio: 'inherit' });
console.log('→ dist-demo/quickcalendar-demo.html');
