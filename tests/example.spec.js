// @ts-check
const { test } = require('@playwright/test');
// ════════════════════════════════════════════════════════
//  TEST DATA — edit only here
// ════════════════════════════════════════════════════════
const DATA = {
  fullName:    'D Siva',
  mobile:      '9882887668',
  email:       'monikanasa54@gmail.com',
  password:    'Monika@0022767788',
  designation: 'Executive Trainee (Mechanical)',
};
const PHASE2 = {
  fatherName:   'RAMESH KUMAR',
  motherName:   'LAKSHMI DEVI',
  gender:       'Male',
  category:     'UR',
  pwbd:         'NO',
  exServicemen: 'NO',
  dob:          '15/06/2003',
  dobDay:       '15',
  dobMonth:     'Jun',
  dobYear:      '2003',
  examCentre1:  'Bengaluru',
  examCentre2:  'Bhubaneswar',
  examCentre3:  'Chennai',
  corrAddress:  'FLAT 301 BLOCK A GREEN VALLEY',
  corrState:    'ANDHRA PRADESH',
  corrDistrict: 'Krishna',
  corrPin:      '520015',
  sameAddress:  true,
};
const PHASE3 = {
  universityName: 'JNTUK',
  instituteName:  'NRI Institute of Technology',
  degree:         'Mechanical Engineering',
  course:         'B.TECH',
  passingStatus:  'Passed',
  yearOfPassing:  '2022',
  percentage:     '85',
};
const PHASE4 = {
  documents: [
    { type: 'Photo *',                               file: 'C:\\my-playwright\\docs\\photo.jpg'       },
    { type: 'Signature *',                           file: 'C:\\my-playwright\\docs\\signature.jpg'   },
    { type: 'DOBproof *',                            file: 'C:\\my-playwright\\docs\\dob_proof.pdf'   },
    { type: 'EssentialQualificationPassCertificate', file: 'C:\\my-playwright\\docs\\certificate.pdf' },
    { type: 'EssentialQualificationPassMarksheet *', file: 'C:\\my-playwright\\docs\\marksheet.pdf'   },
  ],
};
// ════════════════════════════════════════════════════════
//  HELPER 1 — fillById
// ════════════════════════════════════════════════════════
/**
 * @param {import('@playwright/test').Page} page
 * @param {string} id
 * @param {string} value
 */
