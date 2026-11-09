import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {findChrome,runChrome,fileUrl} from '../skills/motion-map/scripts/lib.mjs';
const dir=mkdtempSync(join(tmpdir(),'motion-skins-'));
try {
 for(const theme of ['blueprint','drafting','whiteboard','brutalism','crt','saas','isometric']) {
  const f=join(dir,theme+'.html');
  execFileSync(process.execPath,['bin/cli.mjs','build','skills/motion-map/examples/order-sequence.json',f,'--theme',theme]);
  const probe=`<script>setTimeout(()=>{try {const svg=document.querySelector('#wires');const messages=[...svg.querySelectorAll('[data-order]')];if(messages.length!==7)throw Error('lost messages');if(messages.some(x=>!x.hasAttribute('marker-end')))throw Error('lost direction');if(document.querySelectorAll('animateMotion').length!==7)throw Error('lost animation');if(document.documentElement.scrollWidth>innerWidth)throw Error('overflow');if('${theme}'==='whiteboard'&&!svg.querySelector('.sketch'))throw Error('no sketch outlines');if('${theme}'==='isometric'&&!document.querySelector('#isoRoot'))throw Error('no isometric floor'); const packet=svg.querySelector('[data-message-packet]');svg.pauseAnimations();svg.setCurrentTime(.5);setTimeout(()=>{const a=packet.getCTM();svg.setCurrentTime(.8);setTimeout(()=>{const b=packet.getCTM();document.body.dataset.skinTest=(Math.abs(a.e-b.e)+Math.abs(a.f-b.f)>2)?'passed':'packet did not move';},35);},35);}catch(e){document.body.dataset.skinTest=e.message;}},100);</script>`;
  writeFileSync(f,readFileSync(f,'utf8').replace('</body>',probe+'</body>'));
  for(const width of [390,1440]) {
   const dom=runChrome(findChrome(),[`--window-size=${width},1000`,'--virtual-time-budget=1600','--dump-dom',fileUrl(f)]);
   assert(dom.includes('data-skin-test="passed"'),`${theme} ${width}: ${dom.match(/data-skin-test="([^"]*)"/)?.[1]}`);
  }
  console.log('✓ '+theme+': offline motion, sequence arrows and responsive layout');
 }
}finally{rmSync(dir,{recursive:true,force:true});}
