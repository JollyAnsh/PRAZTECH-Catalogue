const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { resolveProductImagePath } = require('./imageResolver');

/**
 * Normalizes phone number into international format for WhatsApp wa.me link
 * e.g., '9877243231' -> '919877243231', '+91 8744020102' -> '918744020102'
 */
const cleanWaNumber = (phoneStr) => {
  if (!phoneStr) return '';
  let digits = phoneStr.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = '91' + digits.slice(1);
  }
  return digits;
};

const sendEnquiryEmails = async (enquiryData, pdfPath) => {
  const result = {
    customerEmailSent: false,
    businessEmailSent: false,
    errors: []
  };

  const provider = process.env.EMAIL_PROVIDER || 'mock';
  const cust = enquiryData.customerSnapshot || {};
  const ref = enquiryData.referenceNumber;
  const bizEmail = process.env.BUSINESS_EMAIL || 'xiscoenterprises@gmail.com';
  const fromEmail = process.env.EMAIL_FROM || 'PRAZTECH® Enquiries <xiscoenterprises@gmail.com>';

  // Build attachments list with PDF and inline image CIDs
  const attachments = [];
  if (fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `PRAZTECH_Enquiry_${ref}.pdf`,
      path: pdfPath
    });
  }

  const itemThumbMap = {}; // idx -> cid
  (enquiryData.catalogueItems || []).forEach((it, idx) => {
    const imgPath = resolveProductImagePath(it);
    if (imgPath && fs.existsSync(imgPath)) {
      const cid = `prod_thumb_${idx}`;
      itemThumbMap[idx] = cid;
      attachments.push({
        filename: `product_${idx + 1}.png`,
        path: imgPath,
        cid: cid
      });
    }
  });

  // Pre-generate WhatsApp & Mailto Quick-Quote replies for business owner
  const customerWaNumber = cleanWaNumber(cust.whatsapp || cust.phone);

  const textQuoteItems = [];
  (enquiryData.catalogueItems || []).forEach((it, idx) => {
    const sku = (it.modelNo || '').trim().replace(/\s*-\s*/g, '-').toUpperCase();
    let variantDesc = '';
    if (it.selectedSubModel && typeof it.selectedSubModel === 'object') {
      const vKey = it.selectedSubModel.sizeInches ? `${it.selectedSubModel.sizeInches} (${it.selectedSubModel.sizeMm || ''})` : (it.selectedSubModel.modelNo || it.selectedSubModel.sku || it.selectedSubModel.size || it.selectedSubModel.sizeMm || '');
      if (vKey) variantDesc += ` - Size/Variant: ${vKey}`;
      if (it.selectedSubModel.stoneColor) variantDesc += ` [${it.selectedSubModel.stoneColor} Abrasive Stone]`;
    }
    textQuoteItems.push(`${idx + 1}. *${sku}*${variantDesc} (Qty: ${it.quantity})\n   Rate: ₹_____`);
  });
  (enquiryData.customItems || []).forEach((cit, idx) => {
    const num = (enquiryData.catalogueItems || []).length + idx + 1;
    textQuoteItems.push(`${num}. *[Custom] ${(cit.productName || '').toUpperCase()}* (Qty: ${cit.quantity})\n   Rate: ₹_____`);
  });

  const waQuoteMessage = 
`Hello ${cust.fullName || 'Customer'},
Thank you for reaching out to PRAZTECH® Engineering (Ref: ${ref}).

Here is the quotation for your enquired items:

${textQuoteItems.join('\n\n')}

• Shipping / Freight: ₹_____ (Courier / Express Air Cargo)
• Dispatch Time: Dispatched within 2-3 business days
• Import Notice: Your package will be subject to custom duty or taxes on import. You will be responsible and will have to pay them for the same. We are not liable.
• Contact: +91 8744020102 / xiscoenterprises@gmail.com

Please review and confirm to proceed.

Best regards,
PRAZTECH® Engineering`;

  const waReplyUrl = customerWaNumber
    ? `https://wa.me/${customerWaNumber}?text=${encodeURIComponent(waQuoteMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waQuoteMessage)}`;

  const mailQuoteSubject = `Quotation for Enquiry ${ref} - PRAZTECH® Engineering`;
  const mailQuoteBody = 