async function fillById(page, id, value) {
  const el = page.locator(`#${id}`);
  await el.waitFor({ state: 'visible', timeout: 15_000 });
  await el.scrollIntoViewIfNeeded();
  await el.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(value, { delay: 40 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
}
// ════════════════════════════════════════════════════════
//  HELPER 2 — solveCaptcha
// ════════════════════════════════════════════════════════
/** @param {import('@playwright/test').Page} page */
async function solveCaptcha(page) {
  const label = page.locator('text=/What is/i').first();
  await label.waitFor({ state: 'visible', timeout: 15_000 });
  const mathText = await label.innerText();
  console.log(`🧮 CAPTCHA: "${mathText}"`);
  const match = mathText.match(/(\d+)\s*([+\-])\s*(\d+)/);
  if (!match) throw new Error(`Cannot parse CAPTCHA: "${mathText}"`);
  const a = parseInt(match[1], 10), b = parseInt(match[3], 10);
  const answer = match[2] === '+' ? a + b : a - b;
  console.log(`✅ CAPTCHA answer = ${answer}`);
  await fillById(page, 'txtMathAnswer', String(answer));
}
// ════════════════════════════════════════════════════════
//  HELPER 3 — handleOtpVerification
// ════════════════════════════════════════════════════════
/**
 * @param {import('@playwright/test').Page} page
 * @param {'mobile'|'email'} type
 */
async function handleOtpVerification(page, type) {
  const isMobile = type === 'mobile';
  console.log(`📲 ${type.toUpperCase()} — clicking Send OTP...`);
  await page.locator(`#${isMobile ? 'BtnSendOtp' : 'btnemailOtp'}`).click();
  const swal = page.locator('.swal2-popup');
  await swal.waitFor({ state: 'visible', timeout: 10_000 });
  console.log(`✉️  OTP sent — clicking OK...`);
  await page.getByRole('button', { name: /^ok$/i }).click();
  await swal.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
  await page.waitForTimeout(400);
  const firstBoxId = isMobile ? 'otp1' : 'eotp_1';
  await page.locator(`#${firstBoxId}`).waitFor({ state: 'visible', timeout: 10_000 });
  console.log(`📦 OTP entry visible.`);
  const bodyText = await page.locator('body').innerText();
  const otpMatch = bodyText.match(/\b(\d{6})\b/);
  const otpCode = otpMatch ? otpMatch[1] : '';
  if (!/^\d{6}$/.test(otpCode)) {
    await page.screenshot({ path: `otp-${type}-error.png`, fullPage: true });
    throw new Error(`❌ OTP not found on page.`);
  }
  console.log(`🔑 ${type.toUpperCase()} OTP = ${otpCode}`);
  for (let i = 1; i <= 6; i++) {
    const box = page.locator(`#${isMobile ? `otp${i}` : `eotp_${i}`}`);
    await box.click({ force: true });
    await box.fill(otpCode[i - 1]);
    await page.waitForTimeout(80);
  }
  await page.locator(`#${isMobile ? 'btnVerifyOtp' : 'btnVerifyEmailOtp'}`).click();
  console.log(`✅ ${type.toUpperCase()} OTP submitted...`);
  const doneOk = page.getByRole('button', { name: /^ok$/i });
  await doneOk.waitFor({ state: 'visible', timeout: 15_000 });
  await doneOk.click();
  await page.waitForTimeout(500);
  console.log(`🎉 ${type.toUpperCase()} verified!`);
}
// ════════════════════════════════════════════════════════
//  HELPER 4 — confirmAndProceed
// ════════════════════════════════════════════════════════
/**
 * @param {import('@playwright/test').Page} page
 * @param {string} label
 */
async function confirmAndProceed(page, label) {
  const swalOk = page.getByRole('button', { name: /^ok$/i });
  if (await swalOk.isVisible().catch(() => false)) {
    await swalOk.click();
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `screenshots/confirm_${label.replace(/ /g,'_')}.png`, fullPage: false });
  const confirmBtn = page.getByRole('button', { name: /CONFIRM/i })
    .or(page.getByRole('link', { name: /CONFIRM/i }));
  await confirmBtn.first().waitFor({ state: 'visible', timeout: 20_000 });
  await confirmBtn.first().scrollIntoViewIfNeeded();
  await confirmBtn.first().click();
  await page.waitForLoadState('networkidle');
  console.log(`✅ ${label} — CONFIRM & FINAL SUBMIT clicked.`);
  await page.screenshot({ path: `screenshots/dashboard_after_${label.replace(/ /g,'_')}.png`, fullPage: false });
  const nextBtn = page.getByRole('button', { name: /Complete Application Form/i })
    .or(page.getByRole('link', { name: /Complete Application Form/i }))
    .or(page.locator('button, a').filter({ hasText: /Complete Application Form/i }));
  await nextBtn.first().waitFor({ state: 'visible', timeout: 20_000 });
  await nextBtn.first().scrollIntoViewIfNeeded();
  await nextBtn.first().click();
  await page.waitForLoadState('networkidle');
  console.log(`✅ ${label} — "Complete Application Form" clicked → next phase.`);
}
// ════════════════════════════════════════════════════════
//  HELPER 5 — fillDobCalendar
// ════════════════════════════════════════════════════════
/**
 * @param {import('@playwright/test').Page} page
 * @param {string} day
 * @param {string} month
 * @param {string} year
 */
async function fillDobCalendar(page, day, month, year) {
  const dob = page.locator('#txtdob');
  await dob.waitFor({ state: 'attached', timeout: 10_000 });
  await dob.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await dob.click({ force: true });
  await page.waitForTimeout(800);
  const calPopup = page.locator('.ajax__calendar');
  const calVisible = await calPopup.isVisible().catch(() => false);
  if (calVisible) {
    console.log('📅 Calendar opened (AjaxControlToolkit).');
    await page.locator('.ajax__calendar_title').click();
    await page.waitForTimeout(300);
    await page.locator('.ajax__calendar_title').click();
    await page.waitForTimeout(300);
    const decadePrefix = year.slice(0, 3);
    for (let i = 0; i < 20; i++) {
      const title = await page.locator('.ajax__calendar_title').innerText().catch(() => '');
      if (title.includes(year) || title.includes(decadePrefix)) break;
      const titleYear = parseInt(title.match(/\d{4}/)?.[0] || '2000', 10);
      const btn = parseInt(year, 10) < titleYear
        ? page.locator('.ajax__calendar_prev')
        : page.locator('.ajax__calendar_next');
      await btn.first().click();
      await page.waitForTimeout(250);
    }
    await page.locator('.ajax__calendar_year').filter({ hasText: new RegExp(`^${year}$`) }).click();
    await page.waitForTimeout(300);
    await page.locator('.ajax__calendar_month').filter({ hasText: new RegExp(`^${month}`) }).click();
    await page.waitForTimeout(300);
    await page.locator('.ajax__calendar_day').filter({ hasText: new RegExp(`^${day}$`) }).click();
    await page.waitForTimeout(400);
  } else {
    console.log('⚠️  Calendar did not open — using direct value + __doPostBack fallback.');
    const monthMap = /** @type {Record<string,string>} */ ({ 
      Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
      Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' 
    });
    const mm = monthMap[month] || month;
    const dateValue = `${day.padStart(2,'0')}/${mm}/${year}`;
    await page.evaluate((val) => {
      const el = /** @type {HTMLInputElement|null} */ (document.getElementById('txtdob'));
      if (!el) return;
      el.value = val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur',   { bubbles: true }));
      if (typeof /** @type {any} */ (window).__doPostBack === 'function') {
        setTimeout(() => /** @type {any} */ (window).__doPostBack(el.name, ''), 0);
      }
    }, dateValue);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  }
  const val = await dob.inputValue().catch(() => '?');
  console.log(`✅ DOB set = "${val}"`);
}
// ════════════════════════════════════════════════════════
//  MAIN TEST
// ════════════════════════════════════════════════════════
test('🚀 BLCL Registration — Full Automation', async ({ page, context }) => {
  test.setTimeout(300_000);
  const fs = require('fs');
  fs.mkdirSync('screenshots', { recursive: true });
  // ── STEP 1: Navigate ──────────────────────────────────────────────────────
  await page.goto('https://test.cbexams.com/EDPSU/BLCL/Registration/RegStep', {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});

// Extra wait for safety (important for CI)
await page.waitForTimeout(5000);  

// ── STEP 2-3: New Registration → Prospectus ───────────────────────────────
 // ── STEP 2-3: New Registration → Prospectus ───────────────────────────────

// Wait for page to load properly
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);

// Wait for "New Registration / Login" button
await page.waitForSelector('text=New Registration / Login', { timeout: 60000 });

// Click it safely
await page.locator('text=New Registration / Login').click();

// Small wait for next page
await page.waitForTimeout(3000);

// Wait for "New Registration"
await page.waitForSelector('text=New Registration', { timeout: 60000 });

// Click it
await page.locator('text=New Registration').click();

// Wait again
await page.waitForTimeout(3000);

// Handle Prospectus (new tab)
const [pdfTab] = await Promise.all([
  page.context().waitForEvent('page'),
  page.locator('text=Prospectus').click(),
]);

// Wait for PDF tab to load
await pdfTab.waitForLoadState('domcontentloaded');

// Close tab
await pdfTab.close();

console.log('📄 Prospectus tab closed.');

  // ── STEP 4: Agree & Proceed (Modal) ───────────────────────────────────────
  // First checkbox with ID #Chkdec (in modal) - use specific context
  await page.locator('#Chkdec').first().check({ force: true });
  await page.locator('#btnProceedModal').click();
  await page.waitForLoadState('networkidle');
  // ── STEP 5-12: Fill registration form ────────────────────────────────────
  await fillById(page, 'txtfirstname', DATA.fullName);
  await page.locator('#ddlpost').selectOption({ label: DATA.designation });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await fillById(page, 'txtmobilenumber',    DATA.mobile);
  await fillById(page, 'txtconmobilenumber', DATA.mobile);
  await fillById(page, 'txtemailid',         DATA.email);
  await fillById(page, 'txtconemailid',      DATA.email);
  await fillById(page, 'txtpassword',        DATA.password);
  await fillById(page, 'txtconpassword',     DATA.password);
  // ── STEP 13-14: CAPTCHA ───────────────────────────────────────────────────
  await page.locator('#chkCaptcha').check({ force: true });
  await page.waitForTimeout(800);
  console.log('☑ Human applicant ticked.');
  try {
    await solveCaptcha(page);
  } catch (/** @type {any} */ err) {
    await page.screenshot({ path: 'screenshots/captcha-error.png', fullPage: true });
    throw err;
  }
  // ── STEP 15-16: Declaration & Submit ─────────────────────────────────────
  // FIX: Use .last() to target the visible declaration checkbox on the form
  // (avoiding duplicate ID #Chkdec from the modal)
  const declBtn = page.locator('input[type="checkbox"]').last();
  await declBtn.scrollIntoViewIfNeeded();
  await declBtn.evaluate((el) => {
    const cb = /** @type {HTMLInputElement} */ (el);
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
  });
  console.log('☑ Declaration ticked.');
  await page.locator('#BtnSubmit').click();
  await page.waitForLoadState('networkidle');
  console.log('📋 Review page loaded.');
  // ── STEP 17: Commit & Register ────────────────────────────────────────────
  const commitBtn = page.locator(
    '#BtnCommit, #btnCommit, button:has-text("COMMIT"), a:has-text("COMMIT")'
  ).first();
  await commitBtn.waitFor({ state: 'visible', timeout: 20_000 });
  await commitBtn.scrollIntoViewIfNeeded();
  await commitBtn.click();
  await page.waitForURL('**/otpverification**', { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#BtnSendOtp').waitFor({ state: 'visible', timeout: 20_000 });
  console.log('✅ OTP page: ' + page.url());
  // ── STEP 18-19: OTP Verification ─────────────────────────────────────────
  await handleOtpVerification(page, 'mobile');
  await handleOtpVerification(page, 'email');
  // ── STEP 20: Start Application Form ──────────────────────────────────────
  const startBtn = page.getByRole('button', { name: 'Start Application Form' });
  await startBtn.waitFor({ state: 'visible', timeout: 20_000 });
  await startBtn.scrollIntoViewIfNeeded();
  await startBtn.click();
  await page.waitForLoadState('networkidle');
  console.log('✅ Application Form started! URL: ' + page.url());
  // ══════════════════════════════════════════════════════════════════════════
  //  PHASE 02 — Candidate Profile
  // ══════════════════════════════════════════════════════════════════════════
  await page.waitForLoadState('networkidle');
  console.log('\n═══ PHASE 02: Candidate Profile ═══');
  await fillById(page, 'txtfathername', PHASE2.fatherName);
  console.log("✅ Father's Name = " + PHASE2.fatherName);
  await fillById(page, 'txtmothername', PHASE2.motherName);
  console.log("✅ Mother's Name = " + PHASE2.motherName);
  await page.locator('#ddlgender').selectOption({ label: PHASE2.gender });
  await page.waitForTimeout(300);
  console.log(`✅ Gender = ${PHASE2.gender}`);
  await page.locator('#ddlcategory').selectOption({ label: PHASE2.category });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  console.log(`✅ Category = ${PHASE2.category}`);
  await page.locator('#ddlpwd').selectOption({ label: PHASE2.pwbd });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  console.log(`✅ PwBD = ${PHASE2.pwbd}`);
  await page.locator('#ddlexman').selectOption({ label: PHASE2.exServicemen });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  console.log(`✅ Ex-Servicemen = ${PHASE2.exServicemen}`);
  await fillDobCalendar(page, PHASE2.dobDay, PHASE2.dobMonth, PHASE2.dobYear);
  await page.waitForLoadState('networkidle');
  await page.locator('#ddlExamCentre1').selectOption({ label: PHASE2.examCentre1 });
  await page.waitForTimeout(400);
  await page.locator('#ddlExamCentre2').selectOption({ label: PHASE2.examCentre2 });
  await page.waitForTimeout(400);
  await page.locator('#ddlExamCentre3').selectOption({ label: PHASE2.examCentre3 });
  await page.waitForTimeout(400);
  console.log('✅ Exam Centres selected.');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await fillById(page, 'txtcaddress', PHASE2.corrAddress);
  console.log('✅ Correspondence address filled.');
  await page.locator('#ddlcstates').selectOption({ label: PHASE2.corrState });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  console.log(`✅ State = ${PHASE2.corrState}`);
  await page.locator('#ddlcdistricts').selectOption({ label: PHASE2.corrDistrict });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  console.log(`✅ District = ${PHASE2.corrDistrict}`);
  await fillById(page, 'txtcpincode', PHASE2.corrPin);
  console.log(`✅ Pin = ${PHASE2.corrPin}`);
  if (PHASE2.sameAddress) {
    await page.locator('#chekaddress').check({ force: true });
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    console.log('✅ Same address ticked — permanent auto-filled.');
  }
  const chk2 = page.locator('input[type="checkbox"]').last();
  await chk2.scrollIntoViewIfNeeded();
  await chk2.evaluate((el) => {
    const cb = /** @type {HTMLInputElement} */ (el);
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
  });
  console.log('✅ Declaration ticked.');
  await page.screenshot({ path: 'screenshots/phase02_filled.png', fullPage: true });
  await page.getByRole('link', { name: /SAVE.*PROCEED/i }).click();
    await page.waitForLoadState('networkidle');
  console.log('\n🚀 Phase 02 SAVED! Confirmation page loading...');
  await page.screenshot({ path: 'screenshots/phase02_done.png', fullPage: false });
  await confirmAndProceed(page, 'Phase 02');
  console.log('\n═══ PHASE 03: Academic Record ═══');
  console.log('URL: ' + page.url());
  await page.screenshot({ path: 'screenshots/phase03_start.png', fullPage: false });
  // ══════════════════════════════════════════════════════════════════════════
  //  PHASE 03 — Educational Details
  // ══════════════════════════════════════════════════════════════════════════
  const p3inputs = page.locator('input[type="text"], input:not([type])');
  const p3selects = page.locator('select');
  const univInput = p3inputs.nth(0);
  await univInput.waitFor({ state: 'attached', timeout: 15_000 });
  await univInput.scrollIntoViewIfNeeded();
  await univInput.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.type(PHASE3.universityName, { delay: 40 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  console.log(`✅ University = ${PHASE3.universityName}`);
  const instInput = p3inputs.nth(1);
  await instInput.waitFor({ state: 'attached', timeout: 10_000 });
  await instInput.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.type(PHASE3.instituteName, { delay: 40 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  console.log(`✅ Institute = ${PHASE3.instituteName}`);
  await p3selects.nth(0).selectOption({ label: PHASE3.degree });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  console.log(`✅ Degree = ${PHASE3.degree}`);
  await p3selects.nth(1).selectOption({ label: PHASE3.course });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  console.log(`✅ Course = ${PHASE3.course}`);
  await p3selects.nth(2).selectOption({ label: PHASE3.passingStatus });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  console.log(`✅ Passing Status = ${PHASE3.passingStatus}`);
  await p3selects.nth(3).selectOption({ label: PHASE3.yearOfPassing });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  console.log(`✅ Year of Passing = ${PHASE3.yearOfPassing}`);
  const pctInput = p3inputs.nth(2);
  await pctInput.waitFor({ state: 'attached', timeout: 10_000 });
  await pctInput.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.type(PHASE3.percentage, { delay: 40 });
  await page.keyboard.press('Tab'); // Triggers the ASP.NET onblur AutoPostBack
  
  // ── FIX: VERY LONG WAIT FOR UPDATE-PANEL ──
  // The website shows a loading spinner after the Percentage field hits Tab.
  // We MUST wait for this spinner to completely disappear, otherwise the DOM 
  // wipes out our checkbox right before we submit!
  console.log(`⏳ Waiting 3.5s for ASP.NET background loading to complete...`);
  await page.waitForTimeout(3500); 
  console.log(`✅ Percentage = ${PHASE3.percentage} (Loading completed)`);

  // ── FIX: AGGRESSIVE BROWSER-LEVEL TICKING ──
  // Inject Javascript directly into the browser to tick the box. This completely
  // bypasses Playwright's hit-box coordinate locator which was missing the mark.
  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      if (cb instanceof HTMLInputElement) {
        const rect = cb.getBoundingClientRect();
        // Only tick boxes that are visibly rendered on the screen!
        if (rect.width > 0 && rect.height > 0) {
          if (!cb.checked) {
              cb.click(); // trigger native ASP.NET handlers
          }
          cb.checked = true; // force the property true unconditionally
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  });
  
  await page.waitForTimeout(500);
  console.log('✅ Phase 03 Declaration ticked aggressively.');
  await page.screenshot({ path: 'screenshots/phase03_filled.png', fullPage: true });
  await page.getByRole('link', { name: /SAVE.*PROCEED/i }).click();
  await page.waitForLoadState('networkidle');
  console.log('\n🚀 Phase 03 SAVED! Confirmation page loading...');
  await confirmAndProceed(page, 'Phase 03');
  console.log('\n═══ PHASE 04: Document Upload ═══');
  console.log('URL: ' + page.url());
  await page.screenshot({ path: 'screenshots/phase04_start.png', fullPage: true });
  // ══════════════════════════════════════════════════════════════════════════
  //  PHASE 04 — Digital Archives
  // ══════════════════════════════════════════════════════════════════════════
  const docTypeSelect = page.locator('#ddldocuments');
  const fileInput     = page.locator('input[type="file"]').first();
  const uploadBtn     = page.getByRole('button', { name: /^UPLOAD$/i });
  for (const doc of PHASE4.documents) {
    console.log(`📎 Uploading: ${doc.type}...`);
    await docTypeSelect.selectOption({ label: doc.type });
    await page.waitForTimeout(400);
    await fileInput.setInputFiles(doc.file, { noWaitAfter: true });
    await page.waitForTimeout(400);
    await uploadBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const swalOk = page.getByRole('button', { name: /^ok$/i });
    if (await swalOk.isVisible().catch(() => false)) {
      await swalOk.click();
      await page.waitForTimeout(300);
    }
    console.log(`✅ ${doc.type} uploaded.`);
    const safeName = doc.type.replace(/[* ]/g, '_');
    await page.screenshot({ path: `screenshots/upload_${safeName}.png`, fullPage: false });
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // ── FIX: AGGRESSIVE BROWSER-LEVEL TICKING FOR PHASE 04 ──
  // Do not use .last() because it targets hidden SweetAlert internal checkboxes!
  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      if (cb instanceof HTMLInputElement) {
        const rect = cb.getBoundingClientRect();
        // Only target the visibly rendered declaration checkbox!
        if (rect.width > 0 && rect.height > 0) {
          if (!cb.checked) cb.click();
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  });

  console.log('✅ Phase 04 Declaration ticked aggressively.');
  await page.screenshot({ path: 'screenshots/phase04_filled.png', fullPage: true });
  const submitBtn = page.getByRole('button', { name: /^Submit$/i });
  await submitBtn.waitFor({ state: 'visible', timeout: 15_000 });
  await submitBtn.scrollIntoViewIfNeeded();
  await submitBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(60_000);
  console.log('\n🚀 Phase 04 DONE! URL: ' + page.url());
  await page.screenshot({ path: 'screenshots/phase04_done.png', fullPage: true });
});
