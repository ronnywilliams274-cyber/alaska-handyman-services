const fs = require('node:fs');
const path = require('node:path');
const pages = ['index.html', 'services.html', 'projects.html', 'about.html', 'service-areas.html', 'estimate.html'];
const root = path.resolve(__dirname, '..');
const recipient = 'alaskahandymanservices907@gmail.com';

function blockEnd(html, start, tag = 'div') {
  const re = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'g');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (!depth) return re.lastIndex;
  }
  throw new Error(`Unclosed ${tag}`);
}
function removeBlock(html, pattern) {
  const match = pattern.exec(html);
  return match ? html.slice(0, match.index) + html.slice(blockEnd(html, match.index)) : html;
}
function disclose(html, className, label) {
  const re = new RegExp(`<div class="${className}">`, 'g');
  let match;
  while ((match = re.exec(html))) {
    const end = blockEnd(html, match.index);
    const content = html.slice(match.index, end);
    const replacement = `<details class="service-details"><summary>${label}</summary>\n${content}\n</details>`;
    html = html.slice(0, match.index) + replacement + html.slice(end);
    re.lastIndex = match.index + replacement.length;
  }
  return html;
}
function estimateSection(isEstimate) {
  const h = isEstimate ? 'h1' : 'h2';
  return `<section class="lead-form-section${isEstimate ? ' estimate-page-section' : ''}" id="contact" aria-labelledby="estimateHeading">
  <div class="estimate-console" id="estimateConsole">
    <div class="estimate-sidebar">
      <div>
        <${h} id="estimateHeading">Let's talk about your project.</${h}>
        <p class="estimate-sidebar-desc">Tell us what needs doing. We'll follow up to discuss the details and arrange your free, no-obligation estimate.</p>
        <p class="estimate-credentials">Licensed, bonded &amp; insured<br>Alaska contractor license #143470</p>
      </div>
      <div class="estimate-direct-box">
        <p>Prefer to email us?</p>
        <a href="mailto:${recipient}" class="edb-email">${recipient}</a>
        <p class="form-help">Need urgent help? Call <a href="tel:+19077448725">(907) 744-8725</a>.</p>
      </div>
    </div>
    <div class="estimate-form-pane">
      <h2 class="form-section-heading">Request a free estimate</h2>
      <p class="form-intro" id="formHelp">Fields marked * are required. Photos aren't needed to get started.</p>
      <form id="leadForm" action="https://formsubmit.co/${recipient}" method="POST" aria-describedby="formHelp">
        <input type="hidden" name="_subject" value="New estimate request — Alaska Handyman Services">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <div class="form-honeypot" aria-hidden="true"><label for="website">Leave this field blank</label><input id="website" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="form-grid">
          <div class="form-group"><label for="fname">First name *</label><input id="fname" name="first_name" autocomplete="given-name" maxlength="100" required></div>
          <div class="form-group"><label for="lname">Last name *</label><input id="lname" name="last_name" autocomplete="family-name" maxlength="100" required></div>
          <div class="form-group"><label for="phone">Phone number *</label><input type="tel" id="phone" name="phone" autocomplete="tel" maxlength="40" required></div>
          <div class="form-group"><label for="email">Email address *</label><input type="email" id="email" name="email" autocomplete="email" maxlength="254" required></div>
          <div class="form-group"><label for="service">Service needed *</label><select id="service" name="service" required>
            <option value="">Choose a service</option>
            <option value="Roof Repair">Roof repair &amp; weatherproofing</option>
            <option value="Drywall Repair">Drywall repair &amp; texture matching</option>
            <option value="Painting">Interior &amp; exterior painting</option>
            <option value="Cabinets &amp; Installs">Cabinets &amp; installs</option>
            <option value="Flooring">Flooring installation &amp; repair</option>
            <option value="House &amp; Pressure Washing">House &amp; pressure washing</option>
            <option value="Bathroom Remodelling">Bathroom remodeling &amp; tile</option>
            <option value="Repairs &amp; Maintenance">Repairs &amp; maintenance</option>
            <option value="Full Renovations &amp; Remodeling">Full renovations &amp; remodeling</option>
            <option value="Other / Emergency Assistance">Other / emergency assistance</option>
          </select></div>
          <div class="form-group"><label for="location">Service area *</label><select id="location" name="location" required>
            <option value="">Choose your area</option><option>Anchorage</option><option>Eagle River</option><option>Chugiak</option><option>Girdwood</option><option>Bird Creek</option><option>Indian</option><option>Surrounding Area</option>
          </select></div>
          <div class="form-group form-group-wide"><label for="message">Tell us about your project <span>(optional)</span></label><textarea id="message" name="message" rows="4" maxlength="5000" placeholder="What needs fixing or updating? Include any details that will help us understand the job."></textarea></div>
          <div class="form-group form-group-wide"><label for="timeline">Preferred timing <span>(optional)</span></label><select id="timeline" name="timeline">
            <option value="Flexible / Standard">I'm flexible</option><option value="Within This Week">Within this week</option><option value="As Soon As Possible">As soon as possible</option><option value="Urgent / 24-7 Emergency">Urgent — I'll also call</option>
          </select></div>
        </div>
        <div class="form-error" id="formError" role="alert" tabindex="-1" hidden><p id="formErrorMessage"></p><p>You can email your project details to <a href="mailto:${recipient}">${recipient}</a>.</p></div>
        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        <div class="estimate-submit-bar"><button type="submit" class="form-submit">Request a free estimate</button></div>
        <p class="form-help">Your request is sent to Alaska Handyman Services. We'll use your contact details to respond about your project.</p>
      </form>
      <div class="form-success" id="formSuccess" role="status" tabindex="-1" hidden><h3>Your request has been sent.</h3><p>Thank you for getting in touch. We'll follow up using the contact details you provided.</p></div>
    </div>
  </div>
</section>`;
}