`Dear ${cust.fullName || 'Customer'},

Thank you for your enquiry with PRAZTECH® Engineering regarding Reference: ${ref}.

We are pleased to provide you with the quotation for your requested items:

${(enquiryData.catalogueItems || []).map((it, idx) => {
  const sku = (it.modelNo || '').trim().replace(/\s*-\s*/g, '-').toUpperCase();
  let vInfo = '';
  if (it.selectedSubModel && typeof it.selectedSubModel === 'object') {
    const vKey = it.selectedSubModel.sizeInches ? `${it.selectedSubModel.sizeInches} (${it.selectedSubModel.sizeMm || ''})` : (it.selectedSubModel.modelNo || it.selectedSubModel.sku || it.selectedSubModel.size || it.selectedSubModel.sizeMm || '');
    if (vKey) vInfo += ` [Size: ${vKey}]`;
    if (it.selectedSubModel.stoneColor) vInfo += ` [${it.selectedSubModel.stoneColor} Abrasive Stone]`;
  }
  return `${idx + 1}. ${sku} - ${it.name}${vInfo}\n   Quantity: ${it.quantity}\n   Rate: INR _____ / unit`;
}).join('\n\n')}
${(enquiryData.customItems || []).map((cit, idx) => `${(enquiryData.catalogueItems || []).length + idx + 1}. [Custom] ${cit.productName}\n   Quantity: ${cit.quantity}\n   Rate: INR _____ / unit`).join('\n\n')}

Shipping & Import Terms:
- Shipping / Freight: INR _____ (Door-to-door courier / Air freight)
- Dispatch Schedule: Within 2-3 business days after order confirmation
- Import Customs & Taxes: Your package will be subject to custom duty or taxes on import. You will be responsible and will have to pay them for the same. We are not liable.

Should you require any customization or technical clarification, feel free to contact us at +91 8744020102.

Best regards,
Sales & Engineering Team
PRAZTECH® Engineering
Asaf Ali Rd, Delhi, 110002
Phone / WA: +91 8744020102
Email: xiscoenterprises@gmail.com`;

  const mailtoReplyUrl = `mailto:${encodeURIComponent(cust.email || '')}?subject=${encodeURIComponent(mailQuoteSubject)}&body=${encodeURIComponent(mailQuoteBody)}`;

  // --- Customer Email Template ---
  const customerHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 650px; margin: 0 auto; color: #1a1a1a; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
      <div style="background: #2c114b; padding: 25px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">PRAZTECH® Engineering</h1>
        <p style="color: #ede8f5; margin: 5px 0 0; font-size: 13px;">Precision-Engineered Tools</p>
      </div>
      
      <div style="padding: 28px 25px;">
        <h2 style="color: #2c114b; font-size: 18px; margin-top: 0;">Quotation Enquiry Received</h2>
        <p>Dear ${cust.fullName || 'Valued Customer'},</p>
        <p>Thank you for submitting your enquiry to <strong>PRAZTECH® Engineering</strong>. We have successfully logged your quotation request.</p>
        
        <div style="background: #f8f6fc; border-left: 4px solid #5f3f8c; padding: 12px 18px; margin: 18px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #555;">Enquiry Reference Number:</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #2c114b; font-family: monospace;">${ref}</p>
        </div>

        <div style="background: #eef7ee; border-left: 4px solid #28a745; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13.5px; color: #155724; font-weight: bold;">
            ⏱️ Next Steps: A dedicated member of our sales & engineering team will review your specifications and get back to you shortly with formal quotation pricing and dispatch lead time.
          </p>
        </div>
        
        <h3 style="color: #2c114b; font-size: 15px; border-bottom: 2px solid #ede8f5; padding-bottom: 8px; margin-top: 25px;">Requested Items Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 15px 0;">
          <thead>
            <tr style="background: #ede8f5; color: #2c114b; text-align: left;">
              <th style="padding: 10px 8px; width: 56px; text-align: center;">Photo</th>
              <th style="padding: 10px 10px;">SKU / Product Model</th>
              <th style="padding: 10px 10px;">Category</th>
              <th style="padding: 10px 10px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${(enquiryData.catalogueItems || []).map((it, idx) => {
              const cid = itemThumbMap[idx];
              const sku = (it.modelNo || '').trim().replace(/\s*-\s*/g, '-').toUpperCase();
              let vBadge = '';
              if (it.selectedSubModel && typeof it.selectedSubModel === 'object') {
                const subKey = it.selectedSubModel.sizeInches ? `${it.selectedSubModel.sizeInches} (${it.selectedSubModel.sizeMm || ''})` : (it.selectedSubModel.modelNo || it.selectedSubModel.sku || it.selectedSubModel.size || it.selectedSubModel.sizeMm || '');
                const colorInfo = it.selectedSubModel.stoneColor ? ` • ${it.selectedSubModel.stoneColor} Abrasive` : '';
                if (subKey || colorInfo) {
                  vBadge = `<br/><span style="display: inline-block; background: #ede8f5; color: #2c114b; font-size: 10.5px; font-weight: bold; padding: 2px 6px; border-radius: 3px; margin-top: 3px;">Variant: ${subKey}${colorInfo}</span>`;
                }
              }
              return `
                <tr style="border-bottom: 1px solid #f1f3f6;">
                  <td style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                    ${cid ? `<img src="cid:${cid}" width="46" height="46" style="display: block; width: 46px; height: 46px; object-fit: contain; border-radius: 4px; border: 1px solid #e2e8f0; background: #ffffff; margin: 0 auto;" alt="${sku}" />` : `<div style="width: 46px; height: 46px; background: #f8f6fc; border-radius: 4px; line-height: 46px; text-align: center; font-size: 10px; color: #888; margin: 0 auto;">Tooling</div>`}
                  </td>
                  <td style="padding: 10px 10px; vertical-align: middle;">
                    <strong style="color: #1a1a1a;">${sku}</strong><br/>
                    <span style="color: #666; font-size: 11.5px;">${it.name}</span>
                    ${vBadge}
                    ${it.notes ? `<br/><span style="color: #b45309; font-size: 11px;">Note: ${it.notes}</span>` : ''}
                  </td>
                  <td style="padding: 10px 10px; color: #555; vertical-align: middle;">${it.category}</td>
                  <td style="padding: 10px 10px; text-align: center; font-weight: bold; font-size: 14px; color: #2c114b; vertical-align: middle;">${it.quantity}</td>
                </tr>
              `;
            }).join('')}
            ${(enquiryData.customItems || []).map(cit => `
              <tr style="border-bottom: 1px solid #f1f3f6; background: #fffdf5;">
                <td style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                  <div style="width: 46px; height: 46px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; line-height: 46px; text-align: center; font-size: 10px; font-weight: bold; color: #b45309; margin: 0 auto;">CUSTOM</div>
                </td>
                <td style="padding: 10px 10px; vertical-align: middle;">
                  <strong style="color: #b45309;">${cit.productName}</strong><br/>
                  <span style="color: #666; font-size: 11.5px;">${cit.specifications || ''}</span>
                  ${cit.intendedApplication ? `<br/><span style="color: #666; font-size: 11px;">Application: ${cit.intendedApplication}</span>` : ''}
                </td>
                <td style="padding: 10px 10px; color: #b45309; vertical-align: middle;">Custom Tooling</td>
                <td style="padding: 10px 10px; text-align: center; font-weight: bold; font-size: 14px; color: #2c114b; vertical-align: middle;">${cit.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p style="font-size: 12px; color: #666; background: #f8f6fc; padding: 12px; border-radius: 4px; margin-top: 20px;">
          <em>Note: A complete PDF copy of your enquiry is attached to this email for your records. A PRAZTECH® team member will get back to you shortly with formal pricing.</em>
        </p>
        
        <div style="margin-top: 30px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666;">
          <p style="margin: 0; font-weight: bold; color: #2c114b; font-size: 13px;">PRAZTECH® Engineering</p>
          <p style="margin: 4px 0;">Email: ${process.env.BUSINESS_EMAIL || 'xiscoenterprises@gmail.com'} | Phone / WA: ${process.env.BUSINESS_PHONE || '+91 8744020102'}</p>
          <p style="margin: 2px 0;">Address: ${process.env.BUSINESS_ADDRESS || 'Asaf Ali Rd, Delhi, 110002'}</p>
        </div>
      </div>
    </div>
  `;

  // --- Business Notification Email Template ---
  // Note: "Location" is completely removed; only "Address" is retained.
  // Includes Quick Reply buttons for WhatsApp and Email with pre-filled items & rates template.
  const businessHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 680px; margin: 0 auto; color: #1a1a1a; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
      <div style="background: #2d065c; padding: 22px 25px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">🔔 New RFQ Enquiry: ${ref}</h2>
        <p style="margin: 5px 0 0; font-size: 13px; color: #ede8f5;">PRAZTECH® B2B Catalogue System</p>
      </div>

      <div style="padding: 25px;">
        <!-- Quick Action Reply Buttons -->
        <div style="background: #fcf9fe; border: 1.5px solid #d8b4fe; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 12px; font-weight: bold; color: #2c114b; font-size: 14px;">⚡ Quick Reply Actions (Opens pre-filled quote template):</p>
          <div style="display: inline-block;">
            <a href="${waReplyUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 11px 22px; font-weight: bold; border-radius: 6px; font-size: 13.5px; margin: 5px 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.12);">
              💬 Reply & Send Quote on WhatsApp
            </a>
            <a href="${mailtoReplyUrl}" target="_blank" style="display: inline-block; background-color: #2c114b; color: #ffffff; text-decoration: none; padding: 11px 22px; font-weight: bold; border-radius: 6px; font-size: 13.5px; margin: 5px 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.12);">
              ✉️ Reply & Send Quote via Email
            </a>
          </div>
        </div>

        <h3 style="color: #2c114b; font-size: 15px; margin-top: 0; border-bottom: 2px solid #ede8f5; padding-bottom: 6px;">Customer Information</h3>
        <p style="font-size: 13.5px; line-height: 1.8;">
          <strong>Name:</strong> ${cust.fullName || '—'}<br/>
          <strong>Company:</strong> ${cust.company || 'Individual / Non-commercial'}<br/>
          <strong>Email:</strong> <a href="mailto:${cust.email}" style="color: #5f3f8c;">${cust.email}</a><br/>
          <strong>Phone:</strong> ${cust.phone || '—'}<br/>
          <strong>WhatsApp:</strong> ${cust.whatsapp ? `<a href="https://wa.me/${cleanWaNumber(cust.whatsapp)}" style="color: #25D366; font-weight: bold;">${cust.whatsapp}</a>` : 'Same as Phone / Not Provided'}<br/>
          <strong>Address:</strong> ${cust.address ? `${cust.address}${cust.city ? `, ${cust.city}` : ''}${cust.state ? `, ${cust.state}` : ''}${cust.country ? `, ${cust.country}` : ''}` : 'N/A'}<br/>
          <strong>GSTIN:</strong> ${cust.gstin || 'N/A'}
        </p>

        <h3 style="color: #2c114b; font-size: 15px; border-bottom: 2px solid #ede8f5; padding-bottom: 6px; margin-top: 25px;">
          Requested Products (${(enquiryData.catalogueItems || []).length} Catalogue, ${(enquiryData.customItems || []).length} Custom)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 15px 0;">
          <thead>
            <tr style="background: #ede8f5; color: #2c114b; text-align: left;">
              <th style="padding: 10px 8px; width: 56px; text-align: center;">Photo</th>
              <th style="padding: 10px 10px;">SKU / Product Model</th>
              <th style="padding: 10px 10px;">Category</th>
              <th style="padding: 10px 10px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${(enquiryData.catalogueItems || []).map((it, idx) => {
              const cid = itemThumbMap[idx];
              const sku = (it.modelNo || '').trim().replace(/\s*-\s*/g, '-').toUpperCase();
              let vBadge = '';
              if (it.selectedSubModel && typeof it.selectedSubModel === 'object') {
                const subKey = it.selectedSubModel.sizeInches ? `${it.selectedSubModel.sizeInches} (${it.selectedSubModel.sizeMm || ''})` : (it.selectedSubModel.modelNo || it.selectedSubModel.sku || it.selectedSubModel.size || it.selectedSubModel.sizeMm || '');
                const colorInfo = it.selectedSubModel.stoneColor ? ` • ${it.selectedSubModel.stoneColor} Abrasive` : '';
                if (subKey || colorInfo) {
                  vBadge = `<br/><span style="display: inline-block; background: #ede8f5; color: #2c114b; font-size: 10.5px; font-weight: bold; padding: 2px 6px; border-radius: 3px; margin-top: 3px;">Variant: ${subKey}${colorInfo}</span>`;
                }
              }
              return `
                <tr style="border-bottom: 1px solid #f1f3f6;">
                  <td style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                    ${cid ? `<img src="cid:${cid}" width="46" height="46" style="display: block; width: 46px; height: 46px; object-fit: contain; border-radius: 4px; border: 1px solid #e2e8f0; background: #ffffff; margin: 0 auto;" alt="${sku}" />` : `<div style="width: 46px; height: 46px; background: #f8f6fc; border-radius: 4px; line-height: 46px; text-align: center; font-size: 10px; color: #888; margin: 0 auto;">Tooling</div>`}
                  </td>
                  <td style="padding: 10px 10px; vertical-align: middle;">
                    <strong style="color: #1a1a1a;">${sku}</strong><br/>
                    <span style="color: #666; font-size: 11.5px;">${it.name}</span>
                    ${vBadge}
                    ${it.notes ? `<br/><span style="color: #b45309; font-size: 11px;"><strong>Item Note:</strong> ${it.notes}</span>` : ''}
                  </td>
                  <td style="padding: 10px 10px; color: #555; vertical-align: middle;">${it.category}</td>
                  <td style="padding: 10px 10px; text-align: center; font-weight: bold; font-size: 14px; color: #2c114b; vertical-align: middle;">${it.quantity}</td>
                </tr>
              `;
            }).join('')}
            ${(enquiryData.customItems || []).map(cit => `
              <tr style="border-bottom: 1px solid #f1f3f6; background: #fffdf5;">
                <td style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                  <div style="width: 46px; height: 46px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; line-height: 46px; text-align: center; font-size: 10px; font-weight: bold; color: #b45309; margin: 0 auto;">CUSTOM</div>
                </td>
                <td style="padding: 10px 10px; vertical-align: middle;">
                  <strong style="color: #b45309;">${cit.productName}</strong><br/>
                  <span style="color: #666; font-size: 11.5px;">${cit.specifications || ''}</span>
                  ${cit.notes ? `<br/><span style="color: #666; font-size: 11px;">Notes: ${cit.notes}</span>` : ''}
                </td>
                <td style="padding: 10px 10px; color: #b45309; vertical-align: middle;">Custom Tooling</td>
                <td style="padding: 10px 10px; text-align: center; font-weight: bold; font-size: 14px; color: #2c114b; vertical-align: middle;">${cit.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${enquiryData.generalNotes ? `
          <div style="background: #f8f6fc; border-left: 4px solid #5f3f8c; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; color: #555;">Customer Special Instructions:</p>
            <p style="margin: 4px 0 0; font-size: 13.5px; color: #1a1a1a;">${enquiryData.generalNotes}</p>
          </div>
        ` : ''}

        <p style="color: #666; font-size: 12px; margin-top: 25px;">PDF copy is attached to this notification.</p>
      </div>
    </div>
  `;

  // --- Dispatch: Mock Mode ---
  if (provider === 'mock') {
    console.log('\n📧 [MOCK EMAIL SERVICE] Email dispatched in mock/dev mode:');
    console.log(`   Customer Email (${cust.email}): Subject: "PRAZTECH® Enquiry Confirmation - ${ref}"`);
    console.log(`   Business Email (${bizEmail}): Subject: "New RFQ Enquiry: ${ref}"`);
    console.log(`   Attachments (${attachments.length}): ${attachments.map(a => a.filename || a.cid).join(', ')}\n`);
    result.customerEmailSent = true;
    result.businessEmailSent = true;
    return result;
  }

  // --- Dispatch: Resend Provider ---
  if (provider === 'resend') {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const resendAttachments = attachments.map(att => ({
        filename: att.filename,
        content: fs.readFileSync(att.path)
      }));

      // Send Customer Email
      await resend.emails.send({
        from: fromEmail,
        to: cust.email,
        subject: `PRAZTECH® Quotation Enquiry Confirmation - ${ref}`,
        html: customerHtml,
        attachments: resendAttachments
      });
      result.customerEmailSent = true;

      // Send Business Email
      await resend.emails.send({
        from: fromEmail,
        to: bizEmail,
        subject: `[New Enquiry] ${ref} - ${cust.company || cust.fullName}`,
        html: businessHtml,
        attachments: resendAttachments
      });
      result.businessEmailSent = true;
    } catch (err) {
      console.error('❌ Resend Email Error:', err.message);
      result.errors.push(`Resend error: ${err.message}`);
    }
  }

  // --- Dispatch: SMTP Provider (Gmail / Standard SMTP) ---
  if (provider === 'smtp') {
    try {
      if (!process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP_PASS is not configured in .env. Falling back to mock email logging.');
        result.errors.push('SMTP password not set in .env');
        return result;
      }

      const cleanPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
      const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
      const transporterConfig = isGmail
        ? {
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER || process.env.BUSINESS_EMAIL,
              pass: cleanPass
            }
          }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: cleanPass
            }
          };

      const transporter = nodemailer.createTransport(transporterConfig);

      // Send Customer Email
      await transporter.sendMail({
        from: fromEmail,
        to: cust.email,
        subject: `PRAZTECH® Quotation Enquiry Confirmation - ${ref}`,
        html: customerHtml,
        attachments: attachments
      });
      result.customerEmailSent = true;

      // Send Business Email
      await transporter.sendMail({
        from: fromEmail,
        to: bizEmail,
        subject: `[New Enquiry] ${ref} - ${cust.company || cust.fullName}`,
        html: businessHtml,
        attachments: attachments
      });
      result.businessEmailSent = true;
      console.log(`✅ Emails successfully sent for ${ref} with ${attachments.length} attachments (PDF + thumbnails).`);
    } catch (err) {
      console.error('❌ SMTP Email Error:', err.message);
      result.errors.push(`SMTP error: ${err.message}`);
    }
  }

  return result;
};

