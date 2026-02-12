// Interactive Valentine site

const yesBtn = document.getElementById('yesBtn'); // Button for yes response
const noBtn = document.getElementById('noBtn'); // Button for no response
const topNav = document.getElementById('topNav'); // Navigation for top section
const giftNav = document.getElementById('giftNav'); // Navigation for gift section
const primaryStage = document.getElementById('primaryStage'); // Main stage container
const stageContent = document.getElementById('stageContent'); // Content area for dynamic updates

let noCount = 0;
const maxNo = 5;

const responses = [
  "Oh my! You said yes right away — my heart is full. 💖",
  "You chose yes after one little protest — perfect! 🌸",
  "After a couple of stubborn No's, you still said yes — I adore you. 🌷",
  "You kept teasing and then said yes — what a journey! 🌟",
  "You resisted four times, then yielded — that makes it extra special. 🎁",
  "You held out until the fifth — worth every playful moment. 🥂"
];

function updateNoButtonAppearance(){
  // Gradually shrink the No button via CSS variables (smooth, GPU-friendly)
  const scale = Math.max(0.5, 1 - noCount * 0.1);
  noBtn.style.setProperty('--s', scale);
  noBtn.style.opacity = String(Math.max(0.45, 0.98 - noCount * 0.08));
  noBtn.setAttribute('aria-pressed', noCount > 0 ? 'true' : 'false');
}

function makeNoEvade(){
  // add a smooth evade behavior on hover
  noBtn.classList.add('evade-enabled');
  noBtn.addEventListener('mouseenter', evadeHandler);
}

/* Final evasive mode (activated on 5th No) */
let finalMode = false;
let finalDetection = 200; // pixels (150-250 recommended)
let finalMoving = false;
let currentX = 0, currentY = 0;
let lastPositions = [];
const chatMessages = [
  'Stay away from me',
  'Yes is right there',
  'Woof Woof',
  'Not today',
  'Try again if you dare',
  'Ano baaaa',
  'Naurr',
  'Noo moochies for you if you continue to chase me >:((',
  // user-supplied phrases (excluded a disallowed slur)
  'Isa',
  '>:(((',
  'Di ka titigil ha',
  'PWEDE BAAAA',
  'Di mo na ko mahal',
  'Grabe ka',
  'May iba kang ka-valentines no kaya ka nag n-no?',
  'Sakit mo na',
  'The worse you can click is no',
  'I thought I was your valentines🥺👉👈',
  'Yes is right there oh, click mo'
];
let activeHeads = [];

function enableFinalMode(){
  if(finalMode) return;
  finalMode = true;

  // set detection radius (choose mid-range)
  finalDetection = 200;

  // place the button as fixed at its current viewport position
  const r = noBtn.getBoundingClientRect();
  currentX = Math.round(r.left);
  currentY = Math.round(r.top);
  noBtn.style.position = 'fixed';
  noBtn.style.left = currentX + 'px';
  noBtn.style.top = currentY + 'px';
  noBtn.style.margin = '0';
  noBtn.classList.add('final-evade');

  // prevent normal click behavior — make it unclickable
  noBtn.addEventListener('click', function preventClick(e){
    if(finalMode){
      e.preventDefault();
      e.stopImmediatePropagation();
      // playful taunt
      spawnChatHeads(1);
    }
  }, true);

  // listen for cursor globally
  window.addEventListener('mousemove', finalMouseMove);
}

function finalMouseMove(e){
  if(!finalMode) return;
  // compute center of button
  const btnRect = noBtn.getBoundingClientRect();
  const btnW = btnRect.width, btnH = btnRect.height;
  const centerX = btnRect.left + btnW/2;
  const centerY = btnRect.top + btnH/2;
  const dx = centerX - e.clientX;
  const dy = centerY - e.clientY;
  const dist = Math.hypot(dx, dy);

  if(dist <= finalDetection){
    // immediate escape
    const target = computeEscapeTarget(e.clientX, e.clientY, btnW, btnH);
    moveButtonTo(target.x, target.y);
    // spawn chat heads around button
    spawnChatHeads(1 + Math.floor(Math.random()*2));
  }
}

