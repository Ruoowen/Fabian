const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const scene=$('#scene'),book=$('#book'),leftSlot=$('#leftSlot'),rightSlot=$('#rightSlot'),curlLayer=$('#curlLayer'),castShadow=$('#castShadow');
const openBtn=$('#openBtn'),prevBtn=$('#prevBtn'),nextBtn=$('#nextBtn'),pager=$('#pager'),soundBtn=$('#soundBtn'),bgm=$('#bgm');
const templates=$$('[data-page]',$('#pageTemplates'));
const spreadCount=Math.floor(templates.length/2);
let spread=0,opened=false,flipping=false,soundOn=false,audioCtx=null,touchX=null,wheelLock=false;
const pagerColors=['#8fd0eb','#ffd86f','#f5a6a0','#718ee8','#74cfa1','#b89be8','#bfe59a','#f58a68','#f4b38f','#5577df','#4771d2','#c3a8e8','#c3a8e8','#fff1d7','#f0c76d','#8fd0eb','#ffd86f','#f5a6a0','#718ee8'];

function clonePage(index,forCurl=false){
  const n=templates[index].cloneNode(true);n.removeAttribute('data-page');n.hidden=false;
  if(forCurl){
    $$('video',n).forEach(v=>{const img=document.createElement('img');img.className='video-poster-proxy';img.src=v.dataset.poster||v.getAttribute('poster')||'';img.alt='video preview';v.replaceWith(img)});
  }
  return n;
}
function pauseVideos(){ $$('video',book).forEach(v=>{try{v.pause()}catch{}}) }
function seedStars(root){$$('.birthday-stars',root).forEach(host=>{if(host.dataset.ready)return;host.dataset.ready='1';for(let i=0;i<28;i++){const d=document.createElement('i');d.style.left=`${Math.random()*100}%`;d.style.top=`${Math.random()*100}%`;d.style.animationDelay=`${Math.random()*2.5}s`;host.appendChild(d)}})}

