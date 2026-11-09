// Real-browser smoke test, no npm dependencies. Uses the same Chrome as export.
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { findChrome, runChrome, fileUrl } from '../skills/motion-map/scripts/lib.mjs';
const dir = mkdtempSync(join(tmpdir(), 'atelier-controls-'));
try {
  const script = `<script>
  try {
    const buttons = document.querySelectorAll('.toolbar button');
    const svg = document.querySelector('#wires');
    if (buttons.length !== 2) throw Error('missing controls');
    buttons[0].click();
    if (!svg.animationsPaused() || buttons[0].getAttribute('aria-pressed') !== 'true') throw Error('pause');
    buttons[0].click();
    if (svg.animationsPaused()) throw Error('resume');
    buttons[1].click();
    dispatchEvent(new Event('resize'));
    if (document.querySelector('#fit').style.overflowX !== 'auto' || Number(getComputedStyle(document.querySelector('#stage')).zoom) !== 1) throw Error('actual size after resize');
    buttons[1].click();
    if (document.querySelector('#fit').style.overflowX !== 'hidden') throw Error('fit');
    if (document.documentElement.scrollWidth > innerWidth) throw Error('page overflow');
    document.body.dataset.test = 'passed';
  } catch (e) { document.body.dataset.test = e.message; }
  </script>`;
  const file = join(dir, 'controls.html');
  writeFileSync(file, readFileSync(resolve('docs/atelier.html'), 'utf8').replace('</body>', script + '</body>'));
  const chrome = findChrome();
  for (const width of [390, 1440]) {
    const dom = runChrome(chrome, [`--window-size=${width},1000`, '--dump-dom', fileUrl(file)]);
    if (!dom.includes('data-test="passed"')) throw Error(`controls failed at ${width}px: ${dom.match(/data-test="([^"]*)"/)?.[1]}`);
    console.log(`✓ pause/resume, zoom, resize, no page overflow (${width}px)`);
  }
  const still = runChrome(chrome, ['--force-prefers-reduced-motion=reduce', '--dump-dom', fileUrl(resolve('docs/atelier.html'))]);
  if (!/(播放动画|Play motion)/.test(still) || !still.includes('<animateMotion') || !/<html[^>]*class="[^"]*paused/.test(still)) throw Error('reduced motion');
  console.log('✓ reduced motion starts paused with explicit playback available');
} finally { rmSync(dir, { recursive: true, force: true }); }
