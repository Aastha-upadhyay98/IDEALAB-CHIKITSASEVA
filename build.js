const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

function getTranslations() {
  const rows = {};
  const tsvDir = path.join(SRC, 'i18n');
  const files = fs.readdirSync(tsvDir).filter(f => f.endsWith('.tsv')).sort();

  for (const file of files) {
    const filePath = path.join(tsvDir, file);
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (!line.trim()) return;
      const parts = line.split('\t');
      if (parts.length !== 3) {
        throw new Error(`${file}:${idx + 1}: expected 3 tab-separated columns (English, Hindi, Marathi)`);
      }
      const [en, hi, mr] = parts;
      const phEn = (en.match(/\{\w+\}/g) || []).sort().join(',');
      const phHi = (hi.match(/\{\w+\}/g) || []).sort().join(',');
      const phMr = (mr.match(/\{\w+\}/g) || []).sort().join(',');
      if (phEn !== phHi || phEn !== phMr) {
        throw new Error(`${file}:${idx + 1}: placeholders differ from English: ${en}`);
      }
      rows[en] = [hi, mr];
    });
  }
  return rows;
}

function main() {
  const rows = getTranslations();
  const i18n = "const TR=" + JSON.stringify(rows) +
    ";\nconst T={hi:{},mr:{}};for(const k in TR){T.hi[k]=TR[k][0];T.mr[k]=TR[k][1]}\n";

  const jsDir = path.join(SRC, 'js');
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
  const jsContent = jsFiles.map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('');

  const js = i18n + jsContent;
  let html = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
  const css = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');

  html = html.replace('/*__CSS__*/', css);
  html = html.replace('/*__JS__*/', js);

  fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
  console.log(`Built index.html with ${Object.keys(rows).length} translations`);
}

main();
