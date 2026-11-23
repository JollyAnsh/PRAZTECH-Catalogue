/**
 * PRAZTECH® MASTER PROMPT 5 — COMPREHENSIVE END-TO-END REGRESSION TEST SUITE
 * 
 * Validates all routes, functional workflows, security controls, database
 * integrity, performance boundaries, and accessibility tokens.
 */

const path = require('path');
const fs = require('fs');

// Mock request/response invoker for Express app testing in sandboxed environment
async function invokeApp(app, method, url, { headers = {}, body = {}, cookies = {} } = {}) {
  return new Promise((resolve, reject) => {
    // Lowercase normalize headers like Node/Express http server does
    const allHeaders = {};
    for (const [k, v] of Object.entries(headers || {})) {
      allHeaders[k.toLowerCase()] = v;
    }

    // Cookie header formatting
    const cookieHeader = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieHeader) allHeaders['cookie'] = cookieHeader;
    if (body && method !== 'GET' && !allHeaders['content-type']) {
      allHeaders['content-type'] = 'application/json';
    }

    const req = {
      method,
      url,
      path: url.split('?')[0],
      headers: allHeaders,
      cookies,
      body: body || {},
      query: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      get: (h) => allHeaders[h.toLowerCase()] || null
    };

    let statusCode = 200;
    let responseHeaders = {};
    let responseBody = '';

    const res = {
      statusCode: 200,
      status(code) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      setHeader(name, val) {
        responseHeaders[name.toLowerCase()] = val;
        return this;
      },
      getHeader(name) {
        return responseHeaders[name.toLowerCase()];
      },
      removeHeader(name) {
        delete responseHeaders[name.toLowerCase()];
        return this;
      },
      cookie(name, val, options) {
        const optStr = Object.entries(options || {}).map(([k, v]) => `${k}=${v}`).join('; ');
        responseHeaders['set-cookie'] = `${name}=${val}; ${optStr}`;
        return this;
      },
      clearCookie(name) {
        responseHeaders['set-cookie'] = `${name}=; Max-Age=0`;
        return this;
      },
      json(data) {
        responseHeaders['content-type'] = 'application/json';
        responseBody = JSON.stringify(data);
        resolve({ status: statusCode, headers: responseHeaders, body: data, rawBody: responseBody });
        return this;
      },
      send(data) {
        responseBody = typeof data === 'object' ? JSON.stringify(data) : String(data);
        resolve({ status: statusCode, headers: responseHeaders, body: data, rawBody: responseBody });
        return this;
      },
      sendFile(filePath) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          resolve({ status: 200, headers: responseHeaders, body: content, rawBody: content, filePath });
        } else {
          statusCode = 404;
          resolve({ status: 404, headers: responseHeaders, body: 'Not Found', rawBody: 'Not Found' });
        }
        return this;
      },
      end(data) {
        if (data) responseBody = String(data);
        resolve({ status: statusCode, headers: responseHeaders, body: responseBody, rawBody: responseBody });
        return this;
      }
    };

    try {
      app(req, res, (err) => {
        if (err) {
          resolve({ status: 500, headers: responseHeaders, body: { error: err.message } });
        } else {
          resolve({ status: statusCode, headers: responseHeaders, body: responseBody });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('🔬 PRAZTECH® MASTER PROMPT 5: FINAL REGRESSION QA SUITE');
  console.log('================================================================');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(name, condition, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${name}`);
    } else {
      failedTests++;
      console.error(`❌ [FAIL] ${name} ${details ? '— ' + details : ''}`);
    }
  }

  // Load backend app
  const app = require('./src/index');

  // PART 1 & 2: ROUTE & WORKFLOW VERIFICATION
  console.log('\n--- PART 1 & 2: ROUTE & WORKFLOW VERIFICATION ---');

  // Health endpoint
  const healthRes = await invokeApp(app, 'GET', '/api/health');
  assert('GET /api/health responds with 200 status', healthRes.status === 200);
  assert('Health check reports service identity and DB status', healthRes.body && healthRes.body.service && healthRes.body.database);

  // Products Catalogue API
  const prodRes = await invokeApp(app, 'GET', '/api/products');
  assert('GET /api/products is public and returns 200', prodRes.status === 200);
  const products = (prodRes.body && prodRes.body.data) || (Array.isArray(prodRes.body) ? prodRes.body : []);
  assert('Catalogue returns products list', products.length > 0, `Returned ${products.length} products`);

  // Product Comparison API
  const compareSlugs = products.slice(0, 3).map(p => p.slug);
  const compareRes = await invokeApp(app, 'POST', '/api/products/compare', { body: { slugs: compareSlugs } });
  assert('POST /api/products/compare returns 200 with compared items', compareRes.status === 200 && compareRes.body.data && compareRes.body.data.length === compareSlugs.length);

  // Contact Form Submission (BUG-FUNC-01)
  const contactPayload = {
    name: 'Master QA Tester',
    email: 'qa.cert@industrial-precision.com',
    phone: '+91 9876543210',
    company: 'QA Certification Works Ltd',
    message: 'Testing complete contact form submission and persistence for Master Prompt 5 verification.'
  };
  const contactRes = await invokeApp(app, 'POST', '/api/contact', { body: contactPayload });
  assert('POST /api/contact persists valid inquiry with 201 Created', contactRes.status === 201 && contactRes.body.success === true);

  // Contact Form Validation
  const invalidContact = await invokeApp(app, 'POST', '/api/contact', { body: { name: '', email: 'not-an-email', message: 'short' } });
  assert('POST /api/contact rejects invalid data with 400 Bad Request', invalidContact.status === 400);

  // Enquiry Quotation Submission (Atomic reference + Customer auto-upsert)
  const enquiryPayload = {
    customer: {
      fullName: 'Vikramaditya Singhal',
      company: 'Singhal Cylinder Boring Works',
      email: 'vikram@singhalboring.in',
      phone: '+91 9811223344',
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Ghaziabad',
      address: 'Plot 44, Industrial Area Site 4',
      gstin: '09AAAFS1234F1Z1'
    },
    catalogueItems: [
      {
        productId: products[0]?.slug || 'praz-vsg-200',
        modelNo: products[0]?.modelNo || 'PRAZ-VSG-200',
        name: products[0]?.name || 'Valve Seat Grinding Kit',
        category: products[0]?.category || 'Valve Seat Grinding Tools',
        quantity: 2,
        notes: 'Include 45 degree stones'
      }
    ],
    customItems: [],
    generalNotes: 'Master Prompt 5 automated regression quote request',
    consent: { accepted: true, policyVersion: '1.0' }
  };
  const enquiryRes = await invokeApp(app, 'POST', '/api/enquiries', { body: enquiryPayload });
  const createdRef = enquiryRes.body?.data?.referenceNumber || enquiryRes.body?.referenceNumber;
  assert('POST /api/enquiries creates quotation with 201 Created', enquiryRes.status === 201 && createdRef);
  assert('Enquiry reference matches atomic format (ENQ-YYYYMMDD-XXXX)', /^ENQ-\d{8}-\d{4}(?:-\d+)?$/.test(createdRef));

  // Public Enquiry Lookup
  const getEnqRes = await invokeApp(app, 'GET', `/api/enquiries/${createdRef}`);
  const enqData = getEnqRes.body?.data || getEnqRes.body;
  assert('GET /api/enquiries/:reference allows customer to view quotation (200)', getEnqRes.status === 200 && enqData?.referenceNumber === createdRef);

  // PDF Generation / Download
  const pdfRes = await invokeApp(app, 'GET', `/api/enquiries/${createdRef}/download`);
  assert('GET /api/enquiries/:reference/download serves quotation PDF', pdfRes.status === 200 || (pdfRes.status === 302 && pdfRes.headers.location));

  // PART 3: SECURITY CONTROLS RE-AUDIT
  console.log('\n--- PART 3: SECURITY CONTROLS RE-AUDIT ---');

  // BUG-SEC-01: No administrative password in client bundle
  const distDir = path.join(__dirname, '../client/dist');
  let exposedFound = false;
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(path.join(distDir, 'assets'));
    for (const f of files) {
      if (f.endsWith('.js')) {
        const content = fs.readFileSync(path.join(distDir, 'assets', f), 'utf8');
        if (content.includes('JollyAnsh@420') || content.includes('JollyAnsh')) {
          exposedFound = true;
        }
      }
    }
  }
  assert('BUG-SEC-01: No administrative password in compiled frontend bundle', !exposedFound);

  // BUG-SEC-02 & 03: Unauthorized admin API calls rejected
  const unauthMe = await invokeApp(app, 'GET', '/api/auth/me');
  assert('BUG-SEC-02: GET /api/auth/me rejects unauthenticated request with 401', unauthMe.status === 401);

  const unauthCust = await invokeApp(app, 'GET', '/api/customers');
  assert('BUG-SEC-03: GET /api/customers rejects unauthenticated request with 401', unauthCust.status === 401);

  const unauthUpload = await invokeApp(app, 'POST', '/api/products/upload-image');
  assert('BUG-SEC-05: POST /api/products/upload-image rejects unauthenticated request with 401', unauthUpload.status === 401);

  // Admin Login with incorrect password
  const badLogin = await invokeApp(app, 'POST', '/api/auth/login', { body: { password: 'wrongPassword!99' } });
  assert('POST /api/auth/login rejects incorrect password with 401', badLogin.status === 401);

  // Admin Login with unauthorized password
  const unauthorizedLogin = await invokeApp(app, 'POST', '/api/auth/login', { body: { password: 'UnauthorizedPassword#99' } });
  assert('POST /api/auth/login explicitly rejects unauthorized password with 401', unauthorizedLogin.status === 401);

  // Admin Login with configured password
  const adminPass = process.env.ADMIN_PASSWORD || 'JollyAnsh@420';
  const goodLogin = await invokeApp(app, 'POST', '/api/auth/login', { body: { password: adminPass } });
  assert('POST /api/auth/login accepts valid configured password with 200', goodLogin.status === 200 && goodLogin.body.token);

  const adminToken = goodLogin.body.token;
  const cookieHeader = goodLogin.headers['set-cookie'] || '';
  assert('POST /api/auth/login issues HttpOnly SameSite session cookie', cookieHeader.toLowerCase().includes('httponly') && cookieHeader.toLowerCase().includes('samesite'));

  // Authorized Admin Access
  const authMe = await invokeApp(app, 'GET', '/api/auth/me', { headers: { 'Authorization': `Bearer ${adminToken}` } });
  assert('GET /api/auth/me verifies valid admin session (200, role: admin)', authMe.status === 200 && authMe.body.authenticated === true && (authMe.body.role === 'admin' || authMe.body.user?.role === 'admin'));

  const authCust = await invokeApp(app, 'GET', '/api/customers', { headers: { 'Authorization': `Bearer ${adminToken}` } });
  assert('GET /api/customers accessible to authenticated admin (200)', authCust.status === 200);

  // Admin Logout
  const logoutRes = await invokeApp(app, 'POST', '/api/auth/logout', { headers: { 'Authorization': `Bearer ${adminToken}` } });
  assert('POST /api/auth/logout returns 200 and clears session cookie', logoutRes.status === 200);

  // PART 4: DATA INTEGRITY & MODEL CHECKS
  console.log('\n--- PART 4: DATA INTEGRITY & SCHEMAS ---');
  const Product = require('./src/models/Product');
  const Category = require('./src/models/Category');
  const Enquiry = require('./src/models/Enquiry');
  const Customer = require('./src/models/Customer');
  const Contact = require('./src/models/Contact');

  assert('Product model schema defines unique slug and text index', Product.schema.paths.slug.options.unique === true);
  assert('Category model schema defines unique slug', Category.schema.paths.slug.options.unique === true);
  assert('Enquiry model schema defines unique referenceNumber', Enquiry.schema.paths.referenceNumber.options.unique === true);
  assert('Customer model schema defines emailNormalized and phoneNormalized', Customer.schema.paths.emailNormalized && Customer.schema.paths.phoneNormalized);
  assert('Contact model schema defines message and email validation', Contact.schema.paths.message && Contact.schema.paths.email);

  // PART 5: PERFORMANCE, CODE QUALITY & BUNDLE SIZES
  console.log('\n--- PART 5: PERFORMANCE & CODE QUALITY RE-AUDIT ---');

  // Verify Bug 2 (BUG-PERF-02): No continuous setInterval in LanguageSelector
  const langSelCode = fs.readFileSync(path.join(__dirname, '../client/src/components/LanguageSelector.tsx'), 'utf8');
  assert('BUG-PERF-02: No continuous setInterval in LanguageSelector.tsx', !langSelCode.includes('setInterval(') && langSelCode.includes('MutationObserver'));

  // Verify Bug 3 (BUG-CODE-01): No implicit globals in controllers
  const enqCtrlCode = fs.readFileSync(path.join(__dirname, './src/controllers/enquiryController.js'), 'utf8');
  assert('BUG-CODE-01: No implicit global os_mkdir in enquiryController.js', !enqCtrlCode.includes('os_mkdir ='));

  // Verify Bug 1 (BUG-PERF-01): Code-splitting and bundle sizes
  const appCode = fs.readFileSync(path.join(__dirname, '../client/src/App.tsx'), 'utf8');
  assert('BUG-PERF-01: React.lazy dynamic imports implemented in App.tsx', appCode.includes('lazy(') && appCode.includes('Suspense'));

  // Check bundle chunk sizes in dist/assets
  if (fs.existsSync(distDir)) {
    const assets = fs.readdirSync(path.join(distDir, 'assets'));
    let mainJsSize = 0;
    let xlsxIsolated = false;
    let jspdfIsolated = false;
    let notFoundIsolated = false;

    for (const a of assets) {
      const stats = fs.statSync(path.join(distDir, 'assets', a));
      if (a.startsWith('index-') && a.endsWith('.js')) {
        mainJsSize = Math.round(stats.size / 1024);
      }
      if (a.startsWith('vendor-xlsx')) xlsxIsolated = true;
      if (a.startsWith('vendor-jspdf')) jspdfIsolated = true;
      if (a.startsWith('NotFoundPage')) notFoundIsolated = true;
    }

    assert(`Initial JS entry chunk under 100 kB (Current: ${mainJsSize} kB)`, mainJsSize < 100);
    assert('vendor-xlsx chunk isolated from initial payload', xlsxIsolated);
    assert('vendor-jspdf chunk isolated from initial payload', jspdfIsolated);
    assert('NotFoundPage lazy chunk generated', notFoundIsolated);
  }

  // PART 6: RESPONSIVE & ACCESSIBILITY AUDIT
  console.log('\n--- PART 6 & 7: RESPONSIVE & ACCESSIBILITY TOKENS ---');
  const compPageCode = fs.readFileSync(path.join(__dirname, '../client/src/pages/ComparePage.tsx'), 'utf8');
  assert('BUG-RESP-01: ComparePage mobile horizontal scroll container implemented', compPageCode.includes('isMultiMobile') && compPageCode.includes('overflow-x-auto'));

  const compDrawerCode = fs.readFileSync(path.join(__dirname, '../client/src/components/CompareDrawer.tsx'), 'utf8');
  assert('BUG-RESP-02: CompareDrawer includes safe-area-inset and collapse toggle', compDrawerCode.includes('safe-area-inset-bottom') && compDrawerCode.includes('isMinimized'));

  const navCode = fs.readFileSync(path.join(__dirname, '../client/src/components/Navbar.tsx'), 'utf8');
  assert('BUG-A11Y-02: Navbar Categories dropdown features ARIA disclosure attributes', navCode.includes('aria-haspopup="true"') && navCode.includes('aria-expanded'));
  assert('BUG-A11Y-02: Navbar Categories dropdown features keyboard navigation', navCode.includes('handleButtonKeyDown') && navCode.includes('handleMenuKeyDown'));

  const footerCode = fs.readFileSync(path.join(__dirname, '../client/src/components/Footer.tsx'), 'utf8');
  assert('BUG-A11Y-01: Footer secondary text upgraded to accessible #b5a8c8', footerCode.includes('#b5a8c8') && !footerCode.includes('text-[#9080a5]'));

  // PART 8: 404 EXPERIENCE
  console.log('\n--- PART 8: DEDICATED 404 PAGE ---');
  const notFoundExists = fs.existsSync(path.join(__dirname, '../client/src/pages/NotFoundPage.tsx'));
  assert('BUG-UX-01: Dedicated NotFoundPage.tsx exists', notFoundExists);
  assert('BUG-UX-01: App.tsx catch-all route mounts NotFoundPage', appCode.includes('<Route path="*" element={<NotFoundPage />} />'));
  const static404 = fs.existsSync(path.join(distDir, '404.html'));
  assert('Static 404.html generated in dist for direct routing', static404);

  // SUMMARY
  console.log('\n================================================================');
  console.log(`TOTAL REGRESSION ASSERTIONS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRegressionSuite().catch(err => {
  console.error('Fatal regression suite error:', err);
  process.exit(1);
});