function computeEscapeTarget(cursorX, cursorY, btnW, btnH){
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const margin = 32;

  // Prefer opposite side of cursor (maximize distance)
  const preferRight = cursorX < vw/2;
  const preferBottom = cursorY < vh/2;

  let x = preferRight ? (vw - margin - btnW) : margin;
  let y = preferBottom ? (vh - margin - btnH) : margin;

  // add controlled randomness (avoid repeating exact corners)
  const jitterX = (Math.random() * 0.3 - 0.15) * vw;
  const jitterY = (Math.random() * 0.3 - 0.15) * vh;
  x = clamp(x + jitterX, margin, vw - margin - btnW);
  y = clamp(y + jitterY, margin, vh - margin - btnH);

  // avoid recently used positions
  for(let i=0;i<6;i++){
    if(lastPositions.some(p=>Math.hypot(p.x-x,p.y-y) < 80)){
      x = clamp(x + (Math.random()*2-1)*120, margin, vw - margin - btnW);
      y = clamp(y + (Math.random()*2-1)*120, margin, vh - margin - btnH);
    }
  }

  // ensure not too close to the Yes button
  const yesRect = yesBtn.getBoundingClientRect();
  const minDist = Math.min(vw, vh) * 0.18; // keep reasonable distance
  if(distanceToRect(x + btnW/2, y + btnH/2, yesRect) < minDist){
    // push away along x axis
    if(x < vw/2) x = clamp(yesRect.right + minDist, margin, vw - margin - btnW);
    else x = clamp(yesRect.left - minDist - btnW, margin, vw - margin - btnW);
  }

  // store position
  lastPositions.push({x,y});
  if(lastPositions.length > 6) lastPositions.shift();

  return {x: Math.round(x), y: Math.round(y)};
}

function moveButtonTo(targetLeft, targetTop){
  if(finalMoving) return; // do not stack moves; they may be interrupted by next immediate call
  finalMoving = true;
  const duration = 200 + Math.round(Math.random()*80); // 150-280ms window
  const easing = 'cubic-bezier(.12,.9,.2,1)';

  // compute deltas relative to committed currentX/currentY
  const dx = targetLeft - currentX;
  const dy = targetTop - currentY;

  // apply transform animation
  noBtn.style.transition = `transform ${duration}ms ${easing}`;
  noBtn.style.transform = `translate(${dx}px, ${dy}px)`;

  // on transition end, commit new position
  const onEnd = (ev)=>{
    if(ev.propertyName && ev.propertyName.indexOf('transform') === -1) return;
    noBtn.removeEventListener('transitionend', onEnd);
    // commit
    currentX = targetLeft; currentY = targetTop;
    noBtn.style.transition = '';
    noBtn.style.transform = 'none';
    noBtn.style.left = currentX + 'px';
    noBtn.style.top = currentY + 'px';
    finalMoving = false;
  };
  noBtn.addEventListener('transitionend', onEnd);
}

function spawnChatHeads(count){
  const maxHeads = 5;
  const toSpawn = Math.min(count, maxHeads - activeHeads.length);
  for(let i=0;i<toSpawn;i++){
    const msg = chatMessages[Math.floor(Math.random()*chatMessages.length)];
    createChatHead(msg);
  }
}

