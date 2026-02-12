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
  "YAYYYYYY",
  "No? The audacity! HMP MWA",
  "You said no twice, but it's okay I still love you.",
  "THREE TIMES? >:(( you said yes parin kaya :DD",
  "Four times... alam mo okay lang, nag yes ka parin fucking faggot of mine for life",
  "Akala mo makakapag-no ka parin no? Sadly, you can't. Because you mine you thot MWA >:P"
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
  // Replace heart with flip card interface in the same central spot
  stageContent.innerHTML = '';

  // Add class to stage to align to top
  document.querySelector('.stage').classList.add('gift-open');

  // Example pages: support front/back content per page
  const pageContents = [
    {
      front: '<h2>Lovesick</h2>',
      back: '<p>It remembers. It still yearns.</p>'
    },
    {
      front: '<h2>For You</h2>',
      back: '<p>— Bebii</p>'
    },
    {
      front: '<h2>For the one who arrived lovingly —</h2>',
      back: '<p>Showing me the poet is still alive.</p>'
    },
    {
      front: '<h2>Chapter I: Beginnings</h2>',
      back: '<p>In darkest days, in loneliest nights<br>My heart treads an inspired plight.<br>Weaving words as they were paths—<br>Eenie meenie minie moe, to enticing sights.<br><br>A step forward to the mist<br>Curiosity upon thy fist.<br>A lending hand to a former mate<br>Ever so slightly ajar to what he was about to face.<br><br>Maybe it was fate<br>Though it does not feel as such.<br>A lesson to behold<br>From the stories he\'s been told.<br><br>Another side<br>A new identity.</p>'
    },
    {
      front: '<h2>Chapter 2: The Great Witness</h2>',
      back: '<p>In here he saw— the queen of the night<br>"Why oh why", crying to the light.<br>Rambled and mumbled<br>The feelings he fought,<br>Waving the white flag he had always brought.<br><br>Cornered and afraid,<br>Valentine bliss, continues to break.<br><br>Seeking shelter for what became,<br>Reduced to cinders, embers maimed<br>Blaming the skies for what he dared to brave<br>Courage behind lies. Damn, he strayed.<br><br>The emotion that never belonged to him<br>A concept unbeknownst to him<br>Ill-fit for a boy who never knew to love<br>Ill-fitting as it may—<br><br>he now sought.</p>'
    },
    {
      front: '<h2>Chapter 3: He came. He saw. He fell.</h2>',
      back: '<p>Felled to claim the superseding desire,<br>Seeking shadows leading to the fire.<br>Coital splices spanning a millennium,<br>An empty husk of the burning emporium.<br><br>T\'was the Joker.<br>The greatest pretender.<br>A volunteering naïveté to his grandest schemes,<br>Falling deeper in the vast seas.<br><br>They fancied themselves students of anatomy.<br>Faithful to the discipline —<br>Tracing chambers, naming arteries,<br>Yet never once hearing it break.<br><br>The first cracks of an impending streak.</p>'
    },
    {
      front: '<h2>Chapter 4: And So, It Began.</h2>',
      back: '<p>Morning breeze, warming tweets.<br>A bird brought him something sweet.<br>Another facade to an incomplete hangar,<br>Hiding scars to falling letters.<br><br>Pray tell, what does this mean?<br>Far-fetched similarities to the former stream.<br>An empty rack amidst the flood,<br>Vanishing coats he gave to the fool.<br><br>The northern star was a mere fluke,<br>Path led astray to an unknown sphere.<br>Wounding up in places he had always feared,<br><br>Back and cornered once more he is,<br>For the pain of unknowingly hurting scored another tear.</p>'
    },
    {
      front: '<h2>Chapter 5: Frailty</h2>',
      back: '<p>Gone in shapes, forms in phrases.<br>Riddled in edges, a circle he traipsed.<br>Round and round he goes,<br>Unending echoes of a door that closed.<br><br>Fraught with desperation,<br>Polaroid spaces and weird incantations.<br>Relentless knocks to an already closed door.<br>Chasing echoes of a finished lore.<br><br>Fragile and Afraid.<br>Unsheathing a blade.<br>A horrified stare to woven paths,<br>Dangerous fares with darkness intact.<br><br>The heart remembers,<br>The mind does not.<br>For the cracks of identity,<br>Covers him plenty.<br><br>Outward no more,<br>Slumbering forevermore.</p>'
    },
    {
      front: '<h2>Chapter 6: The War Within</h2>',
      back: '<p>Withered trees, splintered glees.<br>Random strangers, uproar bliss<br>A sped-up timeline, the echoes of time—<br>Craving lifelines, across lovetimes.<br><br>It is the crippling lapse of a boy in pain,<br>Masked in scars in obvious ways.<br>Sought solace in lights galore,<br>Partied non-stop \'til he is no more.<br><br>And there he glimpsed the queen of the night.<br>"Oh, Luna" he cried, "Hear my plight".<br>Plenty there are under these lights<br>None comes close to his ideal sight<br><br>Heavy is the crown, so thought he was.<br>Light as a feather, the feelings they passed.<br><br>"I bear the weight" he did as much.<br>And there it began— the war of none.<br><br>Chasing traces…<br><br>In clubs that pleases.</p>'
    },
    {
      front: '<h2>Chapter 7: The Calm of Becoming</h2>',
      back: '<p>Days to weeks, weeks to months.<br>There he lies an intoxicated runt.<br>Dreaming though as he is awake,<br>Endured again for another stake.<br><br>Lucid, nay a daydreaming guy,<br>To beguile his wake and troubled lie.<br>In search for more, risk with a die<br>Another roll, another kiss to strive.<br><br>Such is the way of semantics,<br>In between the lines lies his antics.<br><br>Infatuated with what once was,<br>Realized the danger of the broken glass.<br>No more does he linger staring at the mirror,<br>A reflection filled with sordid pictures.<br><br>It is, what\'s called, a beautiful lie.<br>Vowed never again to go with the ride.<br><br>And yet, wait. There\'s more to be told.<br>Further tales to explore,<br>Deeper lies to implore.</p>'
    },
    {
      front: '<h2>Chapter 8: Liberation</h2>',
      back: '<p>"Every breath feels like the rarest air,<br>When you\'re not sure they wanted to be there"<br><br>A quiet reflection in the loudest chaos,<br>Candor carried through the workday\'s labor.<br>He pressed toward life\'s small valor,<br>Holding meaning as his own savior.<br><br>Redact the abstract —<br>Keep the act.<br>White lies thinned beneath the blue skies,<br>Truth settling where silence lies.<br><br>He did. Face to face.<br>Heartening glares, steady and chaste.<br>He needed not knock —<br>He simply waited.<br>Closure once chased<br>Now stood quietly at his gaze.<br><br>And there, he understood.<br>He felt — and felt for good.<br><br>No longer chasing traces,<br>He rests in safer spaces,<br>Held by a quiet truth that saves.</p>'
    },
    {
      front: '<h2>Chapter 9: New Beginnings</h2>',
      back: '<p>A chilling breeze surges through the air,<br>Feeling much warmer in each fare.<br>The last wafts of december,<br>Onwards through the month of embers.<br><br>Then again, it must still be chilly,<br>Because he is still alone— "willingly".<br>Though he does not mind the cold,<br>For he finds comfort in the old chaos he sold.<br><br>Soft warmths as if it were hugs,<br>Thawing what\'s left of this numb little bug.<br>Traumatic storms of this foolish jester,<br>Now weathered with steadier tether.<br><br>A step new, fresh sceneries in view.<br>Marching onwards in a different hue.<br>Old memories clinging as far,<br>Kept as lessons as they are.</p>'
    },
    {
      front: '<h2>Chapter 10: Reignition</h2>',
      back: '<p>A chill drifts through the northern air,<br>Where misted streets braid towers fair.<br>He moves along the pine-clad ways,<br>A heart long gray in winter\'s haze.<br><br>Letters arrive like lanterns bright,<br>Across the distance, into night.<br>He feels the warmth they softly bring,<br>A tiny spark, a quiet spring.<br><br>Through frosted eaves and quiet lanes,<br>He senses comfort in the pains.<br>A month of cautious, tender care,<br>Moments small, yet wholly there.<br><br>Patience bridges time and space,<br>He holds it close, he keeps the pace.<br>In distant Baguio, mist and pine,<br>He tastes a joy that feels divine.<br><br>The slumbering heart lifts, starts to see,<br>That love can bloom, though far it be.<br>Not with fury, nor storm, nor fight,<br>But gentle dawns that fill his night.</p>'
    },
    {
      front: '<h2>Chapter 11: What the Light Casts</h2>',
      back: '<p>He walks in warmth of fading sun,<br>A path once shadowed, now begun.<br>The world outside both bright and dim,<br>Yet gentle light falls soft on him.<br><br>Fires kindle in steady hands,<br>Moments treasured, no demands.<br>Each glance, each laugh, each quiet care,<br>Builds a life they slowly share.<br><br>Yet shadows linger in the frame,<br>Whispers of a past untamed.<br>A voice that calls from distant shores,<br>Echoing lessons, oldened scores.<br><br>He feels the weight, yet breathes it light,<br>For what is dark will meet the bright.<br>Hands entwined beneath a sheltered sky,<br>Soft as the clouds that wander by.<br><br>And in this glow, he comes to see,<br>How hearts can roam and still be free.<br>The light reveals what shadows cast,<br>Yet even there, he\'s free at last.</p>'
    },
    {
      front: '<h2>Chapter 12: Halloween, Unironically</h2>',
      back: '<p>Festivity lingered in horror\'s domain,<br>College souls dressed wicked and vain.<br>I went unprepared — a spontaneous whim,<br>As hereditary teen, Peter Graham within.<br><br>Makeup scattered across the counter,<br>Friends in costumes — each a haunter.<br>Then a familiar chime from a yellow app…<br>Who was the man behind that tap?<br><br>Intrigued, he was.<br>In love — he was not.<br><br>Through the night as we tricked for delight,<br>My gaze found warmth in spectral light.<br>A skeleton suit — Phoebe Bridgers inspired,<br>On an Asian boy quietly admired.<br><br>Wild drinks poured in España\'s glow,<br>Bandanas turned heads to and fro.<br>Hot as they were, bold in their pose —<br>None came close<br><br>To what his heart, in briefness, chose.</p>'
    },
    {
      front: '<h2>Chapter 13: A Final Chance I Took</h2>',
      back: '<p>That day, in that place,<br>We met in a seemingly familiar space.<br>Coffee steaming, laptops aglow,<br>A writer and a poet, letting words flow.<br><br>It was not love at first sight,<br>But something warmer, something right.<br>We were two peas in a shared pod,<br>Laughing, talking, as if blessed by a god.<br><br>Sunlight danced through taft\'s plains.<br>Highlighting cheeks, hair in soft refrain.<br>Every gesture, a quiet art,<br>Every laugh a gentle tug at the heart.<br><br>Somewhere inside me, I quietly felt,<br>The sheer bliss of ignorance softly dealt.<br>Questioning the world for what might be brief,<br>Better that than drown in regrets and grief.<br><br>I traced your words on the coffee cup,<br>Small movements that made my heartbeat erupt.<br>Time slowed, yet the moment felt vast,<br>A bridge from the past into something that lasts.</p>'
    },
    {
      front: '<h2>Chapter 14: Beneath the Stars of a Sunken Garden</h2>',
      back: '<p>A Porygon-Z perched lightly on my pinky,<br>We sat together atop the grassy hills, unthinking.<br>Your eyes sparkled like stars beneath the evening,<br>Your laughter rolling through the air, a gentle weaving.<br><br>The sun had melted into the horizon\'s seam,<br>Casting amber and rose over our shared dream.<br>Mango trees swayed in the evening breeze,<br>Their leaves whispering secrets through the UPD seas.<br><br>We wandered through the sunken gardens, quiet and wide,<br>Tracing the steps where shadows and sunlight collide.<br>Marble benches, mossy stones, the scent of damp earth,<br>Every corner a quiet testament to laughter and mirth.<br><br>Your smile stretched wider than the river\'s arc,<br>Illuminating corners long left dark.<br>We watched the sky bleed into purple and gold,<br>A soft eternity in a world that felt ours to hold.<br><br>Small touches, fingers brushing, a gentle nudge,<br>The campus lights flickering, a dim amber fudge.<br>Every quiet glance, a story untold,<br>Every laugh, a treasure more precious than gold.<br><br>So this is what a Roman Empire feels like,<br>Not of conquest, but of warmth, soft and bright.<br>A kingdom built in laughter and gaze,<br>A reign of small moments, of golden days.</p>'
    },
    {
      front: '<h2>Chapter 15: Taste of Paradise</h2>',
      back: '<p>That night of a thousand fireflies,<br>Your shining gaze — a beautiful guise.<br>Necessary — oh, wholly necessary,<br>The quiet requisites of a night I carry.<br><br>An empty room, the world elsewhere,<br>Just you and I, and borrowed air.<br>A single bed where timid hearts fell,<br>Into a story neither could yet tell.<br><br>Mac and cheese drifting warm through the air,<br>Soft little comforts waiting there.<br>My first dinner with the one I yearned,<br>A fragile page at last being turned.<br><br>Sparks unraveled where our bodies lay,<br>Raw and open in their own strange way.<br>Cold was the night — yet wonderful still,<br>A trembling warmth no silence could kill.<br><br>The simple touch of your steady frame,<br>Your heartbeat calling mine by name.<br>Each quiet thrum seemed to decree<br>Permission for my own to be free.<br><br>Harmony traveled across the walls,<br>As if our breaths composed its calls.<br>We hurled our dreams into the night —<br>Not knowing if they\'d land just right.<br><br>Let them fall — if fall they must,<br>For beside me slept the dream I trust.</p>'
    },
    {
      front: '<h2>Chapter 16: Unexpectedly Anticlimactic</h2>',
      back: '<p>A day I remember like it was yesterday,<br>A simple time, of a near and brief perfect day.<br><br>In MindZone’s hum, amidst thesis and pen,<br>We walked the hallways, just quietly then.<br><br>I asked, “Do you want this?” he said, “Yes, I do,”<br>“So we’re partners now?” “Yes,” came true.<br><br>No grand display, no staged delight,<br>Just two hearts folding in the softest light.<br><br>Unexpectedly anticlimactic, yet perfectly ours,<br>A beginning whispered, no need for towers.</p>'
    },
    {
      front: '<h2>Chapter 20: Whispers of Valentine</h2>',
      back: '<p>Our first Valentine arrived without spectacle,<br> no orchestras, no rehearsed miracles —<br> just you and I learning how love eats.<br>Smoke curled upward from the samgyupsal grill,<br> and time slowed between the turning of meat.<br> You discovered the tofu —<br> held it like a fragile revelation,<br> eyes bright over something so simple.<br><br>We cooked too much, as if hunger could measure devotion,<br> and forced laughter between bites,<br> determined not to be fined for loving excessively.<br> Bloated, breathless, ridiculous —<br> yet I swear my heart made room for more of you.<br><br>Later, at Odd Café,<br> we spoke in the fluent silence only lovers understand.<br> The skyline hid behind Salcedo’s towering ribs,<br> but even obstructed, the view felt endless —<br> because you were there.<br><br>That night whispered nothing grand,<br> yet everything within me answered:<br><br>If this is ordinary love,<br> let it be mine forever.</p>'
    },
    {
      front: '<h2>Chapter 21: Best of Luck, Indeed</h2>',
      back: '<p>You brought me to a place called Best of Luck,<br> and without knowing it,<br> rewrote the fortune I thought was mine.<br><br>Salted egg —<br> golden, decadent, unapologetic —<br> a flavor that did not ask permission to change me.<br> Each bite unfolded like a secret corridor,<br> leading somewhere softer, somewhere certain.<br><br>Across the table sat the man<br> who made unfamiliar worlds feel inhabitable.<br><br>I once believed myself born under reluctant stars,<br> a constellation tilted toward solitude.<br> But that night corrected the sky.<br><br>Because luck, I learned,<br> is not a number nor a prophecy —<br> it is the quiet miracle<br> of being chosen<br> while you are busy choosing back.<br><br>And there you were.<br>My Best of Luck, indeed.</p>'
    },
    {
      front: '<h2>Chapter 22: What the City Offers</h2>',
      back: '<p>BGC had always been my refuge —<br> a city I fled to when the world grew teeth.<br> Its streets knew my solitude,<br> its lights rehearsed my healing.<br><br>But cities transform<br> when witnessed beside the right soul.<br><br>Nothing changed —<br> the same glass towers,<br> the same patient avenues —<br> yet everything deepened.<br><br>Poetry walked differently when your hand found mine.<br> Silence no longer echoed; it rested.<br> Even the air seemed gentler,<br> as if the city itself approved.<br><br>What was once an escape<br> became an arrival.<br><br>You did not replace my sanctuary —<br> you illuminated it.<br><br>And suddenly,<br> the place I ran to<br> became the place I wished to stay.</p>'
    },
    {
      front: '<h2>Chapter 23: Splendor Rain</h2>',
      back: '<p>We meant only to visit Sunken Garden,<br> to stroll through memory without disturbance —<br> but the heavens had other compositions prepared.<br><br>Rain descended with operatic force,<br> thunder stitching the sky open.<br>Yet joy — reckless, radiant joy —<br> erupted between us.<br><br>We laughed at the absurdity,<br> ran without urgency,<br> watched the earth darken into perfume.<br><br>You stood there —<br> umbrella trembling under silver assault —<br> beautiful in that unguarded way<br> that makes the world briefly forget its chaos.<br><br>Tell me, what is rain<br> if not permission to be young again?<br><br>Dinner at Yabu followed —<br> two Chinese-born hearts<br> finding home in Japanese warmth,<br> proof that love ignores borders<br> the way rivers ignore maps.<br><br>Storm-soaked and glowing,<br> I realized:<br><br>Even tempests become splendor<br> when survived beside you.</p>'
    },
    {
      front: '<h2>Chapter 24: Our Pride</h2>',
      back: '<p>Of all our days,<br> this one refuses to fade.<br><br>Our first Pride —<br> not as fragments of ourselves,<br> but as a declaration walking upright.<br><br>Crowds roared in colors language cannot hold.<br> And there you were beside me<br> when I chose courage over quiet —<br> even in the sterile stillness of a clinic room.<br><br>You steadied me without spectacle,<br> held space for fears I pretended not to have.<br> When the results returned — negative, victorious —<br> relief tasted almost holy.<br><br>I pinched your cheeks to dissolve your worry,<br> laughter dissolving the last of my dread.<br><br>We captured a photograph —<br> ink against forgetting —<br> a relic of the day we stood unhidden.<br><br>Yes, my friend followed somewhere in our orbit —<br>less an interruption,<br>more a gentle witness<br>to the day we learned how visible love can be.<br><br>That day I learned pride is not noise —<br> it is the quiet refusal<br> to live unlived.<br><br>And with you,<br> I have never felt more real.</p>'
    },
    {
      front: '<h2>Chapter 25: Part of Me</h2>',
      back: '<p>Family is a threshold few are invited to cross.<br> You did not step —<br> you were welcomed.<br><br>What began as a surprise birthday for my father<br> became something far more irreversible:<br> your gentle initiation into the Santos constellation.<br><br>Jollibee laughter filled the air,<br> children shrieking, elders reminiscing —<br> life in its loud, affectionate excess.<br><br>And there you were,<br> not distant, not ornamental —<br> but folding seamlessly into the fabric.<br><br>I watched conversations find you,<br> watched my world widen to accommodate your name.<br><br>In that ordinary celebration,<br> something sacred occurred:<br><br>You were no longer merely the one I loved —<br> you became part of where I come from.<br><br>Part of my history.<br> Part of my becoming.<br> Part of me.</p>'
    },
    {
      front: '<h2>Chapter 26: Photograph</h2>',
      back: '<p>We keep this love in a photograph —<br> not trapped,<br> but preserved in perpetual arrival.<br><br>Your eyes, luminous as first mornings.<br> Our hearts — mid-beat, mid-promise.<br> Time pausing long enough<br> to remember us correctly.<br><br>When distance sharpens its quiet knives,<br> I return to that image.<br> There, we are unafraid.<br> There, we are certain.<br><br>A single frame —<br> yet it speaks in infinite dialects.<br><br>It tells me permanence is not measured in years<br> but in the gravity of presence.<br><br>Market Market — worn, familiar —<br> became cathedral enough<br> for a memory reborn.<br><br>Because love does this:<br> it renovates the ordinary<br> until it gleams.<br><br>And in that captured second,<br> you were not merely beside me —<br><br>you were already<br> home.</p>'
    },
    {
      front: '<h2>Chapter 27: The Canadian</h2>',
      back: '<p>Rain baptized Poblacion that night,<br> streets glossed in trembling neon,<br> as I waited outside Tango —<br> half-drenched, wholly expectant.<br><br>Then your car arrived,<br> and with it, pieces of the life you lived before me.<br><br>Your childhood friend —<br> fresh from Canada, bright with returning warmth —<br> met me not as a stranger<br> but as someone already spoken for.<br><br>Five of us became six,<br> six became a constellation —<br> couples orbiting the same fearless gravity.<br><br>I had never stood inside a room<br> so unapologetically alive with love.<br><br>We danced without rehearsal,<br> sang like the night had lungs of its own,<br> laughter spilling into rain-washed streets.<br><br>And somewhere between the basslines<br> and your hand finding mine,<br> a quiet realization bloomed:<br><br>I was no longer visiting your world —<br> I was being woven into it.<br><br>Acceptance is rarely announced.<br> Sometimes it is simply felt<br> in the way space opens for you to belong.<br><br>That night, beneath the sky’s soft collapse,<br> I belonged.</p>'
    },
    {
      front: '<h2>Chapter 28: Our Roots, Quarterly Mine</h2>',
      back: '<p>Binondo greeted us with its ancient pulse —<br> lantern-lit arteries,<br> history simmering in every doorway.<br><br>Steam rose from bowls of noodles<br> like prayers finally answered.<br> Baos — tender, bursting —<br> small suns cradled in bamboo.<br><br>We found that retro television,<br> our reflections flickering inside it,<br> two lovers briefly mistaken for memory.<br><br>The world tasted fuller there —<br> salt, broth, sweetness, discovery.<br><br>What seemed like a simple excursion<br> quietly rooted us deeper.<br><br>Because love is not only forged in grand gestures —<br> it grows in wandering,<br> in shared hunger,<br> in streets walked without urgency.<br><br>Binondo did not merely host us.<br><br>It planted us.</p>'
    },
    {
      front: '<h2>Chapter 29: Anniversary</h2>',
      back: '<p>One year.<br><br>Once, that number felt unreachable —<br> a horizon dissolving before I could arrive.<br><br>Yet there we were.<br><br>Lan Hotpot simmered between us,<br> broth rolling like time made visible.<br><br>I handed you flowers —<br> my first for you.<br> Fragile, inconvenient, impossible to bring home.<br><br>You loved them anyway.<br><br>Not for their bloom,<br> but for the hands that chose them.<br><br>Then you revealed your gift —<br> Cinnabon cinnamon rolls,<br> sinfully sweet, unmistakably you.<br><br>I kissed you without thinking.<br> Some joys refuse restraint.<br><br>That night did more than celebrate duration —<br> it dismantled an old fear:<br><br>that everyone I love eventually leaves.<br><br>But you stayed.<br> You stayed through the ordinary,<br> through the unremarkable days that truly measure devotion.<br><br>And in staying,<br> you quieted storms I had long mistaken for climate.<br><br>One year —<br> not just survived,<br> but lived.</p>'
    },
    {
      front: '<h2>Chapter 30: Halloween Special</h2>',
      back: '<p>You were Fester.<br> I, Lurch —<br> grotesque only in costume,<br> ridiculous in the best ways.<br><br>Among friends and flickering lights,<br> we surrendered to laughter again,<br> as if adulthood were optional for one night.<br><br>There is a peculiar intimacy<br> in being foolish together —<br> in loving someone who sees your absurdity<br> and draws nearer, not away.<br><br>Some bonds deepen not through confession,<br> but through shared delight.<br><br>And that night,<br> joy wore our faces well.</p>'
    },
    {
      front: '<h2>Chapter 31: What the Meows Chose</h2>',
      back: '<p>Grand Venice unfolded like a painted dream —<br> bridges arching gently,<br> water pretending to remember Italy.<br><br>I imagined us drifting in a boat,<br> shoulder to shoulder,<br> letting the current decide our pace.<br><br>But even without the ride,<br> romance arrived effortlessly.<br><br>Perhaps love does not require canals —<br> only companionship.<br><br>If given another evening there,<br> I would ask for nothing elaborate.<br><br>Just your hand.<br> Just the quiet agreement<br> to walk nowhere in particular, together.</p>'
    },
    {
      front: '<h2>Chapter 32: Flopsplanade, Foulsplanade</h2>',
      back: '<p>Estancia began in elegance —<br> art breathing along white walls,<br> creativity humming softly.<br><br>Then came the Esplanade.<br><br>My stomach staged its rebellion,<br> the river carried an honesty best left unsmelled,<br> and hunger lowered our standards to comedy.<br><br>Duplicate stalls promised abundance —<br> delivered catastrophe.<br><br>Gravy thin as doubt,<br> rice glowing an unnatural yellow,<br> nachos baptized in ketchup.<br><br>Yet we laughed —<br> that helpless, tear-bright laughter<br> born only from shared inconvenience.<br><br>Because love reveals itself most clearly<br> when things go wrong<br> and neither of you walks away annoyed.<br><br>Even disappointment becomes anecdote<br> when joy insists on surviving it.</p>'
    },
    {
      front: '<h2>Chapter 33: Our Dream</h2>',
      back: '<p>Gramercy lifted us above the city\'s restless grammar —<br> windows opening into constellations of electricity.<br><br>For one suspended night,<br> we borrowed a life we had only imagined.<br><br>The skyline stretched endlessly,<br> and so, it seemed, did we.<br><br>Our closeness that evening felt less like discovery<br> and more like recognition —<br> two souls learning the language of trust<br> without needing translation.<br><br>Later, I cooked for you — pasta, imperfect but earnest —<br> our first meal shaped by our own hands.<br> Pizza joined us, humble and celebratory.<br><br>On the balcony,<br> Luna presided — silent, sovereign —<br> as we poured stories into the dark.<br><br>Dreams are often loud things,<br> but that night proved otherwise.<br><br>Sometimes a dream<br> is simply the right person beside you<br> while the world glitters below.</p>'
    },
    {
      front: '<h2>Chapter 34: Your Day</h2>',
      back: '<p>At Versus, the arcade lights flickered<br> like fragments of adolescence returned.<br><br>We drank, sang, shouted lyrics we barely knew —<br> grown bodies reclaiming reckless youth.<br><br>But my favorite moment<br> was not the noise.<br><br>It was the way you leaned into me,<br> smiling as if the entire bar<br> were merely background.<br><br>On your birthday,<br> surrounded by friends,<br> I understood something quietly monumental:<br><br>Your happiness had become<br> one of my native languages.</p>'
    },
    {
      front: '<h2>Chapter 35: New n+♾️</h2>',
      back: '<p>Another Christmas —<br> and this time, you were inside it with me.<br><br>Though faith never claimed me,<br> the warmth of gathering always did.<br> And you — greeted with effortless joy —<br> fit into every embrace.<br><br>Watching my family welcome you<br> felt like witnessing two rivers merge<br> without turbulence.<br><br>Then another year turned,<br> and still, you remained.<br><br>Days stacked gently into months,<br> months into something approaching forever.<br><br>Love, I’ve learned,<br> does not dull with repetition —<br> it accumulates light.<br><br>And with every passing calendar,<br> my heart did not tire.<br><br>It widened.</p>'
    },
    {
      front: '<h2>Chapter 36: Vintage is the New Romance</h2>',
      back: '<p>Meeting those you love<br> is a privilege I never take lightly.<br><br>Your brother, his world,<br> the quiet honor of being invited near it —<br> these are thresholds, not casual crossings.<br><br>Wine flowed, laughter loosened the evening,<br> and somewhere between mishaps<br> and impulsive vintage finds,<br> I felt history expanding to include me.<br><br>Nothing whispers permanence louder<br> than being introduced<br> to the people who shaped the one you cherish.<br><br>That night was less about celebration —<br> and more about inclusion.<br><br>I was no longer adjacent to your life.<br><br>I was inside it.</p>'
    },
    {
      front: '<h2>Chapter 37: Singularity</h2>',
      back: '<p>Looking back,<br> I see now that love was never a transaction.<br><br>Hope was not naïveté —<br> it was intuition waiting for proof.<br><br>You did not resurrect the poet in me.<br> You revealed he had been breathing all along,<br> patient beneath the rubble of former endings.<br><br>In loving you,<br> I found the self I once misplaced —<br> still capable of depth,<br> still fluent in wonder.<br><br>If this book concludes here,<br> let it not be mistaken for an ending.<br><br>Because what we have entered<br> does not behave like chapters.<br><br>It behaves like the universe —<br> expanding, unfinal,<br> beautifully without edge.<br><br>A singularity, then:<br><br>Where two lives collapse into one gravity,<br> and from that convergence,<br> infinity begins.</p>'
    }
  ];

  // Create wrapper with perspective
  const wrapper = document.createElement('div');
  wrapper.className = 'flip-card-wrapper entering';
  
  // Create card template
  let cardHTML = `<button class="flip-card" data-current-page="0" type="button" aria-label="Flip card">`;
  
  // Add all pages as virtual data (only one rendered at a time)
  cardHTML += pageContents.map((page, idx) => `
    <div class="flip-card-side flip-card-front" data-page="${idx}">
      <div class="flip-card-content">
        ${page.front}
      </div>
    </div>
    <div class="flip-card-side flip-card-back" data-page="${idx}">
      <div class="flip-card-content ${idx < 3 ? 'centered' : ''}">
        ${page.back}
      </div>
    </div>
  `).join('');
  
  cardHTML += `</button>`;
  cardHTML += `
    <div class="page-indicator"><span id="pageNum">1</span> / <span id="pageTotal">${pageContents.length}</span></div>
  `;
  
  wrapper.innerHTML = cardHTML;
  stageContent.appendChild(wrapper);

  const card = wrapper.querySelector('.flip-card');
  const pageIndicator = wrapper.querySelector('#pageNum');
  const totalPages = pageContents.length;
  
  let currentPage = 0;
  let isFlipped = false;
  let isAnimating = false;

  // Hide all pages except current one
  function updatePageVisibility(){
    card.querySelectorAll('[data-page]').forEach(el => {
      const pageNum = parseInt(el.getAttribute('data-page'));
      el.style.display = pageNum === currentPage ? 'flex' : 'none';
    });
    pageIndicator.textContent = currentPage + 1;
    card.setAttribute('data-current-page', currentPage);
  }

  // Initial page display
  updatePageVisibility();

  // Animation for entering
  requestAnimationFrame(()=> {
    wrapper.classList.remove('entering');
  });

  // Flip card on click
  card.addEventListener('click', (e) => {
    e.preventDefault();
    if(isAnimating) return;

    if(!isFlipped){
      // First click: flip to back
      isFlipped = true;
      card.classList.add('flipped');
    } else {
      // Second click: move to next page
      if(currentPage < totalPages - 1){
        // Exit current card and load next one
        isAnimating = true;
        card.classList.add('exiting');
        setTimeout(() => {
          currentPage++;
          isFlipped = false;
          card.classList.remove('flipped', 'exiting');
          updatePageVisibility();
          isAnimating = false;
        }, 400);
      } else {
        // Last page: just flip back to front
        isFlipped = false;
        card.classList.remove('flipped');
      }
    }
  });

  // Keyboard navigation (arrow keys)
  const keyHandler = (e) => {
    const flipCard = document.querySelector('.flip-card');
    if(!flipCard || isAnimating) return;

    if(e.key === 'ArrowRight'){
      e.preventDefault();
      flipCard.click();
    } else if(e.key === 'ArrowLeft'){
      e.preventDefault();
      if(isFlipped){
        // If showing back, flip to front
        isFlipped = false;
        card.classList.remove('flipped');
      } else if(currentPage > 0){
        // If showing front, go back
        isAnimating = true;
        card.classList.add('exiting');
        setTimeout(() => {
          currentPage--;
          isFlipped = true;
          card.classList.remove('exiting');
          card.classList.add('flipped');
          updatePageVisibility();
          isAnimating = false;
        }, 400);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  // Touch/swipe support
  let touchStartX = null;
  card.addEventListener('touchstart', (ev) => { touchStartX = ev.touches[0].clientX; }, {passive:true});
  card.addEventListener('touchend', (ev) => {
    if(touchStartX === null || isAnimating) return;
    const dx = ev.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 40){
      if(dx < 0){
        // Swipe left: same as right arrow/click
        card.click();
      } else if(dx > 0){
        // Swipe right: same as left arrow
        const leftArrowEvent = new KeyboardEvent('keydown', {key: 'ArrowLeft'});
        keyHandler(leftArrowEvent);
      }
    }
    touchStartX = null;
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

// Initialize appearance values
updateNoButtonAppearance();