fs.mkdirSync(path.join(root, '.review', 'original'), { recursive: true });
for (const file of [...pages, 'main.js', 'styles.css']) {
  const dest = path.join(root, '.review', 'original', file);
  if (!fs.existsSync(dest)) fs.copyFileSync(path.join(root, file), dest);
}
for (const file of pages) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  if (file === 'index.html') {
    const css = /<style>([\s\S]*?)<\/style>/.exec(html);
    fs.writeFileSync(path.join(root, 'home.css'), css[1].trim() + '\n');
    html = html.replace(css[0], '<link rel="stylesheet" href="home.css">');
    html = html.replace(/<script>[^]*?<\/script>/, '<script src="main.js" defer></script>');
    html = removeBlock(html, /<div class="mobile-thumb-dock"[^>]*>/);
    html = html.replace(/<!-- CALL TO ACTION -->\s*<section class="cta">[\s\S]*?<\/section>/, '');
    html = html.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>Reliable home repairs.<br>Made for Alaska.</h1>');
    html = html.replace(/<p class="hero-sub">[^]*?<\/p>/, '<p class="hero-sub">Repairs, maintenance, and renovations in Anchorage and nearby communities. Local service, clear estimates, and care for your home.</p>');
    html = html.replace(/\s*<a[^>]*hero-btn-tertiary[^>]*>[^]*?<\/a>/, '');
    html = disclose(html, 'service-pills', 'What we can help with');
  }
  html = removeBlock(html, /<div class="whatsapp-widget"[^>]*>/);
  html = html.replace(/<!-- FLOATING WHATSAPP INSTANT DISPATCH -->/g, '');
  html = html.replace(/<!-- MOBILE THUMB-ZONE CONVERSION DOCK \(ACTIVE ON SCROLL\) -->/g, '');
  html = html.replace(/<section class="lead-form-section"[\s\S]*?<\/section>/, estimateSection(file === 'estimate.html'));
  html = html.replace('</head>', '<link rel="stylesheet" href="hierarchy.css">\n<script src="lead-form.js" defer></script>\n</head>');
  html = html.replace('<body>', '<body>\n<a href="#mainContent" class="skip-link">Skip to content</a>');
  const mainStart = html.indexOf(file === 'index.html' ? '<!-- HERO -->' : file === 'estimate.html' ? '<!-- ABOVE-THE-FOLD' : '<!-- PAGE HERO -->');
  if (mainStart < 0) throw new Error(`Main marker missing: ${file}`);
  html = html.slice(0, mainStart) + '<main id="mainContent" tabindex="-1">\n' + html.slice(mainStart);
  html = html.replace('<!-- FOOTER -->', '</main>\n\n<!-- FOOTER -->');
  html = html.replace(/<div class="hero-eyebrow">[\s\S]*?<\/div>/, '<p class="hero-eyebrow">Licensed, bonded &amp; insured in Anchorage, Alaska</p>');
  html = removeBlock(html, /<div class="hero-trust-strip">/);
  html = html.replace(/(<a[^>]*class="(?:btn-cinematic|nav-cta)"[^>]*>)[^<]*[Ee]stimate[^<]*(<\/a>)/g, '$1Request a free estimate$2');
  html = html.replace(/(<a[^>]*class="btn-outline"[^>]*>)[^<]*(907)[^<]*(<\/a>)/g, '$1Call (907) 744-8725$3');
  html = html.replace(/(<a[^>]*class="nav-phone-chip"[^>]*>)📞 /g, '$1');
  html = html.replace(/(<a[^>]*class="subnav-pill"[^>]*>)\d+\. /g, '$1');
  html = html.replace(/(<span class="ssc-badge">)\d+ • /g, '$1');
  html = html.replace(/<span class="service-free-tag">[^]*?<\/span>/g, '');
  html = html.replace(/<div class="embra-credit-wrap">[\s\S]*?<\/div>/g, '<div class="embra-credit-wrap"><a class="embra-credit-pill" href="https://embratechnologies.org" target="_blank" rel="noopener noreferrer">Website by Embra Technologies</a></div>');
  html = disclose(html, 'ssc-checklist', file === 'about.html' ? 'Our credentials and commitments' : "What's included");
  const titles = {
    'services.html': 'Handyman services for Alaska homes.',
    'projects.html': 'Repairs that make a difference.',
    'about.html': 'Local people. Work you can count on.',
    'service-areas.html': 'Serving Anchorage and our neighbors.'
  };
  if (titles[file]) html = html.replace(/<h1>[^]*?<\/h1>/, `<h1>${titles[file]}</h1>`);
  html = html.replace('Core Trade Divisions', 'Find the right service')
    .replace('Our Ironclad Guarantees', 'Our commitments to you')
    .replace('Step 01 • Prompt Dispatch Review', '1. We review your request')
    .replace('Step 02 • Clear Written Free Estimate', '2. We prepare your estimate')
    .replace('Step 03 • Punctual Execution &amp; Clean-Up', '3. We schedule the work')
    .replace('Click your community below to pre-select your location in our 100% Free Estimate console.', 'Choose your community to start a free estimate. Your location will be filled in for you.');
  fs.writeFileSync(path.join(root, file), html);
}
console.log(`Refined ${pages.length} pages; original sources retained in .review/original.`);
