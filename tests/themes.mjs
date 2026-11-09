import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { findChrome, runChrome, fileUrl } from '../skills/motion-map/scripts/lib.mjs';
const dir = mkdtempSync(join(tmpdir(), 'atelier-themes-'));
try {
  const html = readFileSync('docs/dsh-superagent.html', 'utf8');
  const script = `<script>
  try {
    const themes = JSON.parse(document.getElementById('themes').textContent);
    const menu = document.querySelector('.theme-control select');
    if (menu.options.length !== Object.keys(themes).length) throw Error('theme choices');
    const root = document.documentElement;
    const swatch = document.createElement('span'); document.body.appendChild(swatch);
    const rgb = hex => { swatch.style.color = hex; return getComputedStyle(swatch).color; };
    const stroke = document.querySelector('#wires polyline[stroke]');
    const dim = document.querySelector('#head > .dim');
    const luminance = color => {
      const v = color.match(/[\\d.]+/g).slice(0,3).map(x => +x / 255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4);
      return v.reduce((s,x,i) => s+x*[.2126,.7152,.0722][i],0);
    };
    for (const [id, theme] of Object.entries(themes)) {
      if (['whiteboard','isometric'].includes(id)) continue;
      menu.value = id; menu.dispatchEvent(new Event('change'));
      if (root.dataset.theme !== id || new URL(location.href).searchParams.get('theme') !== id) throw Error('selection '+id);
      if (getComputedStyle(document.getElementById('fit')).backgroundColor !== rgb(theme.tokens.bg)) throw Error('canvas '+id);
      if (getComputedStyle(stroke).stroke !== rgb(theme.tokens.cyan)) throw Error('stale SVG color '+id);
      const fg = luminance(getComputedStyle(dim).color), bg = luminance(rgb(theme.tokens['surface-subtle']));
      const contrast = (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
      if (contrast < 4.5) throw Error('secondary trace text contrast '+id+' '+contrast);
      if (document.documentElement.scrollWidth > innerWidth) throw Error('overflow '+id);
    }
    document.body.dataset.themeTest = 'passed';
  } catch(e) { document.body.dataset.themeTest = e.message; }
  </script>`;
  const file = join(dir, 'themes.html');
  writeFileSync(file, html.replace('</body>', script+'</body>'));
  for (const width of [390,1440]) {
    const dom = runChrome(findChrome(), [`--window-size=${width},1000`, '--dump-dom', fileUrl(file)]);
    assert(dom.includes('data-theme-test="passed"'), dom.match(/data-theme-test="([^"]*)"/)?.[1]);
    console.log(`✓ theme presets switch canvas and SVG colors; trace contrast ≥4.5; no overflow at ${width}px`);
  }
  const fallback = runChrome(findChrome(), ['--dump-dom',fileUrl(resolve('docs/dsh-superagent.html'))+'?theme=not-a-theme']);
  assert(fallback.includes('data-theme="paper"'));
  for (const id of Object.keys(JSON.parse(readFileSync('skills/motion-map/assets/themes.json','utf8')))) {
    const out = join(dir,id+'.mmd');
    execFileSync(process.execPath,['bin/cli.mjs','export','docs/dsh-superagent.html',out,'--theme',id]);
    const tokens = JSON.parse(readFileSync('skills/motion-map/assets/themes.json','utf8'))[id].tokens;
    const text = readFileSync(out,'utf8');
    assert(text.includes('fill:'+tokens.panel)); assert(text.includes('stroke:'+tokens.cyan));
  }
  const out = join(dir,'bad.png');
  const bad = spawnSync(process.execPath,['bin/cli.mjs','export','docs/dsh-superagent.html',out,'--theme','invalid']);
  assert.equal(bad.status,2); assert(!existsSync(out));
  console.log('✓ Mermaid palettes match theme; invalid export rejected; unknown URL theme falls back safely');
} finally { rmSync(dir,{recursive:true,force:true}); }
