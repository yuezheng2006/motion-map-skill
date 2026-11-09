import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {findChrome,runChrome,fileUrl} from '../skills/motion-map/scripts/lib.mjs';
const dir=mkdtempSync(join(tmpdir(),'motion-play-'));
try {
 const html=readFileSync('docs/order-sequence.html','utf8');
 const probe=`<script>try {const b=document.querySelector('.toolbar button'); if(!document.querySelector('#wires').animationsPaused()) throw Error('Reduced motion must start paused'); if(b.disabled) throw Error('No way to play with reduced motion'); b.click(); if(document.querySelector('#wires').animationsPaused()) throw Error('Play did not resume SVG'); document.body.dataset.motionTest='passed';} catch(e){document.body.dataset.motionTest=e.message;}</script>`;
 const f=join(dir,'motion.html');writeFileSync(f,html.replace('</body>',probe+'</body>'));
 const dom=runChrome(findChrome(),['--force-prefers-reduced-motion=reduce','--dump-dom',fileUrl(f)]);
 assert(dom.includes('data-motion-test="passed"'),dom.match(/data-motion-test="([^"]*)"/)?.[1]);
 console.log('✓ direct file opening respects reduced motion and offers explicit playback');
 const enabled=join(dir,'enabled.html');
 writeFileSync(enabled,html.replace('</body>',`<script>document.body.dataset.playing=String(!document.querySelector('#wires').animationsPaused());</script></body>`));
 const on=runChrome(findChrome(),['--force-prefers-reduced-motion=reduce','--dump-dom',fileUrl(enabled)+'?motion=on']);
 assert(on.includes('data-playing="true"'), 'explicit override must start playing');
 const check=runChrome(findChrome(),['--dump-dom',fileUrl(f)+'?check&motion=on']);
 assert(!check.includes('<animateMotion'),'check remains static despite override');

} finally {rmSync(dir,{recursive:true,force:true});}