const stickerRecipes={
  1:[['spark',14,14,1.0,-8,.82],['label',84,16,.9,5,.65,'yay!'],['flower',14,84,1.12,2,.52]],
  2:[['bow',14,15,1.08,-5,.72],['heart-outline',85,78,1.0,8,.55],['label',82,12,.82,-3,.52,'09.19']],
  3:[['sun',13,15,1.0,0,.58],['butterfly',84,16,.96,8,.62],['label',17,83,.82,-5,.5,'smile']],
  4:[['cloud',15,14,1.08,-4,.48],['spark2',84,19,1.0,6,.76],['flower2',83,82,.98,-8,.46]],
  5:[['heart',15,18,1.0,-10,.58],['daisy',84,14,1.04,5,.68],['label',80,83,.82,3,.48,'more ♡']],
  6:[['bow',14,82,1.05,6,.65],['star',85,15,1.0,-5,.72],['label',16,14,.78,-4,.48,'hehe']],
  7:[['scribble',14,15,1.0,-9,.4],['spark',85,82,.96,7,.72],['label',82,14,.82,4,.55,'oops']],
  8:[['moon',14,16,1.08,-6,.58],['note',84,82,1.0,8,.7],['star',85,14,.84,-3,.55]],
  9:[['flower',14,14,1.1,-4,.6],['heart-outline',84,18,.95,8,.55],['label',16,83,.8,-7,.48,'07.03']],
 10:[['spark2',15,16,1.08,-6,.72],['cloud',84,15,.92,5,.46],['label',82,84,.84,2,.5,'oh no']],
 11:[['butterfly',14,16,1.0,-5,.58],['flower2',84,82,.98,7,.5],['label',83,15,.84,4,.53,'why you?']],
 12:[['heart',13,82,.96,-7,.58],['spark',85,15,1.08,5,.75],['bow',85,82,.94,-3,.55]],
 13:[['gold-star',14,15,1.08,-5,.78],['label',84,15,.82,5,.54,'79 · Au'],['spark2',83,83,.9,-8,.58]],
 14:[['clover',14,82,1.0,4,.58],['heart-outline',85,16,1.06,-7,.56],['label',17,15,.8,-5,.48,'precious']],
 15:[['bow',14,15,1.06,-6,.68],['heart',84,16,.98,7,.54],['label',82,83,.82,4,.48,'clingy ♡']],
 16:[['daisy',14,82,1.08,5,.58],['spark2',85,16,.98,-5,.74],['butterfly',83,82,.9,6,.48]],
 17:[['calendar',14,15,1.0,-5,.58],['heart-outline',84,82,.98,7,.56],['label',83,15,.82,4,.5,'100']],
 18:[['spark',14,82,1.05,7,.7],['label',84,16,.86,-4,.54,'from ♥'],['flower2',15,15,.95,-6,.5]],
 19:[['arrow',15,15,1.02,-4,.48],['heart',84,82,1.02,7,.54],['label',82,15,.82,3,.48,'you']],
 20:[['sun',14,82,1.04,4,.56],['cloud',85,15,.95,-5,.44],['spark2',84,82,.86,8,.7]],
 21:[['flower',14,15,1.04,-5,.54],['star',85,82,1.0,7,.66],['label',83,15,.8,4,.48,'next year']],
 22:[['balloon',14,82,1.02,-5,.58],['spark',84,15,1.02,5,.72],['heart-outline',84,83,.9,-4,.5]],
 23:[['arrow',15,16,1.0,-6,.52],['label',84,16,.86,4,.55,'try!'],['scribble',82,83,1.02,-5,.38]],
 24:[['star',14,82,.96,5,.66],['note',85,15,1.0,-4,.62],['flower2',84,82,.92,6,.45]],
 25:[['cloud',14,15,1.0,-5,.44],['spark2',85,82,.94,7,.7],['label',84,15,.78,4,.46,'again']],
 26:[['heart-outline',15,82,1.08,-5,.54],['arrow',84,16,1.0,5,.48],['label',83,82,.82,-3,.5,'start']],
 27:[['sun',14,15,1.03,-6,.55],['daisy',84,82,1.05,5,.58],['label',82,15,.84,4,.5,'more!']],
 28:[['note',14,82,1.0,5,.64],['heart',85,15,.92,-4,.52],['bow',84,82,.94,6,.58]],
 29:[['flower2',14,15,1.08,-5,.52],['butterfly',84,82,.95,6,.56],['label',83,15,.82,4,.48,'I see you']],
 30:[['spark',14,82,1.05,4,.72],['heart-outline',85,16,1.0,-5,.54],['cloud',83,82,.88,6,.38]],
 31:[['cake',14,16,1.02,-4,.72],['confetti',84,15,1.0,5,.7],['label',82,82,.84,-4,.52,'birthday!']],
 32:[['balloon',14,82,1.02,5,.62],['star',84,16,.95,-5,.68],['bow',84,82,.9,4,.52]],
 33:[['arrow',14,15,.96,-4,.48],['cloud',84,15,1.0,5,.42],['label',82,83,.82,-4,.5,'future']],
 34:[['moon',14,82,1.06,5,.56],['spark2',84,15,1.02,-5,.72],['heart-outline',84,82,.92,6,.48]],
 35:[['heart',14,15,1.04,-5,.58],['label',84,15,.82,4,.5,'right now'],['flower',83,82,1.0,-4,.5]],
 36:[['bow',14,82,1.05,5,.62],['spark',84,16,1.0,-5,.7],['label',82,82,.78,3,.46,'us ♡']],
 37:[['moon',14,15,1.06,-5,.54],['heart-outline',84,82,1.0,6,.54],['label',83,15,.82,4,.5,'one more']],
 38:[['spark2',14,82,1.08,5,.72],['flower2',84,16,1.02,-5,.5],['label',82,82,.82,4,.52,'caught up ♡']]
};

