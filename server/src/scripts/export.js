require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');
const Enquiry = require('../models/Enquiry');

const runExport = async () => {
  const uri = process.env.MONGODB_URI;
  const outDir = path.join(__dirname, '../../exports');
  os_mkdir = () => { if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true }); };
  os_mkdir();

  let customers = [];
  let enquiries = [];

  if (uri && !uri.includes('<username>')) {
    try {
      console.log('Connecting to MongoDB Atlas to fetch records...');
      await mongoose.connect(uri);
      customers = await Customer.find().sort({ createdAt: -1 }).lean();
      enquiries = await Enquiry.find().sort({ submittedAt: -1 }).lean();
      console.log(`Retrieved ${customers.length} customers and ${enquiries.length} enquiries from database.`);
    } catch (e) {
      console.warn('⚠️ Could not connect to MongoDB Atlas, checking local storage...');
    }
  }

  if (enquiries.length === 0) {
    const localDir = path.join(__dirname, '../../data/enquiries');
    if (fs.existsSync(localDir)) {
      const files = fs.readdirSync(localDir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        enquiries.push(JSON.parse(fs.readFileSync(path.join(localDir, f), 'utf8')));
      }
    }
  }

  console.log(`Exporting ${enquiries.length} enquiries...`);

  // Build rows
  const enquiryRows = enquiries.map((e, idx) => {
    const c = e.customerSnapshot || {};
    return {
      'S.No': idx + 1,
      'Reference': e.referenceNumber,
      'Submitted At': new Date(e.submittedAt).toLocaleString(),
      'Status': e.status,
      'Customer Name': c.fullName,
      'Company': c.company || 'N/A',
      'Email': c.email,
      'Phone': c.phone,
      'WhatsApp': c.whatsapp || '',
      'Location': `${c.city || ''}, ${c.state || ''}, ${c.country || ''}`,
      'Items': (e.catalogueItems || []).length + (e.customItems || []).length,
      'Notes': e.generalNotes || ''
    };
  });

  const itemRows = [];
  let itemCounter = 1;
  enquiries.forEach(e => {
    const c = e.customerSnapshot || {};
    (e.catalogueItems || []).forEach(it => {
      itemRows.push({
        '#': itemCounter++,
        'Reference': e.referenceNumber,
        'Date': new Date(e.submittedAt).toLocaleDateString(),
        'Customer': c.fullName,
        'Company': c.company || 'N/A',
        'Type': 'Catalogue',
        'Model No': it.modelNo,
        'Product Name': it.name,
        'Category': it.category,
        'Quantity': it.quantity,
        'Notes': it.notes || ''
      });
    });
    (e.customItems || []).forEach(cit => {
      itemRows.push({
        '#': itemCounter++,
        'Reference': e.referenceNumber,
        'Date': new Date(e.submittedAt).toLocaleDateString(),
        'Customer': c.fullName,
        'Company': c.company || 'N/A',
        'Type': 'Custom Tooling',
        'Model No': '[CUSTOM]',
        'Product Name': cit.productName,
        'Category': 'Custom Tooling',
        'Quantity': cit.quantity,
        'Notes': cit.notes || ''
      });
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(enquiryRows), 'Enquiries');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows), 'Enquiry_Items');

  const filePath = path.join(outDir, `PRAZTECH_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  XLSX.writeFile(wb, filePath);

  console.log(`✅ Export generated successfully: ${filePath}`);
  process.exit(0);
};

runExport();
