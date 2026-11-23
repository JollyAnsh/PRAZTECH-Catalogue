# PRAZTECH® Engineering — B2B Product Catalogue & Quotation Enquiry Website

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TypeScript-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38bdf8.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%2B%20Mongoose-47a248.svg)](https://www.mongodb.com/)
[![PDFKit](https://img.shields.io/badge/PDF-PDFKit%20Engine-e11d48.svg)](https://pdfkit.org/)

A professional, industrial B2B product catalogue and quotation enquiry (RFQ) portal built for **PRAZTECH® Engineering** (Edition 2026).

---

## 📌 1. System Overview

This website is **NOT an e-commerce platform**. Product prices remain hidden. Customers browse precision tooling, configure quantities and sub-model specifications, and submit structured Requests for Quotation (RFQ).

### Key Features
1. **Full 41-Product Master Catalogue:** Valve seat grinding kits, diamond dressing tools, cylinder honing stone holders, multi-angle carbide cutters, and kingpin reamers.
2. **Sub-Model Selectors:** Dedicated interactive selectors for complex toolsets (e.g., 14 specialized Vscct cutter engines, 24 Host silicon carbide grits, Hone bore brackets).
3. **Product Comparison Matrix:** Side-by-side technical comparison of up to 4 products highlighting common and distinct specifications.
4. **Multi-Item Enquiry Cart ("My Enquiry"):** Select multiple catalogue products, adjust quantities, add item-specific notes, and attach custom non-catalogue tool requests.
5. **Atomic Reference IDs:** Generates human-readable, unique reference numbers (e.g., `ENQ-2026-000001`).
6. **Instant Downloadable PDF:** Automatically generates a branded B2B **PRODUCT ENQUIRY / REQUEST FOR QUOTATION** document with zero pricing/invoice wording.
7. **Email Notification Engine:** Automatically dispatches customer confirmation receipts and notifies the PRAZTECH business email with attached PDF.
8. **Excel / CSV Exports:** Admin endpoints and CLI export scripts generating `Customers.xlsx`, `Enquiries.xlsx`, and `Enquiry_Items.xlsx`.
9. **Zero-Downtime Fallback:** Works seamlessly both when connected to MongoDB Atlas and with local JSON data mode.

---

## 🎨 2. Brand Identity & Styling

Built with PRAZTECH's custom industrial color scheme:

| Color | Hex | Role |
|---|---|---|
| **Deep Aubergine** | `#2c114b` | Primary Headers, Hero Banners, Branding |
| **Royal Violet** | `#2d065c` | Accents, Active Cards, Dark Backgrounds |
| **Slate Lavender** | `#87779c` | Subtle Borders, Technical Dimension Grid Lines |
| **Medium Purple** | `#5f3f8c` | Action Buttons, Active Filters, Badges |
| **Industrial Charcoal** | `#121418` | Dark Backgrounds, High-Contrast Typography |
| **Light Slate** | `#f8f9fa` | Clean Page Backgrounds, Specification Tables |

---

## 📁 3. Project Directory Structure

```
Catalog Site/
├── package.json                   # Root orchestrator scripts
├── README.md                      # Comprehensive documentation
├── .gitignore                     # Git exclusion rules
├── Company Logo.jpeg              # Official PRAZTECH company logo
├── Praztech 2027 Extracted Text.md.txt # Primary catalogue source
│
├── .github/workflows/
│   └── deploy.yml                 # Automated GitHub Pages CI/CD workflow
│
├── client/                        # React + TypeScript + Vite SPA
│   ├── index.html                 # HTML shell with Google Fonts
│   ├── vite.config.ts             # Vite configuration with API proxy
│   ├── tailwind.config.js         # Custom PRAZTECH brand palette
│   ├── public/
│   │   └── images/
│   │       ├── logo.jpeg          # PRAZTECH official logo
│   │       └── placeholders/      # 41 branded technical SVGs
│   └── src/
│       ├── types/index.ts         # TypeScript data contracts
│       ├── context/CartContext.tsx# Enquiry cart & compare state
│       ├── services/api.ts        # API client with offline fallback
│       ├── components/            # Reusable UI components
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── ProductCard.tsx
│       │   ├── CompareDrawer.tsx
│       │   └── SubModelSelector.tsx
│       └── pages/                 # Full responsive pages
│           ├── HomePage.tsx
│           ├── CataloguePage.tsx
│           ├── ProductDetailPage.tsx
│           ├── ComparePage.tsx
│           ├── EnquiryCartPage.tsx
│           ├── ConfirmationPage.tsx
│           ├── CustomEnquiryPage.tsx
│           ├── AboutPage.tsx
│           ├── ContactPage.tsx
│           └── PrivacyPage.tsx
│
└── server/                        # Express.js REST API
    ├── package.json
    ├── .env.example               # Environment variables template
    ├── .env                       # Local environment configuration
    ├── data/
    │   ├── products.json          # 41 extracted products
    │   ├── categories.json        # 4 catalogue categories
    │   ├── logo.jpeg              # High-res logo for PDFKit
    │   ├── pdfs/                  # Generated enquiry PDFs
    │   └── enquiries/             # Local JSON persistence store
    └── src/
        ├── index.js               # Express server entry point
        ├── config/db.js           # MongoDB Atlas connection
        ├── models/                # Mongoose models (Product, Enquiry, etc.)
        ├── controllers/           # API business logic
        ├── routes/                # REST endpoints
        ├── middleware/            # Rate limiting, auth, errors
        ├── utils/
        │   ├── pdfGenerator.js    # PDFKit document generator
        │   ├── emailService.js    # Resend & Nodemailer service
        │   └── referenceGenerator.js # Atomic monotonic sequence
        └── scripts/
            ├── seed.js            # MongoDB database seeder
            └── export.js          # Direct Excel export CLI script
```

---

## 🚀 4. Quick Start & Local Development

### Prerequisites
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

### Step 1: Install Dependencies
From the project root:
```bash
npm run install:all
```

### Step 2: Start the Backend API Server
```bash
npm run dev:server
```
The server will start on `http://localhost:5001`.
- Health Check: `http://localhost:5001/api/health`
- Products API: `http://localhost:5001/api/products`

### Step 3: Start the Frontend React Application
In a separate terminal:
```bash
npm run dev:client
```
The client will start on `http://localhost:3000`.

---

## 🗄️ 5. Database Configuration & Seeding

The application connects to **MongoDB Atlas**. If MongoDB is not yet configured, the system automatically falls back to local JSON data mode, ensuring immediate usability.

To connect your MongoDB Atlas cluster:
1. Open `server/.env`
2. Update `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/praztech?retryWrites=true&w=majority
   ```
3. Run the database seed script:
   ```bash
   npm run seed
   ```
   This populates all 41 products and 4 categories into your MongoDB Atlas database with full text indexes.

---

## 📄 6. PDF Generation & Quotation Enquiries

Every submission via the Enquiry Cart triggers the backend PDF generator (`server/src/utils/pdfGenerator.js`).

### PDF Features:
- Title: **PRODUCT ENQUIRY / REQUEST FOR QUOTATION**
- Branded PRAZTECH logo and corporate contact header.
- Customer details (Company, Name, Email, Phone, WhatsApp, Address, GSTIN).
- Structured table of requested items with quantities, models, and sub-model notes.
- Custom non-catalogue tooling requests section.
- **No prices, no order totals, and no invoice terminology.**
- Secure download endpoint: `GET /api/enquiries/:reference/download`

---

## 📊 7. Customer & Enquiry Excel Exports

To export submitted enquiries and customer contacts into Excel:

### Option A: Command Line Script
Run directly from terminal:
```bash
npm run export
```
Generated workbook is saved to `server/exports/PRAZTECH_Export_<date>.xlsx` containing:
- Sheet 1: `Enquiries`
- Sheet 2: `Enquiry_Items`

### Option B: Protected Admin API Endpoints
Endpoints are secured with the `x-admin-key` header (configured in `server/.env` as `ADMIN_API_KEY`):
- `GET /api/admin/export/customers` → Downloads `PRAZTECH_Customers.xlsx`
- `GET /api/admin/export/enquiries` → Downloads `PRAZTECH_Enquiries.xlsx`
- `GET /api/admin/export/enquiry-items` → Downloads `PRAZTECH_Enquiry_Items.xlsx`
- `GET /api/admin/export/all` → Downloads combined multi-sheet workbook

Example curl:
```bash
curl -H "x-admin-key: praztech_secure_export_key_2026" http://localhost:5001/api/admin/export/all -o Exports.xlsx
```

---

## 🖼️ 8. How to Add Product Photographs

Currently, all products use custom-generated SVG technical blueprint placeholders.

To replace placeholders with real photographs:
1. Save photographs in `client/public/images/products/`
2. Name images using the product slug:
   - Example for model `PSH-VGKP with heavy stand`: `psh-vgkp-with-heavy-stand.jpg`
   - Example for model `Vscct`: `vscct.jpg`
3. Update `server/data/products.json` or MongoDB records:
   ```json
   "images": ["/images/products/psh-vgkp-with-heavy-stand.jpg"]
   ```

---

## ☁️ 9. Deployment Strategy

### Frontend: GitHub Pages
The project includes a ready-to-run GitHub Actions workflow at `.github/workflows/deploy.yml`.
1. Push repository to GitHub.
2. In GitHub Repository Settings → Pages → Source: Select **GitHub Actions**.
3. Every push to `main` builds and deploys the static SPA automatically.

### Backend: Render or Railway
1. Create a Web Service on [Render](https://render.com) pointing to the `server/` directory.
2. Build Command: `npm install`
3. Start Command: `node src/index.js`
4. Configure environment variables from `server/.env.example`.

---

## 🔒 10. Security & Privacy Compliance

- **Rate Limiting:** Protects `/api/enquiries` against automated bot spamming.
- **Helmet Middleware:** Configures HTTP security headers (CSP, frameguard, etc.).
- **Input Sanitization:** Express-validator validates all customer contact fields.
- **Consent Tracking:** Every submission logs acceptance timestamp and privacy policy version.
- **Privacy Policy Page:** Live at `/privacy` complying with digital data protection principles.

---

© 2026 **PRAZTECH® Engineering**. All rights reserved.