function seedDecor(root){
  $$(':scope > .page, .page',root).forEach(page=>{
    if(!page || page.dataset.decorReady) return;
    page.dataset.decorReady='1';
    const folioText=(page.querySelector('.page__folio')?.textContent||'0').replace(/\D/g,'');
    const n=Number(folioText||0);
    const recipe=stickerRecipes[n]||[];
    const layer=document.createElement('div');
    layer.className='sticker-layer';
    recipe.forEach(([t,x,y,s,r,o,label])=>{
      const el=document.createElement('span');
      el.className=`sticker sticker--${t}`;
      el.style.left=`${x}%`; el.style.top=`${y}%`;
      el.style.setProperty('--sticker-scale',s);
      el.style.setProperty('--sticker-rotate',`${r}deg`);
      el.style.opacity=o;
      if(label) el.textContent=label;
      layer.appendChild(el);
    });
    page.appendChild(layer);
  });
}

function fitAllVideos(root=document){
  $$('video',root).forEach(v=>{
    const shell=v.closest('.video-shell');
    if(!shell) return;

    const apply=()=>{
      const vw=v.videoWidth || 0;
      const vh=v.videoHeight || 0;
      const sw=shell.clientWidth || 0;
      const sh=shell.clientHeight || 0;
      if(!vw || !vh || !sw || !sh) return;

      const scale=Math.min(sw/vw, sh/vh);
      const w=Math.floor(vw*scale);
      const h=Math.floor(vh*scale);

      v.style.width=`${w}px`;
      v.style.height=`${h}px`;
      v.style.maxWidth='none';
      v.style.maxHeight='none';
      v.style.objectFit='fill';
      v.style.objectPosition='center';
    };

    if(v.readyState>=1) apply();
    else v.addEventListener('loadedmetadata',apply,{once:true});
  });
}

function configureVideos(root){
  $$('video',root).forEach(v=>{
    v.muted=true; v.loop=true; v.autoplay=true; v.playsInline=true; v.controls=false;
    v.setAttribute('muted',''); v.setAttribute('loop',''); v.setAttribute('autoplay',''); v.setAttribute('playsinline','');
    v.removeAttribute('controls');
  });
}
function activateVisibleVideos(){
  fitAllVideos(book);
  $$('video',book).forEach(v=>{
    const page=v.closest('.page');
    if(!page) return;
    const visible=v.closest('#leftSlot,#rightSlot');
    if(!visible){ try{ v.pause(); }catch{}; return; }
    const p=v.play();
    if(p && typeof p.catch==='function') p.catch(()=>{});
  });
}
function fitVisibleText(){
  [leftSlot,rightSlot].forEach(slot=>{
    const page=slot.querySelector('.text-page');
    const block=page?.querySelector('.text-block');
    if(!page||!block)return;
    block.style.transform='';
    block.style.transformOrigin='left center';
    const cs=getComputedStyle(page);
    const availableH=page.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    const availableW=page.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const r=block.getBoundingClientRect();
    const scale=Math.min(1,availableH/Math.max(r.height,1),availableW/Math.max(r.width,1));
    if(scale<.995) block.style.transform=`scale(${Math.max(.62,scale*.985)})`;
  });
}
function renderSpread(i){pauseVideos();leftSlot.replaceChildren(clonePage(i*2));rightSlot.replaceChildren(clonePage(i*2+1));spread=i;seedStars(leftSlot);seedStars(rightSlot);seedDecor(leftSlot);seedDecor(rightSlot);configureVideos(leftSlot);configureVideos(rightSlot);updateChrome();requestAnimationFrame(()=>{fitVisibleText();fitAllVideos(book);activateVisibleVideos()})}
function buildPager(){for(let i=0;i<spreadCount;i++){const b=document.createElement('button');b.type='button';b.style.setProperty('--dot',pagerColors[i]||'#8fd0eb');b.setAttribute('aria-label',`Go to spread ${i+1}`);b.addEventListener('click',()=>goTo(i));pager.appendChild(b)}}
function updateChrome(){[...pager.children].forEach((b,i)=>b.classList.toggle('is-active',i===spread));prevBtn.disabled=spread===0||flipping;nextBtn.disabled=spread===spreadCount-1||flipping}
function startMusic(){
  soundOn=true;
  soundBtn.textContent='music on';
  soundBtn.setAttribute('aria-pressed','true');
  if(!bgm)return;
  bgm.volume=.24;
  const p=bgm.play();
  if(p&&typeof p.catch==='function')p.catch(()=>{});
}
function stopMusic(){
  soundOn=false;
  soundBtn.textContent='music off';
  soundBtn.setAttribute('aria-pressed','false');
  if(bgm)bgm.pause();
}
function openBook(){if(opened)return;opened=true;$('#bookCamera').style.transform='';startMusic();paperSound(.25);scene.classList.add('is-zooming');setTimeout(()=>scene.classList.add('is-open'),310);setTimeout(()=>scene.classList.add('is-cover-opening'),1000);setTimeout(()=>{scene.classList.add('is-cover-open');scene.classList.remove('is-cover-opening');updateChrome();activateVisibleVideos()},1750)}
openBtn.addEventListener('click',openBook);