function createChatHead(text){
  const head = document.createElement('div');
  head.className = 'chat-head';
  if(Math.random()>0.6) head.classList.add('alt');
  if(Math.random()>0.7) head.classList.add('small');
  head.textContent = text;
  document.body.appendChild(head);

  // position around current button center
  const btnRect = noBtn.getBoundingClientRect();
  const bx = btnRect.left + btnRect.width/2;
  const by = btnRect.top + btnRect.height/2;
  const angle = Math.random() * Math.PI * 2;
  const radius = 40 + Math.random() * 40;
  const startX = bx + Math.cos(angle)*10 - head.offsetWidth/2;
  const startY = by + Math.sin(angle)*6 - head.offsetHeight/2;
  head.style.left = `${clamp(startX, 8, window.innerWidth - 8 - head.offsetWidth)}px`;
  head.style.top = `${clamp(startY, 8, window.innerHeight - 8 - head.offsetHeight)}px`;

  // animate to float away
  requestAnimationFrame(()=>{
    const fx = bx + Math.cos(angle)*(radius + Math.random()*30) - head.offsetWidth/2;
    const fy = by + Math.sin(angle)*(radius + Math.random()*30) - head.offsetHeight/2;
    head.style.transition = `transform 1100ms ${'cubic-bezier(.22,.9,.29,1)'}, opacity 1100ms ${'cubic-bezier(.22,.9,.29,1)'}`;
    head.style.transform = `translate(${fx - parseFloat(head.style.left)}px, ${fy - parseFloat(head.style.top)}px) rotate(${(Math.random()*20-10)}deg) scale(${1 + (Math.random()*0.08)})`;
    head.style.opacity = '1';
  });

  activeHeads.push(head);
  // remove after 1.2-1.8s
  const life = 1100 + Math.random()*700;
  setTimeout(()=>{
    head.style.opacity = '0';
    head.style.transform += ' scale(0.96)';
    setTimeout(()=>{
      head.remove();
      activeHeads = activeHeads.filter(h=>h!==head);
    }, 400);
  }, life);
}

function clamp(v,a,b){ return Math.min(Math.max(v,a),b) }
function distanceToRect(x,y,rect){
  const rx = Math.max(rect.left, Math.min(x, rect.right));
  const ry = Math.max(rect.top, Math.min(y, rect.bottom));
  return Math.hypot(rx - x, ry - y);
}

function evadeHandler(e){
  // Smooth evasion: move away from cursor along a vector, interpolating via RAF
  cancelNoEvadeAnim();
  const parent = noBtn.parentElement;
  const rect = parent.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // center positions
  const btnCenter = { x: btnRect.left + btnRect.width / 2, y: btnRect.top + btnRect.height / 2 };
  const cursor = { x: e.clientX, y: e.clientY };

  // vector from cursor to button center
  let dx = btnCenter.x - cursor.x;
  let dy = btnCenter.y - cursor.y;
  const dist = Math.hypot(dx, dy) || 1;
  dx /= dist; dy /= dist; // normalize

  // desired move distance (larger when cursor is closer)
  const push = Math.min(220, Math.max(80, 220 - dist + 30));

  // target absolute position for button top-left inside parent
  const currentLeft = btnRect.left - rect.left;
  const currentTop = btnRect.top - rect.top;
  const targetAbsX = Math.min(Math.max(8, currentLeft + dx * push), Math.max(8, rect.width - btnRect.width - 8));
  const targetAbsY = Math.min(Math.max(4, currentTop + dy * push), Math.max(4, rect.height - btnRect.height - 4));

  // compute relative translation needed from current position
  const tx = Math.round(targetAbsX - currentLeft);
  const ty = Math.round(targetAbsY - currentTop);

  // animate CSS variables smoothly using requestAnimationFrame
  const start = { tx: parsePx(getComputedStyle(noBtn).getPropertyValue('--tx')) || 0, ty: parsePx(getComputedStyle(noBtn).getPropertyValue('--ty')) || 0 };
  const end = { tx, ty };
  const duration = 420; // ms
  const startTime = performance.now();

  function step(now){
    const t = Math.min(1, (now - startTime) / duration);
    const eased = easeOutCubic(t);
    const currentTx = Math.round(lerp(start.tx, end.tx, eased));
    const currentTy = Math.round(lerp(start.ty, end.ty, eased));
    noBtn.style.setProperty('--tx', `${currentTx}px`);
    noBtn.style.setProperty('--ty', `${currentTy}px`);
    if(t < 1){
      noEvadeAnim = requestAnimationFrame(step);
    }
  }
  noEvadeAnim = requestAnimationFrame(step);
}

