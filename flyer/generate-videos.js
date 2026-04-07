/**
 * Generates Facebook (1080x1920 portrait) and YouTube (1920x1080 landscape)
 * slideshow videos for 54879 Indian Lake Road.
 *
 * Usage:
 *   NODE_PATH=~/Desktop/HollyTrapani/puppeteer/node_modules node generate-videos.js
 *   NODE_PATH=~/Desktop/HollyTrapani/puppeteer/node_modules node generate-videos.js --facebook
 *   NODE_PATH=~/Desktop/HollyTrapani/puppeteer/node_modules node generate-videos.js --youtube
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const SITE = path.join(__dirname, '..');
const FB_OUT = path.join(__dirname, 'videos', 'video-54879-indian-lake-rd.mp4');
const YT_OUT = path.join(__dirname, 'youtube', 'youtube-54879-indian-lake-rd.mp4');
const FB_FRAMES = path.join(__dirname, 'videos', 'frames');
const YT_FRAMES = path.join(__dirname, 'youtube', 'frames');
const MUSIC = path.join(__dirname, 'music.mp3');

const FPS = 30;
const FADE = 0.6;

// ── Property info ──────────────────────────────────────────────────────────────
const P = {
  address: '54879 Indian Lake Road',
  cityState: 'Dowagiac, MI 49047',
  price: '$399,000',
  beds: '3',
  baths: '3',
  built: '1923',
  highlights: 'Refinished hardwood floors, quartz countertops, sunroom, large deck, and fireplace. Built in 1923 with classic lakehouse character, recently renovated throughout.',
  chips: ['Indian Lake', 'Sunroom', 'Large Deck', 'Fireplace', 'Built 1923', 'You Own the Land'],
  agent: 'Beth Van',
  brokerage: 'Bon Realty · Niles, MI',
  email: 'bethvan@bonrealty.com',
  phone: '(269) 684-4445',
  website: '54879indianlake.com',
};

// ── Photo selection ────────────────────────────────────────────────────────────
// Curated order: exterior → lake → indoors, best shots first
const SLIDE_PHOTOS = [
  'outdoorOfHouse/house.jpeg',           // hero — front of house
  'viewsOfLake/IMG_2869.jpeg',           // lake view
  'outdoorOfHouse/deckwithchairs.jpeg',  // deck
  'Indoors/kitchen.jpeg',                // kitchen
  'Indoors/livingroom1.jpeg',            // living room
  'Indoors/sunroom.jpeg',                // sunroom
  'Indoors/familyroomFireplace.jpeg',    // fireplace
  'viewsOfLake/IMG_2940.jpeg',           // lake view 2
  'outdoorOfHouse/sunset.jpeg',          // sunset
].map(p => path.join(SITE, p));

// All photos for YouTube slideshow (curated, no duplicates, no MOV)
const ALL_PHOTOS = [
  // Exterior first
  'outdoorOfHouse/house.jpeg',
  'outdoorOfHouse/house2.jpeg',
  'outdoorOfHouse/house3.jpeg',
  'outdoorOfHouse/housePortrait.jpeg',
  'outdoorOfHouse/houseBack.jpeg',
  // Lake views
  'viewsOfLake/IMG_2869.jpeg',
  'viewsOfLake/IMG_2874.JPG',
  'viewsOfLake/IMG_2938.jpeg',
  'viewsOfLake/IMG_2940.jpeg',
  'viewsOfLake/IMG_3185.jpeg',
  'viewsOfLake/IMG_3480.jpeg',
  'viewsOfLake/IMG_3640.jpeg',
  'viewsOfLake/IMG_3644.jpeg',
  'viewsOfLake/IMG_3835.jpeg',
  // Deck / outdoor
  'outdoorOfHouse/deckwithchairs.jpeg',
  'outdoorOfHouse/deck1.jpeg',
  'outdoorOfHouse/deck2.jpeg',
  'outdoorOfHouse/deck3.jpeg',
  'outdoorOfHouse/sunset.jpeg',
  // Kitchen
  'Indoors/kitchen.jpeg',
  'Indoors/kitchen1.jpeg',
  'Indoors/kitchen2.jpeg',
  'Indoors/kitchen3.jpeg',
  'Indoors/kitchenview.jpeg',
  // Living / family room
  'Indoors/livingroom1.jpeg',
  'Indoors/familyroom.jpeg',
  'Indoors/familyroom3.jpeg',
  'Indoors/familyroomFireplace.jpeg',
  'Indoors/diningroom.jpeg',
  // Sunroom
  'Indoors/sunroom.jpeg',
  'Indoors/sunroom1.jpeg',
  'Indoors/sunroom2.jpeg',
  'Indoors/sunroom3.jpeg',
  // Bedrooms / bathrooms
  'Indoors/masterbathroom1.jpeg',
  'Indoors/masterbathroomshower.jpeg',
  'Indoors/bedroom3.jpeg',
  'Indoors/woodfloors.jpeg',
  'Indoors/woodfloors2.jpeg',
].map(p => path.join(SITE, p)).filter(fs.existsSync);

function imageToDataUri(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// ── Shared fonts / base styles ─────────────────────────────────────────────────
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;

// ════════════════════════════════════════════════════════════════════════════════
// FACEBOOK SLIDES — 1080 × 1920
// ════════════════════════════════════════════════════════════════════════════════
const FBW = 1080, FBH = 1920;

function fbBase(W, H) {
  return `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${W}px; height: ${H}px; font-family: 'Jost', sans-serif; overflow: hidden; position: relative; background: #0e1e2a; }
  .photo-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(14,30,42,0.1) 0%, rgba(14,30,42,0.0) 25%, rgba(14,30,42,0.6) 65%, rgba(14,30,42,0.95) 100%); }
  .content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 80px 64px 110px; }
  .top-bar { position: absolute; top: 0; left: 0; right: 0; padding: 60px 64px 0; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 500; font-style: italic; color: rgba(255,255,255,0.9); }
  .logo-tag { font-size: 18px; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase; color: #6db3cc; }
  .tag { font-size: 24px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: #6db3cc; margin-bottom: 22px; }
  .price { font-family: 'Cormorant Garamond', serif; font-size: 76px; font-weight: 600; color: #fff; margin-bottom: 16px; line-height: 1; }
  .address { font-size: 28px; font-weight: 300; color: rgba(255,255,255,0.72); letter-spacing: 0.04em; line-height: 1.4; margin-bottom: 0; }
  .divider { width: 60px; height: 2px; background: #2C5F7A; margin-bottom: 40px; }
  .specs-row { display: flex; gap: 0; margin-bottom: 48px; }
  .spec { flex: 1; border-right: 1px solid rgba(255,255,255,0.18); padding: 0 28px 0 0; margin-right: 28px; }
  .spec:last-child { border-right: none; padding: 0; margin: 0; }
  .spec-val { font-family: 'Cormorant Garamond', serif; font-size: 84px; font-weight: 600; color: #fff; line-height: 1; display: block; }
  .spec-label { font-size: 22px; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; color: #6db3cc; }
  .body-text { font-size: 30px; font-weight: 300; color: rgba(255,255,255,0.82); line-height: 1.65; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 40px; }
  .chip { font-size: 22px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #6db3cc; border: 1px solid rgba(109,179,204,0.4); padding: 10px 28px; border-radius: 3px; }
  `;
}

function fbSlide(css, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}<style>${css}</style></head><body>${body}</body></html>`;
}

function fbSlide1(photo) {
  return fbSlide(fbBase(FBW, FBH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div>
    <div class="top-bar"><span class="logo">Indian Lake</span><span class="logo-tag">For Sale</span></div>
    <div class="content">
      <div class="tag">Lakefront Living</div>
      <div class="price">${P.price}</div>
      <div class="address">${P.address}<br>${P.cityState}</div>
    </div>
  `);
}

function fbSlide2(photo) {
  return fbSlide(fbBase(FBW, FBH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div>
    <div class="top-bar"><span class="logo">Property Details</span><span class="logo-tag">${P.price}</span></div>
    <div class="content">
      <div class="tag">By the Numbers</div>
      <div class="divider"></div>
      <div class="specs-row">
        <div class="spec"><span class="spec-val">${P.beds}</span><span class="spec-label">Beds</span></div>
        <div class="spec"><span class="spec-val">${P.baths}</span><span class="spec-label">Baths</span></div>
        <div class="spec"><span class="spec-val">${P.built}</span><span class="spec-label">Built</span></div>
      </div>
    </div>
  `);
}

function fbSlide3(photo) {
  return fbSlide(fbBase(FBW, FBH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div>
    <div class="top-bar"><span class="logo">Indian Lake</span><span class="logo-tag">Dowagiac, MI</span></div>
    <div class="content">
      <div class="tag">About This Home</div>
      <div class="divider"></div>
      <div class="body-text">${P.highlights}</div>
    </div>
  `);
}

function fbSlide4(photo) {
  const chips = P.chips.map(c => `<span class="chip">${c}</span>`).join('');
  return fbSlide(fbBase(FBW, FBH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div>
    <div class="top-bar"><span class="logo">Highlights</span><span class="logo-tag">${P.price}</span></div>
    <div class="content">
      <div class="tag">What You Get</div>
      <div class="divider"></div>
      <div class="chip-row">${chips}</div>
    </div>
  `);
}

function fbSlide5() {
  const css = fbBase(FBW, FBH) + `
    .cta-wrap { display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;text-align:center;padding:80px 64px; }
    .cta-title { font-family:'Cormorant Garamond',serif;font-size:72px;font-weight:500;font-style:italic;color:#fff;margin-bottom:12px;line-height:1.1; }
    .cta-sub { font-size:24px;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;color:#6db3cc;margin-bottom:60px; }
    .cta-divider { width:60px;height:2px;background:#2C5F7A;margin:0 auto 56px; }
    .cta-addr { font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:400;color:#fff;margin-bottom:8px; }
    .cta-price { font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:600;color:#fff;margin-bottom:60px; }
    .cta-agent { font-size:32px;font-weight:600;color:#fff;margin-bottom:10px; }
    .cta-contact { font-size:26px;font-weight:300;color:rgba(255,255,255,0.65);line-height:1.7; }
    .cta-website { font-size:30px;font-weight:500;letter-spacing:0.1em;color:#6db3cc;margin-top:16px; }
  `;
  return fbSlide(css, `
    <div class="photo-bg" style="background:linear-gradient(160deg,#0e1e2a 0%,#2C5F7A 50%,#0e1e2a 100%)"></div>
    <div class="cta-wrap">
      <div class="cta-title">Your Lake Life Awaits</div>
      <div class="cta-sub">Indian Lake · Dowagiac, Michigan</div>
      <div class="cta-divider"></div>
      <div class="cta-addr">${P.address}</div>
      <div class="cta-price">${P.price}</div>
      <div class="cta-divider"></div>
      <div class="cta-agent">${P.agent} · ${P.brokerage}</div>
      <div class="cta-contact">${P.email}<br>${P.phone}</div>
      <div class="cta-website">${P.website}</div>
    </div>
  `);
}

// ════════════════════════════════════════════════════════════════════════════════
// YOUTUBE SLIDES — 1920 × 1080
// ════════════════════════════════════════════════════════════════════════════════
const YTW = 1920, YTH = 1080;

function ytBase(W, H) {
  return `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${W}px; height: ${H}px; font-family: 'Jost', sans-serif; overflow: hidden; position: relative; background: #0e1e2a; }
  .photo-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(14,30,42,0.9) 0%, rgba(14,30,42,0.55) 45%, rgba(14,30,42,0.1) 100%); }
  .overlay-b { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(14,30,42,0) 0%, rgba(14,30,42,0.6) 100%); }
  .content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 60px 100px; }
  .logo-bar { position: absolute; top: 44px; left: 100px; right: 100px; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 500; font-style: italic; color: rgba(255,255,255,0.9); }
  .logo-tag { font-size: 16px; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase; color: #6db3cc; }
  .tag { font-size: 22px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: #6db3cc; margin-bottom: 18px; }
  .price { font-family: 'Cormorant Garamond', serif; font-size: 96px; font-weight: 600; color: #fff; margin-bottom: 12px; line-height: 1; }
  .address { font-size: 30px; font-weight: 300; color: rgba(255,255,255,0.72); letter-spacing: 0.04em; line-height: 1.4; }
  .divider { width: 50px; height: 2px; background: #2C5F7A; margin-bottom: 32px; }
  .specs-row { display: flex; gap: 0; margin-bottom: 40px; }
  .spec { flex: 0 0 auto; border-right: 1px solid rgba(255,255,255,0.18); padding: 0 44px 0 0; margin-right: 44px; }
  .spec:last-child { border-right: none; padding: 0; margin: 0; }
  .spec-val { font-family: 'Cormorant Garamond', serif; font-size: 96px; font-weight: 600; color: #fff; line-height: 1; display: block; }
  .spec-label { font-size: 22px; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; color: #6db3cc; }
  .body-text { font-size: 32px; font-weight: 300; color: rgba(255,255,255,0.82); line-height: 1.65; max-width: 700px; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 14px; }
  .chip { font-size: 20px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #6db3cc; border: 1px solid rgba(109,179,204,0.4); padding: 8px 22px; border-radius: 3px; }
  `;
}

function ytSlide(css, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}<style>${css}</style></head><body>${body}</body></html>`;
}

function ytSlide1(photo) {
  return ytSlide(ytBase(YTW, YTH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div><div class="overlay-b"></div>
    <div class="logo-bar"><span class="logo">Indian Lake</span><span class="logo-tag">For Sale · Dowagiac, MI</span></div>
    <div class="content">
      <div class="tag">Lakefront Living</div>
      <div class="price">${P.price}</div>
      <div class="address">${P.address}<br>${P.cityState}</div>
    </div>
  `);
}

function ytSlide2(photo) {
  return ytSlide(ytBase(YTW, YTH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div><div class="overlay-b"></div>
    <div class="logo-bar"><span class="logo">Property Details</span><span class="logo-tag">${P.price}</span></div>
    <div class="content">
      <div class="tag">By the Numbers</div>
      <div class="divider"></div>
      <div class="specs-row">
        <div class="spec"><span class="spec-val">${P.beds}</span><span class="spec-label">Bedrooms</span></div>
        <div class="spec"><span class="spec-val">${P.baths}</span><span class="spec-label">Bathrooms</span></div>
        <div class="spec"><span class="spec-val">${P.built}</span><span class="spec-label">Year Built</span></div>
      </div>
    </div>
  `);
}

function ytSlide3(photo) {
  return ytSlide(ytBase(YTW, YTH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div><div class="overlay-b"></div>
    <div class="logo-bar"><span class="logo">About This Home</span><span class="logo-tag">Indian Lake · Dowagiac, MI</span></div>
    <div class="content">
      <div class="tag">The Property</div>
      <div class="divider"></div>
      <div class="body-text">${P.highlights}</div>
    </div>
  `);
}

function ytSlide4(photo) {
  const chips = P.chips.map(c => `<span class="chip">${c}</span>`).join('');
  return ytSlide(ytBase(YTW, YTH), `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay"></div><div class="overlay-b"></div>
    <div class="logo-bar"><span class="logo">Highlights</span><span class="logo-tag">${P.price}</span></div>
    <div class="content">
      <div class="tag">What You Get</div>
      <div class="divider"></div>
      <div class="chip-row">${chips}</div>
    </div>
  `);
}

function ytPhotoSlide(photo) {
  // Clean full-bleed photo slide for the gallery portion
  const css = ytBase(YTW, YTH) + `
    .watermark { position:absolute;bottom:32px;right:52px;font-size:18px;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.45); }
  `;
  return ytSlide(css, `
    ${photo ? `<img class="photo-bg" src="${photo}" alt="">` : '<div class="photo-bg"></div>'}
    <div class="overlay-b"></div>
    <div class="watermark">${P.website}</div>
  `);
}

function ytSlide5() {
  const css = ytBase(YTW, YTH) + `
    .cta-wrap { display:flex;flex-direction:column;align-items:flex-start;justify-content:center;height:100%;padding:60px 100px;max-width:820px; }
    .cta-title { font-family:'Cormorant Garamond',serif;font-size:80px;font-weight:500;font-style:italic;color:#fff;line-height:1.1;margin-bottom:12px; }
    .cta-sub { font-size:22px;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;color:#6db3cc;margin-bottom:48px; }
    .cta-divider { width:60px;height:2px;background:#2C5F7A;margin-bottom:44px; }
    .cta-addr { font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:400;color:#fff;margin-bottom:6px; }
    .cta-price { font-family:'Cormorant Garamond',serif;font-size:46px;font-weight:600;color:#fff;margin-bottom:44px; }
    .cta-agent { font-size:26px;font-weight:600;color:#fff;margin-bottom:8px; }
    .cta-contact { font-size:22px;font-weight:300;color:rgba(255,255,255,0.65);line-height:1.7; }
    .cta-website { font-size:24px;font-weight:500;letter-spacing:0.1em;color:#6db3cc;margin-top:12px; }
  `;
  return ytSlide(css, `
    <div class="photo-bg" style="background:linear-gradient(135deg,#0e1e2a 0%,#1a3a50 40%,#0e1e2a 100%)"></div>
    <div class="cta-wrap">
      <div class="cta-title">Your Lake Life Awaits</div>
      <div class="cta-sub">Indian Lake · Dowagiac, Michigan</div>
      <div class="cta-divider"></div>
      <div class="cta-addr">${P.address}</div>
      <div class="cta-price">${P.price}</div>
      <div class="cta-divider"></div>
      <div class="cta-agent">${P.agent} · ${P.brokerage}</div>
      <div class="cta-contact">${P.email}<br>${P.phone}</div>
      <div class="cta-website">${P.website}</div>
    </div>
  `);
}

// ── Screenshot slides ──────────────────────────────────────────────────────────
async function screenshot(browser, html, outPath, W, H) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outPath, type: 'png' });
  await page.close();
}

// ── ffmpeg: render individual clip ────────────────────────────────────────────
function renderClip(imgPath, duration, outPath, W, H) {
  const frames = duration * FPS;
  const zoomExpr = `zoom='min(zoom+0.00007,1.02)'`;
  const vf = `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
    `zoompan=${zoomExpr}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},` +
    `fps=${FPS},setpts=PTS-STARTPTS`;

  execSync([
    'ffmpeg -y',
    `-loop 1 -framerate ${FPS} -t ${duration} -i "${imgPath}"`,
    `-vf "${vf}"`,
    `-c:v libx264 -pix_fmt yuv420p -crf 20 -preset fast`,
    `-t ${duration} -r ${FPS}`,
    `"${outPath}"`
  ].join(' '), { stdio: 'pipe' });
}

// ── ffmpeg: xfade chain + optional music ──────────────────────────────────────
function stitchClips(clipPaths, durations, outputFile, withMusic) {
  const n = clipPaths.length;
  const inputs = clipPaths.map(f => `-i "${f}"`).join(' ');

  const filterParts = [];
  let lastLabel = '0:v';
  for (let i = 1; i < n; i++) {
    const offset = durations.slice(0, i).reduce((a, b) => a + b, 0) - FADE * i;
    const outLabel = i === n - 1 ? 'vout' : `xf${i}`;
    filterParts.push(`[${lastLabel}][${i}:v]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(3)}[${outLabel}]`);
    lastLabel = outLabel;
  }

  const totalDuration = durations.reduce((a, b) => a + b, 0) - FADE * (n - 1);

  let audioInputs = '';
  let audioMap = '';
  let audioInputIdx = n;

  if (withMusic && fs.existsSync(MUSIC)) {
    audioInputs = `-stream_loop -1 -i "${MUSIC}"`;
    audioMap = `-map "${audioInputIdx}:a" -af "afade=t=out:st=${(totalDuration - 3).toFixed(1)}:d=3" -shortest`;
    audioInputIdx++;
  }

  execSync([
    'ffmpeg -y',
    inputs,
    audioInputs,
    `-filter_complex "${filterParts.join('; ')}"`,
    `-map "[vout]"`,
    audioMap,
    `-t ${totalDuration.toFixed(3)}`,
    `-c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart`,
    withMusic ? '-c:a aac -b:a 192k' : '',
    `"${outputFile}"`
  ].join(' '), { stdio: 'pipe' });
}

// ── Build Facebook video ───────────────────────────────────────────────────────
async function buildFacebook(browser) {
  console.log('\n── Facebook Video (1080×1920) ──────────────────────────────────');
  fs.mkdirSync(FB_FRAMES, { recursive: true });

  const photos = SLIDE_PHOTOS.slice(0, 5).map(imageToDataUri);

  const slides = [
    { html: fbSlide1(photos[0]), duration: 5 + FADE },
    { html: fbSlide2(photos[1]), duration: 4 + FADE },
    { html: fbSlide3(photos[2]), duration: 5 + FADE },
    { html: fbSlide4(photos[3]), duration: 4 + FADE },
    { html: fbSlide5(),          duration: 4 },
  ];

  const clipPaths = [];
  const durations = [];

  for (let i = 0; i < slides.length; i++) {
    const slidePath = path.join(FB_FRAMES, `slide-${i}.png`);
    const clipPath = path.join(FB_FRAMES, `clip-${i}.mp4`);
    process.stdout.write(`  Slide ${i + 1}/${slides.length}...`);
    await screenshot(browser, slides[i].html, slidePath, FBW, FBH);
    renderClip(slidePath, slides[i].duration, clipPath, FBW, FBH);
    clipPaths.push(clipPath);
    durations.push(slides[i].duration);
    console.log(' ✓');
  }

  console.log('  Stitching clips...');
  stitchClips(clipPaths, durations, FB_OUT, true);
  clipPaths.forEach(f => { try { fs.unlinkSync(f); } catch(_) {} });
  console.log(`  ✓ ${FB_OUT}`);
}

// ── Build YouTube video ────────────────────────────────────────────────────────
async function buildYouTube(browser) {
  console.log('\n── YouTube Video (1920×1080) ───────────────────────────────────');
  fs.mkdirSync(YT_FRAMES, { recursive: true });

  const keyPhotos = SLIDE_PHOTOS.map(imageToDataUri);
  const galleryPhotos = ALL_PHOTOS.slice(0, 28).map(imageToDataUri);

  // Intro slides (7 slides) + photo gallery (up to 28 photos) + outro
  const slides = [
    { html: ytSlide1(keyPhotos[0]), duration: 5 + FADE },
    { html: ytSlide2(keyPhotos[1]), duration: 5 + FADE },
    { html: ytSlide3(keyPhotos[2]), duration: 6 + FADE },
    { html: ytSlide4(keyPhotos[3]), duration: 5 + FADE },
    ...galleryPhotos.map(p => ({ html: ytPhotoSlide(p), duration: 2 + FADE })),
    { html: ytSlide5(), duration: 6 },
  ];

  const clipPaths = [];
  const durations = [];

  for (let i = 0; i < slides.length; i++) {
    const slidePath = path.join(YT_FRAMES, `slide-${i}.png`);
    const clipPath = path.join(YT_FRAMES, `clip-${i}.mp4`);
    process.stdout.write(`  Slide ${i + 1}/${slides.length}...`);
    await screenshot(browser, slides[i].html, slidePath, YTW, YTH);
    renderClip(slidePath, slides[i].duration, clipPath, YTW, YTH);
    clipPaths.push(clipPath);
    durations.push(slides[i].duration);
    console.log(' ✓');
  }

  console.log('  Stitching clips (this takes a minute)...');
  stitchClips(clipPaths, durations, YT_OUT, true);
  clipPaths.forEach(f => { try { fs.unlinkSync(f); } catch(_) {} });
  console.log(`  ✓ ${YT_OUT}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const doFB = args.includes('--facebook') || !args.includes('--youtube');
  const doYT = args.includes('--youtube') || !args.includes('--facebook');

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  if (doFB) await buildFacebook(browser);
  if (doYT) await buildYouTube(browser);

  await browser.close();
  console.log('\n✓ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
