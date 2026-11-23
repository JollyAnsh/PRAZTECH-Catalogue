const { hashPassword, verifyPassword, signSessionToken, verifySessionToken, COOKIE_NAME, getCookieOptions } = require('./src/utils/security');
const { requireAdminAuth } = require('./src/middleware/auth');
const app = require('./src/index');

console.log('===========================================================');
console.log('🛡️  PRAZTECH® SECURITY VERIFICATION SUITE');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${description}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// 1. Memory-Hard Password Hashing (scrypt) & Constant-Time Verification
// -------------------------------------------------------------
const defaultPassword = 'Admin#Praztech2026!Sec';
const saltHash = hashPassword(defaultPassword);
assert('scrypt hash generated with salt and derived key format', saltHash.includes(':') && saltHash.split(':')[0].length === 32);
assert('Verify correct password against plaintext constant-time comparison', verifyPassword(defaultPassword, defaultPassword));
assert('Verify correct password against scrypt salt:key hash', verifyPassword(defaultPassword, saltHash));
assert('Reject incorrect password against hash', !verifyPassword('WrongPassword123!', saltHash));
assert('Reject compromised legacy password (JollyAnsh@420)', !verifyPassword('JollyAnsh@420', saltHash));
assert('Reject empty password input', !verifyPassword('', saltHash));

// -------------------------------------------------------------
// 2. Cryptographic Session Token Generation & Verification (HMAC-SHA256)
// -------------------------------------------------------------
const token = signSessionToken({ role: 'admin' }, 3600);
assert('Session token generated in RFC 7519 structure (header.payload.signature)', token.split('.').length === 3);

const payload = verifySessionToken(token);
assert('Session token verified with correct payload role', payload && payload.role === 'admin');

const expiredToken = signSessionToken({ role: 'admin' }, -10);
assert('Expired session token rejected immediately', verifySessionToken(expiredToken) === null);

const parts = token.split('.');
const tamperedPayload = Buffer.from(JSON.stringify({ role: 'admin', exp: 9999999999 })).toString('base64url');
const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
assert('Cryptographically tampered token rejected (signature mismatch)', verifySessionToken(tamperedToken) === null);

// -------------------------------------------------------------
// 3. Authentication Middleware (requireAdminAuth)
// -------------------------------------------------------------
let mockStatus = 0;
let mockResponse = null;
const mockRes = {
  status: (code) => { mockStatus = code; return mockRes; },
  json: (data) => { mockResponse = data; return mockRes; }
};

// 3.1 Unauthenticated request
let unauthCalled = false;
mockStatus = 0;
requireAdminAuth({ cookies: {}, headers: {} }, mockRes, () => { unauthCalled = true; });
assert('requireAdminAuth returns 401 on missing credentials', mockStatus === 401 && !unauthCalled);

// 3.2 Compromised credential attempt
let compCalled = false;
mockStatus = 0;
requireAdminAuth({ cookies: {}, headers: { 'x-admin-key': 'JollyAnsh@420' } }, mockRes, () => { compCalled = true; });
assert('requireAdminAuth rejects compromised legacy string JollyAnsh@420', mockStatus === 401 && !compCalled);

// 3.3 HTTP-only Cookie authentication
let cookieCalled = false;
const reqCookie = { cookies: { [COOKIE_NAME]: token }, headers: {} };
requireAdminAuth(reqCookie, mockRes, () => { cookieCalled = true; });
assert('requireAdminAuth accepts valid HTTP-only session cookie', cookieCalled && reqCookie.user && reqCookie.user.role === 'admin');

// 3.4 Authorization: Bearer <token>
let bearerCalled = false;
const reqBearer = { cookies: {}, headers: { authorization: `Bearer ${token}` } };
requireAdminAuth(reqBearer, mockRes, () => { bearerCalled = true; });
assert('requireAdminAuth accepts valid Bearer authorization header', bearerCalled && reqBearer.user && reqBearer.user.role === 'admin');

// 3.5 Automated administrative API key header
let apiKeyCalled = false;
const reqApiKey = { cookies: {}, headers: { 'x-admin-key': 'praztech_secure_export_key_2026' } };
requireAdminAuth(reqApiKey, mockRes, () => { apiKeyCalled = true; });
assert('requireAdminAuth accepts configured ADMIN_API_KEY header', apiKeyCalled && reqApiKey.user && reqApiKey.user.authMethod === 'api-key');

// -------------------------------------------------------------
// 4. Inspect Route Handlers & Route Stack Protection
// -------------------------------------------------------------
const routerLayers = app._router.stack.filter(l => l.name === 'router');