let noEvadeAnim = null;
function cancelNoEvadeAnim(){ if(noEvadeAnim) { cancelAnimationFrame(noEvadeAnim); noEvadeAnim = null; } }
function parsePx(val){ if(!val) return 0; return Number(val.trim().replace('px','')) || 0 }
function lerp(a,b,t){ return a + (b-a)*t }
function easeOutCubic(t){ return 1 - Math.pow(1-t,3) }

noBtn.addEventListener('click', (e) =>{
  noCount = Math.min(maxNo, noCount + 1);
  updateNoButtonAppearance();

  if(noCount >= maxNo){
    // On reaching final prompt, enable full evasive final mode
    enableFinalMode();
  }

  // Re-display the same question (visual feedback)
  bounceQuestion();
});

function bounceQuestion(){
  const q = document.querySelector('.question');
  q.animate([
    { transform: 'translateY(0)', opacity:1 },
    { transform: 'translateY(-8px)', opacity:0.98 },
    { transform: 'translateY(0)', opacity:1 }
  ],{ duration: 420, easing: 'cubic-bezier(.22,.9,.29,1)'});
}


yesBtn.addEventListener('click', async () =>{
  // Replace the stage content with the response view (in-place, no layout shifts)
  const content = stageContent;

  // fade old content out
  content.classList.add('fade-down-exit');
  requestAnimationFrame(()=> content.classList.add('fade-down-exit-to'));
  await new Promise(resolve => {
    const onEnd = (e) => {
      if(e.propertyName && (e.propertyName.includes('opacity') || e.propertyName.includes('transform'))){
        content.removeEventListener('transitionend', onEnd);
        resolve();
      }
    };
    content.addEventListener('transitionend', onEnd);
  });

  // inject response content (still centered inside the same container)
  content.innerHTML = `
    <div class="gif-placeholder large" id="centerGif" aria-hidden="true">
      <svg viewBox="0 0 100 100" class="heart-svg" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 77s-27-16-34-25c-12-16 4-30 17-22 6 4 10 11 17 11s11-7 17-11c13-8 29 6 17 22-7 9-34 25-34 25z" fill="#ff9ac0"/>
      </svg>
    </div>
    <div class="response-text" id="responseText"></div>
  `;

  // remove exit classes and animate new content in
  content.classList.remove('fade-down-exit', 'fade-down-exit-to');
  content.classList.add('fade-up-enter');
  requestAnimationFrame(()=> content.classList.add('fade-up-enter-to'));

  showResponse();
});

function showResponse(){
  // pick response depending on noCount (0..5)
  const idx = Math.min(noCount, responses.length - 1);
  const respEl = document.getElementById('responseText');
  if(respEl) respEl.textContent = responses[idx];

  // reveal nav
  setTimeout(()=>{
    topNav.classList.add('nav--visible');
    topNav.setAttribute('aria-hidden','false');
  }, 320);

  // Fade the response text in with small lift (handled in showResponse)
}

// Gift interactions (handled in the following listener)
giftNav.addEventListener('click', async () =>{
  // Replace whatever is in the stage with the heart gift (in-place)
  const content = stageContent;
  const centerGif = document.getElementById('centerGif');
  const respEl = document.getElementById('responseText');

  // fade old content out
  if(centerGif) centerGif.style.transition = 'opacity var(--mid) var(--ease-soft), transform var(--mid) var(--ease-soft)';
  if(centerGif) centerGif.style.opacity = '0';
  if(centerGif) centerGif.style.transform = 'translateY(-8px) scale(0.98)';
  if(respEl) { respEl.style.transition = 'opacity var(--mid) var(--ease-soft), transform var(--mid) var(--ease-soft)'; respEl.style.opacity = '0'; respEl.style.transform = 'translateY(-6px)'; }

  await new Promise(r => setTimeout(r, 420));

  // render heart into the same stage content (replace)
  renderHeartGift();
});