function faceClone(pageIndex,sliceIndex,sliceWidth,pageWidth,reverse=false){const face=document.createElement('div');face.className='curl-face';const page=clonePage(pageIndex,true);page.classList.add('curl-face__page');page.style.width=`${pageWidth}px`;const source=reverse?(Math.round(pageWidth/sliceWidth)-1-sliceIndex):sliceIndex;page.style.left=`${-source*sliceWidth}px`;face.appendChild(page);const shade=document.createElement('div');shade.className='curl-shade';face.appendChild(shade);return face}
function buildCurl(direction,target){const pageW=book.clientWidth/2;const mobile=matchMedia('(max-width:800px)').matches;const N=Math.max(mobile?24:30,Math.min(mobile?30:42,Math.round(pageW/(mobile?8.4:11))));const sw=pageW/N,overlap=1.7;curlLayer.replaceChildren();curlLayer.style.left='50%';curlLayer.style.width=`${pageW}px`;const strips=[];const shadeBg=direction>0?'linear-gradient(90deg,rgba(255,255,255,.30),transparent 34%,rgba(0,0,0,.28))':'linear-gradient(270deg,rgba(255,255,255,.30),transparent 34%,rgba(0,0,0,.28))';for(let i=0;i<N;i++){const strip=document.createElement('div');strip.className='curl-strip';strip.style.width=`${sw+overlap}px`;let front,back;if(direction>0){front=faceClone(spread*2+1,i,sw,pageW,false);back=faceClone(target*2,i,sw,pageW,true)}else{front=faceClone(target*2+1,i,sw,pageW,false);back=faceClone(spread*2,i,sw,pageW,true)}front.classList.add('curl-face--front');back.classList.add('curl-face--back');const shades=[front.querySelector('.curl-shade'),back.querySelector('.curl-shade')];shades.forEach(s=>s.style.background=shadeBg);strip.append(front,back);curlLayer.appendChild(strip);strips.push({el:strip,shades})}castShadow.style.left=direction>0?'50%':'0';castShadow.style.background=direction>0?'linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,.06) 24%,transparent 62%)':'linear-gradient(270deg,rgba(0,0,0,.28),rgba(0,0,0,.06) 24%,transparent 62%)';return{strips,N,sw,pageW}}
function ease(t){return t*t*t*(t*(t*6-15)+10)}
function curlFrame(mesh,p,direction){const{strips,N,sw}=mesh;let x=0,z=0;const sinp=Math.sin(Math.PI*p),curl=1.02;for(let i=0;i<N;i++){const u=(i+.5)/N,edgeBias=Math.pow(1-u,.88)-Math.pow(u,1.12);const theta=direction>0?Math.PI*p+curl*sinp*edgeBias:Math.PI*(1-p)-curl*sinp*edgeBias;const deg=-theta*180/Math.PI,item=strips[i];item.el.style.transform=`translate3d(${x-.35}px,0,${z}px) rotateY(${deg}deg)`;const shadeStrength=Math.min(.42,Math.abs(Math.sin(theta))*.26+sinp*.07);item.shades[0].style.opacity=String(shadeStrength);item.shades[1].style.opacity=String(shadeStrength*.88);x+=sw*Math.cos(theta);z+=sw*Math.sin(theta)}castShadow.style.opacity=String(Math.pow(sinp,.9)*.62)}
function flip(direction,target){if(flipping||!opened||!scene.classList.contains('is-cover-open'))return;if(target<0||target>=spreadCount||target===spread)return;pauseVideos();flipping=true;updateChrome();const mesh=buildCurl(direction,target);if(direction>0)rightSlot.replaceChildren(clonePage(target*2+1));else leftSlot.replaceChildren(clonePage(target*2));seedStars(leftSlot);seedStars(rightSlot);seedDecor(leftSlot);seedDecor(rightSlot);configureVideos(leftSlot);configureVideos(rightSlot);paperSound(.52);const duration=800,start=performance.now();function tick(now){const raw=Math.min(1,(now-start)/duration),p=ease(raw);curlFrame(mesh,p,direction);if(raw<1){requestAnimationFrame(tick);return}renderSpread(target);curlLayer.replaceChildren();castShadow.style.opacity='0';flipping=false;updateChrome()}requestAnimationFrame(tick)}
function goTo(target){if(target===spread||flipping)return;flip(target>spread?1:-1,spread+(target>spread?1:-1))}
nextBtn.addEventListener('click',()=>flip(1,spread+1));prevBtn.addEventListener('click',()=>flip(-1,spread-1));
window.addEventListener('keydown',e=>{if(!opened&&['Enter',' '].includes(e.key)){e.preventDefault();openBook();return}if(e.key==='ArrowRight'){e.preventDefault();flip(1,spread+1)}if(e.key==='ArrowLeft'){e.preventDefault();flip(-1,spread-1)}});
window.addEventListener('wheel',e=>{if(!opened||wheelLock||flipping||Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY))<22)return;wheelLock=true;const dir=(e.deltaY+e.deltaX)>0?1:-1;flip(dir,spread+dir);setTimeout(()=>wheelLock=false,900)},{passive:true});
window.addEventListener('touchstart',e=>touchX=e.touches[0]?.clientX??null,{passive:true});window.addEventListener('touchend',e=>{if(touchX==null)return;const x=e.changedTouches[0]?.clientX??touchX,dx=x-touchX;touchX=null;if(Math.abs(dx)>46){const dir=dx<0?1:-1;flip(dir,spread+dir)}},{passive:true});
window.addEventListener('pointermove',e=>{if(opened)return;const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;$('#bookCamera').style.transform=`translateY(-2.5vh) scale(.34) rotateX(${7-ny*7}deg) rotateY(${nx*9}deg) rotateZ(${-7+nx*2}deg)`});window.addEventListener('pointerleave',()=>{if(!opened)$('#bookCamera').style.transform=''})
function ensureAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function paperSound(level=.45){if(!soundOn)return;const ctx=ensureAudio(),dur=.42,buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*dur),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/data.length;data[i]=(Math.random()*2-1)*Math.sin(Math.PI*t)*(1-t*.25)}const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='bandpass';filter.frequency.setValueAtTime(750,ctx.currentTime);filter.frequency.exponentialRampToValueAtTime(2400,ctx.currentTime+dur*.7);filter.Q.value=.55;gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.035*level,ctx.currentTime+.06);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);src.buffer=buffer;src.connect(filter).connect(gain).connect(ctx.destination);src.start()}
soundBtn.addEventListener('click',()=>{if(soundOn){stopMusic()}else{startMusic();paperSound(.3)}});
window.addEventListener('resize',()=>requestAnimationFrame(()=>{fitVisibleText();fitAllVideos(book);activateVisibleVideos()}));
soundBtn.textContent='music off';
buildPager();renderSpread(0);
// Preview helper for local QA only; normal visitors never see this path unless query params are supplied.
const previewParams=new URLSearchParams(location.search);
if(previewParams.has('spread')){const s=Math.max(0,Math.min(spreadCount-1,Number(previewParams.get('spread'))||0));renderSpread(s)}
if(previewParams.has('preview')){setTimeout(openBook,40)}