// 4.1 Check /api/customers
const customerLayer = routerLayers.find(l => l.regexp.source.includes('customers'));
const customerMiddlewares = customerLayer ? customerLayer.handle.stack.filter(s => !s.route).map(s => s.name) : [];
assert('Customer router has requireAdminAuth mounted at router level', customerMiddlewares.includes('requireAdminAuth'));

// 4.2 Check /api/products
const productLayer = routerLayers.find(l => l.regexp.source.includes('products'));
const productRoutes = productLayer.handle.stack.filter(s => s.route);

const uploadImage = productRoutes.find(s => s.route.path === '/upload-image');
assert('/api/products/upload-image route has requireAdminAuth attached', uploadImage && uploadImage.route.stack.some(h => h.name === 'requireAdminAuth'));

const createProduct = productRoutes.find(s => s.route.path === '/' && s.route.methods.post);
assert('POST /api/products has requireAdminAuth attached', createProduct && createProduct.route.stack.some(h => h.name === 'requireAdminAuth'));

const updateProduct = productRoutes.find(s => s.route.path === '/:slug' && s.route.methods.put);
assert('PUT /api/products/:slug has requireAdminAuth attached', updateProduct && updateProduct.route.stack.some(h => h.name === 'requireAdminAuth'));

const deleteProduct = productRoutes.find(s => s.route.path === '/:slug' && s.route.methods.delete);
assert('DELETE /api/products/:slug has requireAdminAuth attached', deleteProduct && deleteProduct.route.stack.some(h => h.name === 'requireAdminAuth'));

const getProducts = productRoutes.find(s => s.route.path === '/' && s.route.methods.get);
assert('GET /api/products is PUBLIC (no requireAdminAuth)', getProducts && !getProducts.route.stack.some(h => h.name === 'requireAdminAuth'));

const compareProducts = productRoutes.find(s => s.route.path === '/compare' && s.route.methods.post);
assert('POST /api/products/compare is PUBLIC (no requireAdminAuth)', compareProducts && !compareProducts.route.stack.some(h => h.name === 'requireAdminAuth'));

// 4.3 Check /api/enquiries
const enquiryLayer = routerLayers.find(l => l.regexp.source.includes('enquiries'));
const enquiryRoutes = enquiryLayer.handle.stack.filter(s => s.route);

const getEnquiries = enquiryRoutes.find(s => s.route.path === '/' && s.route.methods.get);
assert('GET /api/enquiries has requireAdminAuth attached', getEnquiries && getEnquiries.route.stack.some(h => h.name === 'requireAdminAuth'));

const putEnquiry = enquiryRoutes.find(s => s.route.path === '/:reference' && s.route.methods.put);
assert('PUT /api/enquiries/:reference has requireAdminAuth attached', putEnquiry && putEnquiry.route.stack.some(h => h.name === 'requireAdminAuth'));

const deleteEnquiry = enquiryRoutes.find(s => s.route.path === '/:reference' && s.route.methods.delete);
assert('DELETE /api/enquiries/:reference has requireAdminAuth attached', deleteEnquiry && deleteEnquiry.route.stack.some(h => h.name === 'requireAdminAuth'));

const postEnquiry = enquiryRoutes.find(s => s.route.path === '/' && s.route.methods.post);
assert('POST /api/enquiries is PUBLIC for customer quote submissions', postEnquiry && !postEnquiry.route.stack.some(h => h.name === 'requireAdminAuth'));

const getEnquiryRef = enquiryRoutes.find(s => s.route.path === '/:reference' && s.route.methods.get);
assert('GET /api/enquiries/:reference is PUBLIC for quote lookup', getEnquiryRef && !getEnquiryRef.route.stack.some(h => h.name === 'requireAdminAuth'));

const getEnquiryDownload = enquiryRoutes.find(s => s.route.path === '/:reference/download' && s.route.methods.get);
assert('GET /api/enquiries/:reference/download is PUBLIC for customer PDF download', getEnquiryDownload && !getEnquiryDownload.route.stack.some(h => h.name === 'requireAdminAuth'));

// 4.4 Check /api/admin/export
const exportLayer = routerLayers.find(l => l.regexp.source.includes('export'));
const exportMiddlewares = exportLayer ? exportLayer.handle.stack.filter(s => !s.route).map(s => s.name) : [];
assert('Export router has requireAdminKey/requireAdminAuth applied', exportMiddlewares.includes('requireAdminKey') || exportMiddlewares.includes('requireAdminAuth'));

// -------------------------------------------------------------
// 5. CORS Whitelist Logic Verification
// -------------------------------------------------------------
const corsMiddlewareLayer = app._router.stack.find(l => l.name === 'corsMiddleware');
assert('CORS middleware mounted in Express app stack', !!corsMiddlewareLayer);

console.log('===========================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('===========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
