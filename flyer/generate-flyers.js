const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SITE_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, 'output');

const PROPERTY = {
  address: '54879 Indian Lake Road',
  cityState: 'Dowagiac, MI 49047',
  price: '$399,000',
  beds: '3',
  baths: '3',
  built: '1923',
  features: 'Refinished hardwood floors, quartz countertops, sunroom, large deck, fireplace, and right of way easement to Indian Lake. Built 1923, recently renovated throughout. You own the land outright.',
  agent: 'Beth Van',
  brokerage: 'Bon Realty · Niles, MI',
  email: 'bethvan@bonrealty.com',
  phone: '(269) 684-4445',
  website: '54879indianlake.com',
};

const PHOTOS = [
  path.join(SITE_DIR, 'outdoorOfHouse/house.jpeg'),
  path.join(SITE_DIR, 'viewsOfLake/IMG_2869.jpeg'),
  path.join(SITE_DIR, 'Indoors/kitchen.jpeg'),
  path.join(SITE_DIR, 'Indoors/sunroom.jpeg'),
];

function imageToDataUri(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// ── Template 1: Landscape, hero + 3 thumbs + warm details panel ──
function buildTemplate1(p, photos) {
  const [hero, t1, t2, t3] = photos;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${p.address} — ${p.agent}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1056px; height: 816px; background: #fff; font-family: 'Jost', sans-serif; overflow: hidden; position: relative; }
  .page-border { position: absolute; inset: 14px; border: 1.5px solid #2C5F7A; pointer-events: none; z-index: 10; }
  .layout { display: flex; flex-direction: column; height: 100%; padding: 28px 32px 24px; }
  .headline { font-family: 'Cormorant Garamond', serif; font-size: 58px; font-weight: 700; color: #2C5F7A; line-height: 1; margin-bottom: 16px; }
  .body-row { display: flex; flex: 1; gap: 20px; min-height: 0; }
  .photo-col { flex: 0 0 620px; display: flex; flex-direction: column; gap: 8px; }
  .hero-photo { flex: 1; border-radius: 2px; overflow: hidden; min-height: 0; }
  .hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumb-row { display: flex; gap: 8px; height: 152px; flex-shrink: 0; }
  .thumb { flex: 1; border-radius: 2px; overflow: hidden; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .details-panel { flex: 1; background: #E8F2F7; border-radius: 2px; padding: 24px 22px 20px; display: flex; flex-direction: column; }
  .panel-heading { font-size: 17px; font-weight: 700; color: #1A1A1A; margin-bottom: 10px; letter-spacing: 0.02em; }
  .address-line { font-size: 11px; color: #5C8FA3; margin-bottom: 10px; }
  .panel-price { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 600; color: #2C5F7A; margin-bottom: 12px; line-height: 1; }
  .panel-row { font-size: 12px; font-weight: 700; color: #1A1A1A; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 7px; }
  .chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .chip { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #2C5F7A; background: rgba(44,95,122,0.12); padding: 3px 8px; border-radius: 2px; }
  .panel-features-label { font-size: 11px; font-weight: 700; color: #1A1A1A; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 5px; }
  .panel-features-text { font-size: 11px; color: #4A4A4A; line-height: 1.55; flex: 1; }
  .divider { height: 1px; background: #2C5F7A; margin: 10px 0 8px; opacity: 0.25; }
  .agent-contact { text-align: center; }
  .agent-name { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 3px; }
  .agent-info { font-size: 10px; color: #888; line-height: 1.7; }
</style></head>
<body>
<div class="page-border"></div>
<div class="layout">
  <div class="headline">Lakefront Living on Indian Lake</div>
  <div class="body-row">
    <div class="photo-col">
      <div class="hero-photo">${hero ? `<img src="${hero}" alt="">` : ''}</div>
      <div class="thumb-row">
        <div class="thumb">${t1 ? `<img src="${t1}" alt="">` : ''}</div>
        <div class="thumb">${t2 ? `<img src="${t2}" alt="">` : ''}</div>
        <div class="thumb">${t3 ? `<img src="${t3}" alt="">` : ''}</div>
      </div>
    </div>
    <div class="details-panel">
      <div class="panel-heading">Property Details</div>
      <div class="address-line">${p.address} · ${p.cityState}</div>
      <div class="panel-price">${p.price}</div>
      <div class="panel-row">Bedrooms: ${p.beds}</div>
      <div class="panel-row">Bathrooms: ${p.baths} Full</div>
      <div class="chips">
        <span class="chip">Built ${p.built}</span>
        <span class="chip">Indian Lake</span>
        <span class="chip">Sunroom</span>
        <span class="chip">Large Deck</span>
      </div>
      <div class="panel-features-label">Special Features</div>
      <div class="panel-features-text">${p.features}</div>
      <div class="divider"></div>
      <div class="agent-contact">
        <div class="agent-name">${p.agent} · ${p.brokerage}</div>
        <div class="agent-info">${p.email} · ${p.phone} · ${p.website}</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

// ── Template 2: Portrait, diagonal angled photo, blue badge, bold headline ──
function buildTemplate2(p, photos) {
  const [hero] = photos;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${p.address} — ${p.agent}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 612px; height: 816px; background: #f0f6fa; font-family: 'Jost', sans-serif; overflow: hidden; position: relative; }
  .photo-wrap { position: relative; height: 370px; overflow: hidden; }
  .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-wrap::after { content: ''; position: absolute; bottom: -1px; left: -1px; right: -1px; height: 90px; background: #f0f6fa; clip-path: polygon(0 60%, 100% 0%, 100% 100%, 0% 100%); }
  .price-badge { position: absolute; top: 24px; left: 24px; background: #2C5F7A; color: #fff; padding: 12px 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.4; clip-path: polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%); z-index: 2; }
  .price-badge .amount { font-size: 20px; display: block; margin-top: 2px; letter-spacing: 0; }
  .content { padding: 12px 36px 24px; }
  .sub-label { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #2C5F7A; margin-bottom: 6px; }
  .main-title { font-family: 'Jost', sans-serif; font-size: 44px; font-weight: 900; color: #1A1A1A; line-height: 1; text-transform: uppercase; margin-bottom: 4px; }
  .sub-title { font-size: 16px; font-weight: 400; letter-spacing: 0.15em; text-transform: uppercase; color: #5C8FA3; margin-bottom: 16px; }
  .address { font-size: 12px; color: #888; margin-bottom: 14px; }
  .description { font-size: 11px; color: #4A4A4A; line-height: 1.6; margin-bottom: 16px; border-left: 2px solid #2C5F7A; padding-left: 12px; }
  .specs { display: flex; gap: 0; margin-bottom: 20px; border: 1px solid #b8d0dc; }
  .spec { flex: 1; padding: 10px 8px; text-align: center; border-right: 1px solid #b8d0dc; }
  .spec:last-child { border-right: none; }
  .spec-val { font-size: 18px; font-weight: 700; color: #1A1A1A; display: block; }
  .spec-label { font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #888; }
  .divider { height: 1px; background: #b8d0dc; margin-bottom: 16px; }
  .agent { display: flex; align-items: center; justify-content: space-between; }
  .agent-name { font-size: 13px; font-weight: 700; color: #1A1A1A; }
  .agent-info { font-size: 10px; color: #888; line-height: 1.7; }
  .agent-contact { text-align: right; font-size: 10px; color: #888; line-height: 1.7; }
</style></head>
<body>
  <div class="photo-wrap">
    ${hero ? `<img src="${hero}" alt="">` : '<div style="background:#5C8FA3;width:100%;height:100%"></div>'}
    <div class="price-badge">Price<span class="amount">${p.price}</span></div>
  </div>
  <div class="content">
    <div class="sub-label">Lakefront · Indian Lake</div>
    <div class="main-title">Lakehouse<br>For Sale</div>
    <div class="sub-title">Dowagiac, Michigan</div>
    <div class="address">${p.address} · ${p.cityState}</div>
    <div class="description">${p.features}</div>
    <div class="specs">
      <div class="spec"><span class="spec-val">${p.beds}</span><span class="spec-label">Beds</span></div>
      <div class="spec"><span class="spec-val">${p.baths}</span><span class="spec-label">Baths</span></div>
      <div class="spec"><span class="spec-val">${p.built}</span><span class="spec-label">Built</span></div>
    </div>
    <div class="divider"></div>
    <div class="agent">
      <div>
        <div class="agent-name">${p.agent} · ${p.brokerage}</div>
        <div class="agent-info">${p.phone}</div>
      </div>
      <div class="agent-contact">${p.email}<br>${p.website}</div>
    </div>
  </div>
</body></html>`;
}

// ── Template 3: Portrait, water blue top, chevron photo, specs ──
function buildTemplate3(p, photos) {
  const [hero] = photos;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${p.address} — ${p.agent}</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 612px; height: 816px; background: #e8f2f7; font-family: 'Jost', sans-serif; overflow: hidden; display: flex; flex-direction: column; }
  .top-section { flex: 0 0 auto; padding: 36px 36px 20px; }
  .top-label { font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #5C8FA3; margin-bottom: 8px; }
  .top-title { font-size: 44px; font-weight: 900; color: #2C5F7A; text-transform: uppercase; line-height: 1; margin-bottom: 6px; }
  .top-sub { font-size: 18px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: #5C8FA3; margin-bottom: 0; }
  .photo-section { flex: 0 0 260px; position: relative; overflow: hidden; }
  .photo-section img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-section::before { content: ''; position: absolute; top: -1px; left: -1px; right: -1px; height: 60px; background: #e8f2f7; clip-path: polygon(0 0, 50% 100%, 100% 0); z-index: 2; }
  .photo-section::after { content: ''; position: absolute; bottom: -1px; left: -1px; right: -1px; height: 60px; background: #e8f2f7; clip-path: polygon(0 100%, 50% 0, 100% 100%); z-index: 2; }
  .price-overlay { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 3; text-align: center; background: rgba(28,50,70,0.85); padding: 6px 20px; border-radius: 2px; }
  .price-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.75); }
  .price-amount { font-size: 22px; font-weight: 700; color: #fff; display: block; line-height: 1.1; }
  .bottom-section { flex: 1; padding: 30px 36px 28px; display: flex; flex-direction: column; justify-content: space-between; }
  .specs { display: flex; gap: 12px; justify-content: center; margin-bottom: 16px; }
  .spec { text-align: center; background: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 2px; border: 1px solid #b8d0dc; }
  .spec-val { font-size: 22px; font-weight: 700; color: #2C5F7A; display: block; line-height: 1; }
  .spec-label { font-size: 9px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #888; }
  .address { text-align: center; font-size: 12px; color: #5C8FA3; margin-bottom: 16px; }
  .agent-row { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .agent-name { font-size: 13px; font-weight: 700; color: #2C5F7A; letter-spacing: 0.05em; }
  .agent-info { font-size: 10px; color: #888; letter-spacing: 0.04em; }
  .website { font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #2C5F7A; margin-top: 4px; }
</style></head>
<body>
  <div class="top-section">
    <div class="top-label">Indian Lake · Dowagiac, MI</div>
    <div class="top-title">For Sale</div>
    <div class="top-sub">${p.address}</div>
  </div>
  <div class="photo-section">
    ${hero ? `<img src="${hero}" alt="">` : '<div style="background:#5C8FA3;width:100%;height:100%"></div>'}
    <div class="price-overlay">
      <span class="price-label">Listed At</span>
      <span class="price-amount">${p.price}</span>
    </div>
  </div>
  <div class="bottom-section">
    <div>
      <div class="specs">
        <div class="spec"><span class="spec-val">${p.beds}</span><span class="spec-label">Beds</span></div>
        <div class="spec"><span class="spec-val">${p.baths}</span><span class="spec-label">Baths</span></div>
        <div class="spec"><span class="spec-val">${p.built}</span><span class="spec-label">Built</span></div>
      </div>
      <div class="address">${p.cityState}</div>
    </div>
    <div class="agent-row">
      <div class="agent-name">${p.agent} · ${p.brokerage}</div>
      <div class="agent-info">${p.email} · ${p.phone}</div>
      <div class="website">${p.website}</div>
    </div>
  </div>
</body></html>`;
}

// ── Template 4: Portrait, bold headline left, hex photos right, dark panel ──
function buildTemplate4(p, photos) {
  const [hero, hex1, hex2] = photos;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${p.address} — ${p.agent}</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,600;0,700;0,900;1,900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 612px; height: 816px; background: #fff; font-family: 'Jost', sans-serif; overflow: hidden; }
  .top { display: flex; height: 300px; }
  .top-left { flex: 0 0 340px; padding: 28px 20px 20px 28px; display: flex; flex-direction: column; justify-content: flex-start; }
  .headline { font-size: 36px; font-weight: 900; font-style: italic; color: #2C5F7A; text-transform: uppercase; line-height: 1.05; margin-bottom: 10px; }
  .price { font-size: 20px; font-weight: 700; color: #1A1A1A; }
  .top-right { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 10px 10px 10px 0; align-items: flex-end; }
  .hex-photo { width: 180px; height: 134px; overflow: hidden; clip-path: polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%); }
  .hex-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero-section { position: relative; height: 260px; overflow: hidden; }
  .hero-section img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero-section::after { content: ''; position: absolute; top: 0; right: -1px; bottom: -1px; width: 140px; background: #fff; clip-path: polygon(40% 0, 100% 0, 100% 100%, 0% 100%); }
  .bottom { display: flex; height: 256px; }
  .features { flex: 0 0 340px; padding: 20px 16px 16px 28px; }
  .features-title { font-size: 18px; font-weight: 900; font-style: italic; color: #1A1A1A; margin-bottom: 14px; }
  .icon-row { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
  .icon-box { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
  .icon-circle { width: 44px; height: 44px; border: 2px solid #2C5F7A; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .icon-circle svg { width: 22px; height: 22px; stroke: #2C5F7A; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .icon-label { font-size: 10px; font-weight: 600; color: #1A1A1A; text-align: center; line-height: 1.3; }
  .contact-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .contact-icon { width: 28px; height: 28px; stroke: #2C5F7A; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .contact-text { font-size: 14px; font-weight: 700; color: #2C5F7A; }
  .dark-panel { flex: 1; background: #2C5F7A; padding: 20px 18px; display: flex; flex-direction: column; justify-content: center; clip-path: polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%); }
  .dark-panel .desc { font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.65; margin-bottom: 14px; padding-left: 14px; }
  .dark-panel .agent { font-size: 10px; color: rgba(255,255,255,0.6); line-height: 1.7; padding-left: 14px; }
  .dark-panel .agent strong { color: #fff; font-size: 11px; display: block; margin-bottom: 2px; }
</style></head>
<body>
  <div class="top">
    <div class="top-left">
      <div class="headline">Life is Better at the Lake</div>
      <div class="price">Listed at ${p.price}</div>
    </div>
    <div class="top-right">
      <div class="hex-photo">${hex1 ? `<img src="${hex1}" alt="">` : ''}</div>
      <div class="hex-photo">${hex2 ? `<img src="${hex2}" alt="">` : ''}</div>
    </div>
  </div>
  <div class="hero-section">
    ${hero ? `<img src="${hero}" alt="">` : ''}
  </div>
  <div class="bottom">
    <div class="features">
      <div class="features-title">Features:</div>
      <div class="icon-row">
        <div class="icon-box">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.75-7-11a7 7 0 0 1 14 0c0 4.25-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
          </div>
          <span class="icon-label">${p.address}<br>${p.cityState}</span>
        </div>
        <div class="icon-box">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span class="icon-label">Indian Lake<br>Waterfront</span>
        </div>
        <div class="icon-box">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
          </div>
          <span class="icon-label">${p.beds} Bedrooms</span>
        </div>
        <div class="icon-box">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
          </div>
          <span class="icon-label">${p.baths} Bathrooms</span>
        </div>
      </div>
      <div class="contact-row">
        <svg class="contact-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span class="contact-text">${p.website}</span>
      </div>
    </div>
    <div class="dark-panel">
      <div class="desc">${p.features}</div>
      <div class="agent">
        <strong>${p.agent} · ${p.brokerage}</strong>
        ${p.email}<br>${p.phone}
      </div>
    </div>
  </div>
</body></html>`;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const photos = PHOTOS.map(imageToDataUri);

  const templates = [
    { name: 'flyer-54879-indian-lake-rd-1.pdf', html: buildTemplate1(PROPERTY, photos), landscape: true },
    { name: 'flyer-54879-indian-lake-rd-2.pdf', html: buildTemplate2(PROPERTY, photos), landscape: false },
    { name: 'flyer-54879-indian-lake-rd-3.pdf', html: buildTemplate3(PROPERTY, photos), landscape: false },
    { name: 'flyer-54879-indian-lake-rd-4.pdf', html: buildTemplate4(PROPERTY, photos), landscape: false },
  ];

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  for (const t of templates) {
    console.log(`Generating ${t.name}...`);
    const page = await browser.newPage();
    await page.setContent(t.html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.join(OUTPUT_DIR, t.name),
      width: t.landscape ? '1056px' : '612px',
      height: t.landscape ? '816px' : '816px',
      printBackground: true,
    });
    await page.close();
    console.log(`  ✓ ${t.name}`);
  }

  await browser.close();
  console.log('\nAll flyers generated in flyer/output/');
}

main().catch(err => { console.error(err); process.exit(1); });
