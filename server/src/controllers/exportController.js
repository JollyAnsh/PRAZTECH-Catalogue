const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');
const Enquiry = require('../models/Enquiry');
const { getDBStatus } = require('../config/db');

const localEnquiriesDir = path.join(__dirname, '../../data/enquiries');

// Helper to gather all enquiries (DB or local)
const getAllEnquiries = async () => {
  if (getDBStatus()) {
    return await Enquiry.find().sort({ submittedAt: -1 }).lean();
  }
  const enquiries = [];
  if (fs.existsSync(localEnquiriesDir)) {
    const files = fs.readdirSync(localEnquiriesDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(localEnquiriesDir, f), 'utf8'));
      enquiries.push(data);
    }
  }
  return enquiries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
};

// Helper to gather all customers (DB or deduced from enquiries)
const getAllCustomers = async () => {
  if (getDBStatus()) {
    return await Customer.find().sort({ createdAt: -1 }).lean();
  }
  const enquiries = await getAllEnquiries();
  const customerMap = {};
  enquiries.forEach(e => {
    const c = e.customerSnapshot;
    const key = c.email.toLowerCase();
    if (!customerMap[key]) {
      customerMap[key] = {
        fullName: c.fullName,
        company: c.company || '',
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp || '',
        country: c.country,
        state: c.state,
        city: c.city,
        address: c.address || '',
        gstin: c.gstin || '',
        enquiryCount: 1,
        enquiryIds: [e.referenceNumber],
        createdAt: e.submittedAt
      };
    } else {
      customerMap[key].enquiryCount += 1;
      customerMap[key].enquiryIds.push(e.referenceNumber);
    }
  });
  return Object.values(customerMap);
};

