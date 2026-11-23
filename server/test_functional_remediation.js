const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { submitContactForm } = require('./src/controllers/contactController');
const { verifyImageMagicBytes } = require('./src/controllers/productController');
const { requireAdminAuth } = require('./src/middleware/auth');
const { signSessionToken } = require('./src/utils/security');
const { generateEnquiryPDF } = require('./src/utils/pdfGenerator');
const { createEnquiry } = require('./src/controllers/enquiryController');
const { validateEnvironment } = require('./src/config/envCheck');

console.log('================================================================');
console.log('🧪 PRAZTECH® FUNCTIONAL REMEDIATION VERIFICATION SUITE');
console.log('================================================================');

let passCount = 0;
let failCount = 0;

function assert(testId, description, condition) {
  if (condition) {
    console.log(`✅ [TEST ${testId}] PASS: ${description}`);
    passCount++;
  } else {
    console.error(`❌ [TEST ${testId}] FAIL: ${description}`);
    failCount++;
  }
}

const mockRes = () => {
  let statusCode = 200;
  let jsonBody = null;
  return {
    status: function(code) { statusCode = code; return this; },
    json: function(data) { jsonBody = data; return this; },
    getStatus: () => statusCode,
    getBody: () => jsonBody
  };
};

async function runAllTests() {
  // -------------------------------------------------------------------------
  // 1. Contact form with valid information
  // -------------------------------------------------------------------------
  const res1 = mockRes();
  const validContactReq = {
    body: {
      name: 'Ramesh Sharma',
      email: 'ramesh.sharma@precisionheads.com',
      phone: '+91 9811122334',
      company: 'Precision Cylinder Head Rebuilders',
      message: 'Inquiring regarding custom valve guide reamers (5.5mm and 6.0mm) and high-speed grinding stones.'
    },
    ip: '127.0.0.1'
  };
  await submitContactForm(validContactReq, res1, () => {});
  const body1 = res1.getBody();
  assert(1, 'Contact form with valid information returns 201 Created and success: true', res1.getStatus() === 201 && body1.success === true);

  // Check file persistence in data/contacts
  const contactsDir = path.join(__dirname, 'data/contacts');
  const files1 = fs.readdirSync(contactsDir);
  assert('1b', 'Contact message safely persisted to disk storage fallback in server/data/contacts', files1.length > 0);

  // -------------------------------------------------------------------------
  // 2. Contact form with invalid email
  // -------------------------------------------------------------------------
  const res2 = mockRes();
  const invalidEmailReq = {
    body: {
      name: 'Test Sender',
      email: 'not-an-email-address',
      message: 'This message should be rejected due to malformed email address.'
    },
    ip: '127.0.0.1'
  };
  await submitContactForm(invalidEmailReq, res2, () => {});
  assert(2, 'Contact form with invalid email returns 400 Bad Request', res2.getStatus() === 400 && res2.getBody().success === false);

  // -------------------------------------------------------------------------
  // 3. Contact form with empty required fields
  // -------------------------------------------------------------------------
  const res3 = mockRes();
  const emptyReq = {
    body: {
      name: '',
      email: '',
      message: ''
    },
    ip: '127.0.0.1'
  };
  await submitContactForm(emptyReq, res3, () => {});
  assert(3, 'Contact form with empty required fields returns 400 with validation errors', res3.getStatus() === 400 && res3.getBody().errors.length >= 3);

  // -------------------------------------------------------------------------
  // 4. Contact form message too short
  // -------------------------------------------------------------------------
  const res4 = mockRes();
  const shortMsgReq = {
    body: {
      name: 'Raj',
      email: 'raj@workshop.com',
      message: 'short'
    },
    ip: '127.0.0.1'
  };
  await submitContactForm(shortMsgReq, res4, () => {});
  assert(4, 'Contact form message under 10 characters rejected with 400', res4.getStatus() === 400);

  // -------------------------------------------------------------------------
  // 5. Contact form with SMTP unavailable (reports explicitly, no fake email success)
  // -------------------------------------------------------------------------
  const origProvider = process.env.EMAIL_PROVIDER;
  const origPass = process.env.SMTP_PASS;
  process.env.EMAIL_PROVIDER = 'smtp';
  process.env.SMTP_PASS = '';

  const res5 = mockRes();
  await submitContactForm(validContactReq, res5, () => {});
  const body5 = res5.getBody();
  assert(5, 'When SMTP credentials missing, reports explicitly in emailNotice without fake delivery', 
    res5.getStatus() === 201 && body5.emailNotice && body5.emailNotice.includes('SMTP'));

  // Restore env
  process.env.EMAIL_PROVIDER = origProvider || 'mock';
  process.env.SMTP_PASS = origPass;

  // -------------------------------------------------------------------------
  // 6. Successful enquiry PDF generation & download
  // -------------------------------------------------------------------------
  const testPdfDir = path.join(__dirname, 'data/pdfs');
  if (!fs.existsSync(testPdfDir)) fs.mkdirSync(testPdfDir, { recursive: true });
  const samplePdfPath = path.join(testPdfDir, 'Test_Enquiry_PDF.pdf');

  const sampleEnquiry = {
    referenceNumber: 'ENQ-2026-TEST01',
    submittedAt: new Date().toISOString(),
    customerSnapshot: {
      fullName: 'Vikram Mehta',
      company: 'Mehta Motor Works',
      email: 'mehta@test.com',
      phone: '+91 9822334455',
      country: 'India',
      state: 'Maharashtra',
      city: 'Pune',
      gstin: '27AAAAA0000A1Z5'
    },
    catalogueItems: [
      {
        modelNo: 'PSH-VGKP',
        name: 'Valve Seat Grinding Kit',
        quantity: 2,
        selectedSubModel: { sizeMm: '45mm', stoneColor: 'Ruby Pink' }
      }
    ],
    generalNotes: 'Please quote air freight to Pune workshop.'
  };

  await generateEnquiryPDF(sampleEnquiry, samplePdfPath);
  const pdfExists = fs.existsSync(samplePdfPath);
  const pdfSize = pdfExists ? fs.statSync(samplePdfPath).size : 0;
  assert(6, 'Backend PDF generation produces valid non-empty PDF file', pdfExists && pdfSize > 1000);
  if (pdfExists) fs.unlinkSync(samplePdfPath);

  // -------------------------------------------------------------------------
  // 7. Client-side PDF fallback validation
  // -------------------------------------------------------------------------
  // Verify clientPdfGenerator file exists and exports generator function
  const clientGenPath = path.resolve(__dirname, '../client/src/utils/clientPdfGenerator.ts');
  const clientGenContent = fs.readFileSync(clientGenPath, 'utf8');
  assert(7, 'Client-side PDF fallback utility implemented with jsPDF and complete industrial layout', 
    clientGenContent.includes('generateClientSideEnquiryPDF') && clientGenContent.includes('jsPDF') && clientGenContent.includes('PRAZTECH® ENGINEERING'));

  // -------------------------------------------------------------------------
  // 8. Unauthorized image upload rejection
  // -------------------------------------------------------------------------
  let unauthCalled = false;
  const res8 = mockRes();
  requireAdminAuth({ cookies: {}, headers: {} }, res8, () => { unauthCalled = true; });
  assert(8, 'Unauthorized image upload rejected with 401 Unauthorized', res8.getStatus() === 401 && !unauthCalled);

  // -------------------------------------------------------------------------
  // 9. Authenticated image upload authorization
  // -------------------------------------------------------------------------
  const adminToken = signSessionToken({ role: 'admin' }, 3600);
  let authCalled = false;
  const res9 = mockRes();
  requireAdminAuth({ cookies: {}, headers: { authorization: `Bearer ${adminToken}` } }, res9, () => { authCalled = true; });
  assert(9, 'Authenticated administrator request allowed to proceed to upload', authCalled && res9.getStatus() === 200);

  // -------------------------------------------------------------------------
  // 10. Image magic numbers verification (Authentic vs Fake/Spoofed)
  // -------------------------------------------------------------------------
  // Create a real JPEG buffer: FF D8 FF E0 ...
  const validJpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60]);
  const tempJpeg = path.join(__dirname, 'temp_valid.jpg');
  fs.writeFileSync(tempJpeg, validJpegBuffer);
  const isRealJpeg = verifyImageMagicBytes(tempJpeg);
  fs.unlinkSync(tempJpeg);
  assert(10, 'Legitimate JPEG magic number (FF D8 FF) verified', isRealJpeg === true);

  // Create a fake/malicious file with .jpg extension containing shell script
  const fakeMaliciousBuffer = Buffer.from('#!/bin/bash\necho "Malicious payload executing"\n');
  const tempFakeJpg = path.join(__dirname, 'temp_fake.jpg');
  fs.writeFileSync(tempFakeJpg, fakeMaliciousBuffer);
  const isFakeRejected = verifyImageMagicBytes(tempFakeJpg);
  fs.unlinkSync(tempFakeJpg);
  assert('10b', 'Spoofed file (script masked with .jpg extension) rejected by magic bytes check', isFakeRejected === false);

  // -------------------------------------------------------------------------
  // 11. Oversized image limit configuration (5MB)
  // -------------------------------------------------------------------------
  const productControllerContent = fs.readFileSync(path.join(__dirname, 'src/controllers/productController.js'), 'utf8');
  assert(11, 'Strict 5MB file size limit enforced in multer configuration', productControllerContent.includes('5 * 1024 * 1024'));

  // -------------------------------------------------------------------------
  // 12. Environment configuration validation (Zero hardcoded secrets & safe failure)
  // -------------------------------------------------------------------------
  // Verify no hardcoded secrets remain in auth, security, or routes
  const authContent = fs.readFileSync(path.join(__dirname, 'src/middleware/auth.js'), 'utf8');
  const secContent = fs.readFileSync(path.join(__dirname, 'src/utils/security.js'), 'utf8');
  const authRoutesContent = fs.readFileSync(path.join(__dirname, 'src/routes/authRoutes.js'), 'utf8');

  assert(12, 'No hardcoded API key fallback in auth.js', !authContent.includes('praztech_secure_export_key_2026'));
  assert('12b', 'No hardcoded JWT secret fallback in security.js', !secContent.includes('praztech_sec_jwt_token_sign_key'));
  assert('12c', 'No hardcoded password fallback in authRoutes.js', !authRoutesContent.includes('DEFAULT_ADMIN_PASSWORD'));

  // -------------------------------------------------------------------------
  // 13. Enquiry creation & customer persistence integrity
  // -------------------------------------------------------------------------
  const res13 = mockRes();
  const validEnquiryReq = {
    body: {
      customer: {
        fullName: 'Anand Tooling Corp',
        company: 'Anand Diesel Services',
        email: 'anand@dieselservices.com',
        phone: '+91 9988776655',
        country: 'India',
        state: 'Punjab',
        city: 'Ludhiana',
        gstin: '03AAAAA1234A1Z1'
      },
      catalogueItems: [
        { modelNo: 'PSH-VGKP', name: 'Valve Seat Grinding Kit', quantity: 1 }
      ],
      consent: { accepted: true }
    }
  };
  await createEnquiry(validEnquiryReq, res13, () => {});
  const enqData = res13.getBody();
  assert(13, 'Public customer quotation enquiry created with unique atomic reference and 201 status', 
    res13.getStatus() === 201 && enqData.success === true && enqData.data && enqData.data.referenceNumber);

  // -------------------------------------------------------------------------
  // 14. Product image public URL format & safe destination
  // -------------------------------------------------------------------------
  assert(14, 'Product images served under public path /images/products/', 
    productControllerContent.includes('/images/products/${filename}') && productControllerContent.includes('clientImagesDir'));

  console.log('================================================================');
  console.log(`TOTAL FUNCTIONAL & SECURITY TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('================================================================');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