/**
 * Sends a factory-direct contact form inquiry notification to the business
 * and an acknowledgement confirmation to the customer.
 */
const sendContactFormEmail = async (contactData) => {
  const result = {
    businessEmailSent: false,
    customerEmailSent: false,
    errors: []
  };

  const provider = process.env.EMAIL_PROVIDER || 'mock';
  const { name, email, phone = '', company = '', message } = contactData;
  const bizEmail = process.env.BUSINESS_EMAIL || 'xiscoenterprises@gmail.com';
  const fromEmail = process.env.EMAIL_FROM || 'PRAZTECH® Enquiries <xiscoenterprises@gmail.com>';

  const businessSubject = `[Direct Contact] Inquiry from ${name}${company ? ' (' + company + ')' : ''}`;
  const businessHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #dfd5e8; border-radius: 8px; overflow: hidden;">
      <div style="background: #2e075d; color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">PRAZTECH® Engineering • Website Contact Message</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #dfd5e8;">Factory-direct advisory enquiry received</p>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 130px; font-weight: bold;">Sender Name:</td>
            <td style="padding: 8px 0; color: #111;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Email Address:</td>
            <td style="padding: 8px 0; color: #111;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0; color: #111;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Company:</td>
            <td style="padding: 8px 0; color: #111;">${company || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Received At:</td>
            <td style="padding: 8px 0; color: #111;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
          </tr>
        </table>
        <div style="background: #f7f5fa; border-left: 4px solid #5e3e8b; padding: 14px 18px; border-radius: 4px;">
          <strong style="color: #2e075d; display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 6px;">Message Content:</strong>
          <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    </div>
  `;

  // 1. Mock Mode
  if (provider === 'mock') {
    console.log('\n📧 [MOCK EMAIL SERVICE] Contact message logged in mock mode:');
    console.log(`   To: ${bizEmail} | Subject: "${businessSubject}"`);
    console.log(`   From: ${name} <${email}> | Message: ${message.slice(0, 80)}...\n`);
    result.businessEmailSent = true;
    result.customerEmailSent = true;
    return result;
  }

  // 2. Resend Provider
  if (provider === 'resend') {
    try {
      if (!process.env.RESEND_API_KEY) {
        result.errors.push('RESEND_API_KEY is not configured in environment');
        return result;
      }
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: fromEmail,
        to: bizEmail,
        subject: businessSubject,
        html: businessHtml
      });
      result.businessEmailSent = true;
    } catch (err) {
      console.error('❌ Resend Contact Email Error:', err.message);
      result.errors.push(`Resend error: ${err.message}`);
    }
    return result;
  }

  // 3. SMTP Provider
  if (provider === 'smtp') {
    try {
      if (!process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP_PASS is not configured in .env for contact email delivery.');
        result.errors.push('SMTP credentials not configured on server (SMTP_PASS missing).');
        return result;
      }

      const cleanPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
      const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
      const transporterConfig = isGmail
        ? {
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER || process.env.BUSINESS_EMAIL,
              pass: cleanPass
            }
          }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: cleanPass
            }
          };

      const transporter = nodemailer.createTransport(transporterConfig);

      await transporter.sendMail({
        from: fromEmail,
        to: bizEmail,
        subject: businessSubject,
        html: businessHtml
      });
      result.businessEmailSent = true;
      console.log(`✅ Contact notification email sent to ${bizEmail} for sender ${email}.`);
    } catch (err) {
      console.error('❌ SMTP Contact Email Error:', err.message);
      result.errors.push(`SMTP error: ${err.message}`);
    }
    return result;
  }

  result.errors.push(`Unknown email provider: ${provider}`);
  return result;
};

module.exports = { sendEnquiryEmails, sendContactFormEmail };