// GET /api/admin/export/customers
const exportCustomers = async (req, res, next) => {
  try {
    const customers = await getAllCustomers();

    const data = customers.map((c, idx) => ({
      'S.No': idx + 1,
      'Customer Name': c.fullName,
      'Company Name': c.company || 'N/A (Individual)',
      'Email Address': c.email,
      'Phone Number': c.phone,
      'WhatsApp': c.whatsapp || '',
      'Country': c.country,
      'State': c.state,
      'City': c.city,
      'Full Address': c.address || '',
      'GSTIN': c.gstin || '',
      'Total Enquiries': c.enquiryCount || (c.enquiryIds ? c.enquiryIds.length : 1),
      'Enquiry References': (c.enquiryIds || []).join(', '),
      'Joined Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="PRAZTECH_Customers.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/export/enquiries
const exportEnquiries = async (req, res, next) => {
  try {
    const enquiries = await getAllEnquiries();

    const data = enquiries.map((e, idx) => {
      const c = e.customerSnapshot || {};
      return {
        'S.No': idx + 1,
        'Enquiry Reference': e.referenceNumber,
        'Date Submitted': new Date(e.submittedAt).toLocaleString(),
        'Status': e.status,
        'Customer Name': c.fullName,
        'Company': c.company || 'N/A',
        'Email': c.email,
        'Phone': c.phone,
        'WhatsApp': c.whatsapp || '',
        'Location': `${c.city || ''}, ${c.state || ''}, ${c.country || ''}`,
        'Catalogue Items Count': (e.catalogueItems || []).length,
        'Custom Items Count': (e.customItems || []).length,
        'Customer Instructions': e.generalNotes || '',
        'Customer Email Sent': e.notificationStatus?.customerEmailSent ? 'YES' : 'NO',
        'Business Email Sent': e.notificationStatus?.businessEmailSent ? 'YES' : 'NO'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="PRAZTECH_Enquiries.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/export/enquiry-items
const exportEnquiryItems = async (req, res, next) => {
  try {
    const enquiries = await getAllEnquiries();
    const rows = [];
    let counter = 1;

    enquiries.forEach(e => {
      const c = e.customerSnapshot || {};
      const ref = e.referenceNumber;
      const date = new Date(e.submittedAt).toLocaleDateString();

      // Catalogue Items
      (e.catalogueItems || []).forEach(it => {
        let subModelInfo = '';
        if (it.selectedSubModel && typeof it.selectedSubModel === 'object') {
          subModelInfo = it.selectedSubModel.modelNo || it.selectedSubModel.size || it.selectedSubModel.sizeMm || JSON.stringify(it.selectedSubModel);
        }

        rows.push({
          'Item ID': counter++,
          'Enquiry Reference': ref,
          'Date': date,
          'Customer Name': c.fullName,
          'Company': c.company || 'N/A',
          'Item Type': 'Catalogue Product',
          'Model No': it.modelNo,
          'Product Name': it.name,
          'Category': it.category,
          'Selected Variant / Size': subModelInfo || 'Standard',
          'Requested Quantity': it.quantity,
          'Item Specific Notes': it.notes || ''
        });
      });

      // Custom Items
      (e.customItems || []).forEach(cit => {
        rows.push({
          'Item ID': counter++,
          'Enquiry Reference': ref,
          'Date': date,
          'Customer Name': c.fullName,
          'Company': c.company || 'N/A',
          'Item Type': 'Custom Product',
          'Model No': '[CUSTOM REQUEST]',
          'Product Name': cit.productName,
          'Category': 'Custom Tooling',
          'Selected Variant / Size': cit.dimensions || cit.specifications || '',
          'Requested Quantity': cit.quantity,
          'Item Specific Notes': `Material: ${cit.material || 'N/A'} | App: ${cit.intendedApplication || 'N/A'} | Notes: ${cit.notes || ''}`
        });
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Enquiry Items');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="PRAZTECH_Enquiry_Items.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/export/all (Combined workbook)
const exportAllCombined = async (req, res, next) => {
  try {
    const customers = await getAllCustomers();
    const enquiries = await getAllEnquiries();

    const customerRows = customers.map((c, idx) => ({
      'S.No': idx + 1,
      'Customer Name': c.fullName,
      'Company Name': c.company || 'N/A (Individual)',
      'Email Address': c.email,
      'Phone Number': c.phone,
      'WhatsApp': c.whatsapp || '',
      'Country': c.country,
      'State': c.state,
      'City': c.city,
      'Full Address': c.address || '',
      'GSTIN': c.gstin || '',
      'Total Enquiries': c.enquiryCount || 1,
      'Enquiry References': (c.enquiryIds || []).join(', '),
      'Joined Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
    }));

    const enquiryRows = enquiries.map((e, idx) => {
      const c = e.customerSnapshot || {};
      return {
        'S.No': idx + 1,
        'Enquiry Reference': e.referenceNumber,
        'Date Submitted': new Date(e.submittedAt).toLocaleString(),
        'Status': e.status,
        'Customer Name': c.fullName,
        'Company': c.company || 'N/A',
        'Email': c.email,
        'Phone': c.phone,
        'WhatsApp': c.whatsapp || '',
        'Location': `${c.city || ''}, ${c.state || ''}, ${c.country || ''}`,
        'Catalogue Items Count': (e.catalogueItems || []).length,
        'Custom Items Count': (e.customItems || []).length,
        'Customer Instructions': e.generalNotes || ''
      };
    });

    const itemRows = [];
    let counter = 1;
    enquiries.forEach(e => {
      const c = e.customerSnapshot || {};
      const ref = e.referenceNumber;
      const date = new Date(e.submittedAt).toLocaleDateString();

      (e.catalogueItems || []).forEach(it => {
        let subModelInfo = '';
        if (it.selectedSubModel && typeof it.selectedSubModel === 'object') {
          subModelInfo = it.selectedSubModel.modelNo || it.selectedSubModel.size || it.selectedSubModel.sizeMm || '';
        }
        itemRows.push({
          'Item ID': counter++,
          'Enquiry Reference': ref,
          'Date': date,
          'Customer Name': c.fullName,
          'Company': c.company || 'N/A',
          'Item Type': 'Catalogue Product',
          'Model No': it.modelNo,
          'Product Name': it.name,
          'Category': it.category,
          'Selected Variant / Size': subModelInfo || 'Standard',
          'Requested Quantity': it.quantity,
          'Item Notes': it.notes || ''
        });
      });

      (e.customItems || []).forEach(cit => {
        itemRows.push({
          'Item ID': counter++,
          'Enquiry Reference': ref,
          'Date': date,
          'Customer Name': c.fullName,
          'Company': c.company || 'N/A',
          'Item Type': 'Custom Product',
          'Model No': '[CUSTOM REQUEST]',
          'Product Name': cit.productName,
          'Category': 'Custom Tooling',
          'Selected Variant / Size': cit.dimensions || cit.specifications || '',
          'Requested Quantity': cit.quantity,
          'Item Notes': `Material: ${cit.material || ''} | App: ${cit.intendedApplication || ''} | Notes: ${cit.notes || ''}`
        });
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customerRows), 'Customers');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(enquiryRows), 'Enquiries');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows), 'Enquiry Items');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="PRAZTECH_Complete_Catalogue_Exports.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportCustomers,
  exportEnquiries,
  exportEnquiryItems,
  exportAllCombined
};