function renderHeartGift(){
  stageContent.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'heart-box-wrapper';
  wrapper.innerHTML = `
    <div class="heart-box" id="heartBox" role="button" aria-label="Open gift">
      <div class="heart-shape">
        <div class="heart-bottom"></div>
      </div>
    </div>
  `;
  stageContent.appendChild(wrapper);

  // entrance micro-animation centered
  const heart = wrapper.querySelector('.heart-box');
  heart.style.opacity = '0';
  heart.style.transform = 'translateY(8px) scale(0.98)';
  requestAnimationFrame(()=>{
    heart.style.transition = 'opacity var(--mid) var(--ease-soft), transform var(--mid) var(--ease-soft)';
    heart.style.opacity = '1';
    heart.style.transform = 'translateY(0) scale(1)';
  });

  heart.addEventListener('click', () => {
    // play refined open animation
    heart.classList.add('opening');
    setTimeout(()=> heart.classList.add('opened'), 420);
    // after animation, reveal book in same spot
    setTimeout(()=>{
      showBook();
    }, 520);
  });
}

// legacy unwrap not used; kept for compatibility
function unwrapGift(){
  const b = document.getElementById('giftBox');
  if(b) b.classList.add('gift-unwrapped');
  setTimeout(()=> showBook(), 700);
}

