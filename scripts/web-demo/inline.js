// dist/ → 단일 self-contained HTML (스크립트 인라인, 폰트/이미지 data URI)
const fs = require('fs');
const path = require('path');
const [,, distDir, outFile] = process.argv;
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const mime = (f) => f.endsWith('.otf') ? 'font/otf' : f.endsWith('.ttf') ? 'font/ttf' : f.endsWith('.png') ? 'image/png' : f.endsWith('.ico') ? 'image/x-icon' : 'application/octet-stream';
const dataUri = (rel) => { const p = path.join(distDir, rel); return `data:${mime(rel)};base64,${fs.readFileSync(p).toString('base64')}`; };

// 모든 /assets/... 참조를 data URI로 치환하는 함수
const assetFiles = [];
(function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else assetFiles.push(path.relative(distDir, p).split(path.sep).join('/')); } })(path.join(distDir, 'assets'));
function inlineAssets(code) {
  let n = 0;
  for (const rel of assetFiles) { const needle = `"/${rel}"`; if (code.includes(needle)) { code = code.split(needle).join(JSON.stringify(dataUri(rel))); n++; } }
  return { code, n };
}

// <script src="/_expo/..."> → 인라인 (순서 유지)
const scripts = [...html.matchAll(/<script src="(\/_expo\/[^"]+)"[^>]*><\/script>/g)];
let inlined = '';
let totalAssets = 0;
for (const m of scripts) {
  let code = fs.readFileSync(path.join(distDir, m[1]), 'utf8');
  const r = inlineAssets(code); code = r.code; totalAssets += r.n;
  if (/\/_expo\/static\/js\/web\//.test(code)) console.warn('WARNING: remaining chunk URL reference in', m[1]);
  // </script> 문자열이 코드 안에 있으면 깨지므로 이스케이프
  code = code.split('</script').join('<\\/script');
  inlined += `<script>${code}</script>\n`;
  html = html.replace(m[0], () => '');
}
// 데모 전용: 어디에 호스팅돼도 브라우저 URL/히스토리를 건드리지 않는다 (앱 내 상태로만 이동)
const historyShim = `<script>(function(){var h=window.history;var noop=function(){};try{h.pushState=noop;h.replaceState=noop;h.go=noop;h.back=noop;h.forward=noop;}catch(e){}})();</script>\n`;
html = html.replace('</body>', () => historyShim + inlined + '</body>');
html = html.replace('<link rel="icon" href="/favicon.ico"/>', () => '<link rel="icon" href="' + dataUri('favicon.ico') + '"/>');
html = html.replace('<html lang="en">', '<html lang="ko">');
fs.writeFileSync(outFile, html);
console.log('scripts inlined:', scripts.length, 'asset refs inlined:', totalAssets, 'size:', (fs.statSync(outFile).size / 1024 / 1024).toFixed(2), 'MB');
const leftovers = (html.match(/"\/(_expo|assets)\/[^"]{0,80}/g) || []).slice(0, 10);
console.log('leftover absolute refs:', leftovers.length, leftovers);
