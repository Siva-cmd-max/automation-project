# AUTOMATED CANDIDATE REGISTRATION PIPELINE
A highly advanced, fully autonomous 4-Phase End-to-End Registration Flow for BLCL using Playwright.
---
## OVERVIEW
This robust automation engineering project is built with Node.js and Playwright. It is meticulously designed to autonomously orchestrate tests against complex, legacy ASP.NET WebForms-based application portals with sheer precision. 
The script navigates seamlessly through a strict multi-phase Candidate Registration Pipeline (BLCL). It features advanced, state-of-the-art bypass logic for legacy web elements, real-time OTP scraping, and dynamic mathematical CAPTCHA evaluation.
---
## SUPERCHARGED FEATURES
### Automated CAPTCHA Evaluation
Intelligently parses dynamic text nodes to capture and mathematically solve security riddles on the fly.
### Smart OTP Interception
Injects custom logic to scrape mock OTPs (Mobile & Email) directly from the testing page payload/DOM, completely eradicating human interaction.
### Advanced ASP.NET Lifecycle Mastery
Employs specialized timing mechanisms and bypasses—like `__doPostBack` fallback calls—to flawlessly outmaneuver complex ASP.NET UpdatePanels and invisible background spinners.
### Custom Ajax Calendar Engine
Safely bypasses the frustrating UI constraints of classic AjaxControlToolkit Calendars with aggressive, programmatic DOM overrides.
### Aggressive Checkbox Bypassing
Deploys custom JavaScript injected directly into the browser context to forcefully tick buried or non-interactable UI elements, circumventing strict visibility limitations.
### Automated Document Archival
Sequentially manages multi-file bulk uploads mapped specifically to candidate credential requirements.
---
## THE 4-PHASE ARCHITECTURE BREAKDOWN
### Phase 1: Profile Initialization & Authentication
* Bulk ingestion of preliminary identity data.
* Dynamic mathematical CAPTCHA computation.
* Dual-factor authentication logic via OTP scraping.
### Phase 2: Candidate Bio-Data Processing
* Precise handling of deep dropdown structures and conditional logic.
* Ajax Date of Birth insertion protocols.
* Seamless address routing mapping.
### Phase 3: Academic Record Synthesis
* Rapid multi-field matrix population for historical degrees.
* Explicit thread-wait definitions protecting state against ASP.NET partial page reloads.
### Phase 4: Document Upload Sequence
* Dynamic linking of system pathways (the `docs/` architecture) to web container endpoints.
* Handles aggressive pop-ups and SweetAlert intercepts frame-by-frame.
* Submits the final master payload.
---
## TECH STACK
* **Core Engine:** Playwright
* **Runtime:** Node.js
* **Synthesizers:** @faker-js/faker, dotenv
---
## SETUP & DEPLOYMENT GUIDE
### 1. Establish Repository
```bash
git clone <your-repository-url>
cd my-playwright
```
### 2. Initialize Node Environment
```bash
npm install
```
### 3. Provision the Digital Archives
Ensure the following static testing assets are prepared in the root `docs/` folder:
* photo.jpg
* signature.jpg
* dob_proof.pdf
* certificate.pdf
* marksheet.pdf
### 4. Ignite the Pipeline
Playwright offers multiple ways to run your automation suite depending on your needs. 
**Run the entire suite (with a visible browser):**
```bash
npx playwright test --headed
```
**Run a specific, particular test file:**
```bash
npx playwright test tests/example.spec.js --headed
```
**Run in the background (Headless Mode, no UI):**
```bash
npx playwright test
```
**View the comprehensive HTML Test Report:**
```bash
npx playwright show-report
```
---
## INTELLIGENT AUDITING (SCREENSHOTS)
This project has an auto-auditing feature. It retains visual evidence across the process execution cycle and stores it inside the `/screenshots/` catalog. It ensures zero-trust validation for:
* **Form Phase commits** (e.g., `dashboard_after_Phase_02.png`)
* **Individual file upload receipts** (e.g., `upload_Signature__.png`)
* **Error capturing** (e.g., failed CAPTCHA matrices)
---
**Disclaimer**: This tool targets a specific testing sandbox (`test.cbexams.com`). Always ensure you have appropriate authorization to execute E2E data payloads against target APIs and host systems.