function showBook(){
  // Replace heart with a closed book in the same central spot
  stageContent.innerHTML = '';
  const book = document.createElement('div');
  book.className = 'book closed';
  const inner = document.createElement('div');
  inner.className = 'book-inner';
  const spine = document.createElement('div'); spine.className = 'book-spine';
  const coverFront = document.createElement('div'); coverFront.className = 'book-cover cover-front cover-front-closed';
  const coverBack = document.createElement('div'); coverBack.className = 'book-cover back cover-back';
  const pageStack = document.createElement('div'); pageStack.className = 'page-stack pages';
  // create left and right panes (left shows flipped pages, right shows current)
  const leftPane = document.createElement('div'); leftPane.className = 'pane left';
  const rightPane = document.createElement('div'); rightPane.className = 'pane right';
  pageStack.appendChild(leftPane);
  pageStack.appendChild(rightPane);
  inner.appendChild(spine);
  inner.appendChild(coverBack);
  inner.appendChild(pageStack);
  inner.appendChild(coverFront);
  // overlay container for stacked left pages that must render above covers
  const leftStack = document.createElement('div'); leftStack.className = 'left-stack';
  inner.appendChild(leftStack);
  book.appendChild(inner);

  // Example pages and layered stack — support front/back content per page
  const pageContents = [
    { front: '<h2>For You</h2><p>Roses are pink, dreams are sweet — I like you a whole lot.</p>', back: '<div style="text-align:center"><div style="width:140px;height:100px;background:#f3e7e9;border-radius:8px;display:inline-block"></div><p style="margin-top:8px;font-size:14px;color:#6b444f">Photo placeholder</p></div>' },
    { front: '<h2>Memory</h2><p>Remember our laughs? Here is to many more.</p>', back: '<div style="text-align:center"><div style="width:140px;height:100px;background:#f3e7e9;border-radius:8px;display:inline-block"></div><p style="margin-top:8px;font-size:14px;color:#6b444f">Photo placeholder</p></div>' },
    { front: '<h2>Promise</h2><p>Small adventures, deep affection — together forever?</p>', back: '<div style="text-align:center"><div style="width:140px;height:100px;background:#f3e7e9;border-radius:8px;display:inline-block"></div><p style="margin-top:8px;font-size:14px;color:#6b444f">Photo placeholder</p></div>' }
  ];

  // create page elements but only insert the first onto the right pane; others are prepared
  const pages = pageContents.map((item,i)=>{
    const p = document.createElement('div');
    p.className = 'page edge-shimmer';
    p.innerHTML = `<div class="page-content">${item.front}</div><div class="page-back" aria-hidden="true">${item.back}</div>`;
    p.dataset.index = String(i);
    p.style.zIndex = String(80 - i);
    if(i !== 0) p.classList.add('off');
    return p;
  });

  // left placeholder (cover inner / blank) so left stack always has something
  const leftPlaceholder = document.createElement('div');
  leftPlaceholder.className = 'page left-placeholder static-left';
  leftPlaceholder.innerHTML = `<div class="page-content"><p style="opacity:0.38;color:#6b444f">&nbsp;</p></div>`;
  leftStack.appendChild(leftPlaceholder);

  // show first page on right pane
  if(pages[0]){
    pages[0].classList.remove('off');
    pages[0].classList.add('static-right');
    rightPane.appendChild(pages[0]);
  }



  // append book and reserve stage space so layout doesn't shift
  stageContent.appendChild(book);
  // reserve space so book doesn't push other layout when opening
  stageContent.classList.add('book-present');

  // create invisible hit areas for left/right interactions (no visible buttons)
  const hitLeft = document.createElement('div'); hitLeft.className = 'hit-area hit-left';
  const hitRight = document.createElement('div'); hitRight.className = 'hit-area hit-right';
  book.appendChild(hitLeft); book.appendChild(hitRight);

  // clear reserved minHeight so layout can settle
  // clear any reserved sizing (stage container itself stays fixed)
  stageContent.style.minHeight = '';

  // subtle book entrance
  requestAnimationFrame(()=>{
    book.classList.add('book-enter');
    // ensure the book is closed initially
    book.classList.add('closed');
    book.style.opacity = '1';
  });

  // open when the front cover is clicked (keep book centered)
  const front = book.querySelector('.cover-front');
  function openCoverOnce(){
    front.removeEventListener('click', openCoverOnce);
    book.classList.remove('closed');
    book.classList.add('open');
    front.classList.remove('cover-front-closed');
    front.classList.add('cover-front-open');

    // slight page bend for tactile feel
    setTimeout(()=>{
      const first = pages[0];
      if(first){
        first.classList.add('curl');
        first.style.transform = 'rotateY(-8deg) translateZ(6px)';
        setTimeout(()=>{ first.style.transform = 'rotateY(0deg) translateZ(0px)'; first.classList.remove('curl'); }, 420);
      }
    }, 220);
  }
  front.addEventListener('click', openCoverOnce);

  // page turn logic
  let current = 0;
  let isAnimating = false;
  const indicator = document.createElement('div');
  indicator.className = 'sr-only';
  indicator.id = 'pageIndicator';
  indicator.textContent = `1 / ${pages.length}`;
  book.appendChild(indicator);

  function turnTo(nextIndex){
    if(nextIndex === current) return;
    if(isAnimating) return;
    isAnimating = true;
    
    // temporarily disable hit areas
    if(hitLeft) hitLeft.style.pointerEvents = 'none';
    if(hitRight) hitRight.style.pointerEvents = 'none';
    
    const from = pages[current];
    const to = pages[nextIndex];
    const forward = nextIndex > current;

    if(forward){
      // prepare next page on right pane
      if(to){
        while(rightPane.firstChild) rightPane.removeChild(rightPane.firstChild);
        to.classList.remove('off');
        to.classList.add('static-right');
        rightPane.appendChild(to);
      }

      // slide current page left and transition to back
      from.classList.add('sliding', 'slide-forward');
      
      const onSlideEnd = (e)=>{
        if(e && e.propertyName && e.propertyName.indexOf('transform') === -1) return;
        from.removeEventListener('transitionend', onSlideEnd);
        
        // swap content to back
        const frontContent = from.querySelector('.page-content');
        const backContent = from.querySelector('.page-back');
        if(frontContent) frontContent.style.display = 'none';
        if(backContent) backContent.style.display = 'block';
        
        // move to left stack
        from.classList.remove('slide-forward', 'sliding', 'static-right');
        from.classList.add('static-left');
        from.style.transform = '';
        leftStack.appendChild(from);
        
        isAnimating = false;
        // re-enable hit areas
        if(hitLeft) hitLeft.style.pointerEvents = '';
        if(hitRight) hitRight.style.pointerEvents = '';
      };
      from.addEventListener('transitionend', onSlideEnd);
    } else {
      // backward: slide last left page back to right
      const lastLeft = leftStack.lastElementChild;
      if(lastLeft && !lastLeft.classList.contains('left-placeholder')){
        lastLeft.classList.add('sliding', 'slide-back');
        
        const onSlideBackEnd = (e)=>{
          if(e && e.propertyName && e.propertyName.indexOf('transform') === -1) return;
          lastLeft.removeEventListener('transitionend', onSlideBackEnd);
          
          // swap content to front
          const frontContent = lastLeft.querySelector('.page-content');
          const backContent = lastLeft.querySelector('.page-back');
          if(backContent) backContent.style.display = 'none';
          if(frontContent) frontContent.style.display = '';
          
          // clear right and move to right pane
          while(rightPane.firstChild) rightPane.removeChild(rightPane.firstChild);
          lastLeft.classList.remove('slide-back', 'sliding', 'static-left');
          lastLeft.classList.add('static-right');
          lastLeft.style.transform = '';
          rightPane.appendChild(lastLeft);
          
          isAnimating = false;
          // re-enable hit areas
          if(hitLeft) hitLeft.style.pointerEvents = '';
          if(hitRight) hitRight.style.pointerEvents = '';
        };
        lastLeft.addEventListener('transitionend', onSlideBackEnd);
      }
    }

    current = nextIndex;
    indicator.textContent = `${current+1} / ${pages.length}`;
  }

  // hit areas attach to turn events (no wrap-around)
  hitRight.addEventListener('click', (e)=>{ e.stopPropagation(); if(current < pages.length - 1) { const next = current + 1; turnTo(next); } });
  hitLeft.addEventListener('click', (e)=>{ e.stopPropagation(); if(current > 0) { const prev = current - 1; turnTo(prev); } });

  // touch support: swipe left/right to turn pages
  let touchStartX = null;
  pageStack.addEventListener('touchstart', (ev)=>{ touchStartX = ev.touches[0].clientX; }, {passive:true});
  pageStack.addEventListener('touchend', (ev)=>{
    if(touchStartX === null) return;
    const dx = (ev.changedTouches[0].clientX - touchStartX);
    if(Math.abs(dx) > 40){
      if(dx < 0) { if(current < pages.length - 1) { const next = current + 1; turnTo(next); } }
      else { if(current > 0) { const next = current - 1; turnTo(next); } }
    }
    touchStartX = null;
  });

  // ensure stage reserves space matching book to avoid layout jumps
  requestAnimationFrame(()=>{
    const bh = book.getBoundingClientRect().height;
    stageContent.style.minHeight = Math.max(bh * 0.9, stageContent.clientHeight) + 'px';
  });
}

// Cancel or reset evade animations on resize or when leaving landing
window.addEventListener('resize', ()=>{
  cancelNoEvadeAnim();
  noBtn.style.setProperty('--tx', '0px');
  noBtn.style.setProperty('--ty', '0px');
});

// Ensure no-button evasion is cleared when stage content transitions
primaryStage.addEventListener('transitionend', ()=>{
  cancelNoEvadeAnim();
  noBtn.style.setProperty('--tx', '0px');
  noBtn.style.setProperty('--ty', '0px');
});

// Small accessibility: keyboard support for book when open
document.addEventListener('keydown', (e)=>{
  const b = document.querySelector('.book.open');
  if(!b) return;
  if(e.key === 'ArrowRight') b.querySelector('.hit-right')?.click();
  if(e.key === 'ArrowLeft') b.querySelector('.hit-left')?.click();
});

// Initialize appearance values
updateNoButtonAppearance();
