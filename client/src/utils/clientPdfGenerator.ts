import jsPDF from 'jspdf';
import { EnquiryResponseData } from '../types';
import { formatDateDDMMYY } from './dateFormat';

/**
 * Generates an official PRAZTECH® Engineering Quotation Enquiry PDF client-side
 * with industrial branding, customer details, and itemized tabular layout.
 */
export const generateClientSideEnquiryPDF = (
  enquiryData: EnquiryResponseData | any,
  refNumber?: string
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const ref = refNumber || enquiryData?.referenceNumber || `ENQ-${Date.now()}`;
  const cust = enquiryData?.customer || enquiryData?.customerSnapshot || {};
  const catItems = enquiryData?.catalogueItems || [];
  const custItems = enquiryData?.customItems || [];
  const submittedDate = formatDateDDMMYY(enquiryData?.submittedAt || Date.now());

  const brandPrimary = [46, 7, 93]; // #2e075d
  const brandAccent = [94, 62, 139]; // #5e3e8b
  const textDark = [30, 30, 30];
  const textMuted = [100, 100, 100];
  const bgLight = [247, 245, 250]; // #f7f5fa
  const borderLight = [223, 213, 232]; // #dfd5e8

  // Margins & Dimensions
  const startX = 14;
  const contentWidth = 182; // 210 - 28

  // 1. Header Banner
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PRAZTECH® ENGINEERING', startX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Automotive Valve Rebuilding & Precision Tooling Manufacturer', startX, 23);

  // Business Contacts (Right aligned)
  doc.setFontSize(8);
  doc.text('Asaf Ali Rd, Delhi, 110002, India', 210 - startX, 15, { align: 'right' });
  doc.text('Email: xiscoenterprises@gmail.com', 210 - startX, 19.5, { align: 'right' });
  doc.text('Phone: +91 8744020102', 210 - startX, 24, { align: 'right' });
  doc.text('Web: https://praztech.com', 210 - startX, 28.5, { align: 'right' });

  // Header Divider Line
  doc.setDrawColor(brandAccent[0], brandAccent[1], brandAccent[2]);
  doc.setLineWidth(0.5);
  doc.line(startX, 32, 210 - startX, 32);

  // 2. Document Title Banner
  doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.rect(startX, 35, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('PRODUCT ENQUIRY / REQUEST FOR QUOTATION', 105, 40.5, { align: 'center' });

  // 3. Reference Strip
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.3);
  doc.rect(startX, 45, contentWidth, 8, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Enquiry Reference: ', startX + 3, 50.2);

  doc.setTextColor(brandAccent[0], brandAccent[1], brandAccent[2]);
  doc.text(ref, startX + 34, 50.2);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Date Submitted: ', 135, 50.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(submittedDate, 160, 50.2);

  // 4. Customer Details Box
  let y = 57;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text('CUSTOMER & BUSINESS INFORMATION', startX, y);

  y += 3;
  const custBoxHeight = 26;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(startX, y, contentWidth, custBoxHeight, 'D');

  doc.setFontSize(8);
  const col1LabelX = startX + 3;
  const col1ValX = startX + 26;
  const col2LabelX = startX + 95;
  const col2ValX = startX + 115;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Contact Name:', col1LabelX, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(cust.fullName || '—', col1ValX, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Email:', col2LabelX, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(cust.email || '—', col2ValX, y + 6);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Company:', col1LabelX, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(cust.company || 'Individual / Workshop', col1ValX, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Phone:', col2LabelX, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(cust.phone || '—', col2ValX, y + 12);

  // Row 3
  const locationStr = [cust.city, cust.state, cust.country].filter(Boolean).join(', ') || 'India';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Location:', col1LabelX, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(locationStr, col1ValX, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('GSTIN:', col2LabelX, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(cust.gstin || '—', col2ValX, y + 18);

  // 5. Items Table
  y += custBoxHeight + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.text('ENQUIRED TOOLING ITEMS & SPECIFICATIONS', startX, y);

  y += 3;
  const thHeight = 7;
  doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.rect(startX, y, contentWidth, thHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colNoX = startX + 3;
  const colModelX = startX + 12;
  const colDescX = startX + 46;
  const colQtyX = startX + 168;

  doc.text('#', colNoX, y + 4.8);
  doc.text('Model / SKU', colModelX, y + 4.8);
  doc.text('Description & Variants', colDescX, y + 4.8);
  doc.text('Qty', colQtyX, y + 4.8, { align: 'center' });

  y += thHeight;

  // Table Body Rows
  let itemIndex = 1;
  const allItems = [
    ...catItems.map((it: any) => ({ ...it, isCustom: false })),
    ...custItems.map((it: any) => ({ ...it, isCustom: true }))
  ];

  doc.setFontSize(8);

  allItems.forEach((it: any) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const rowHeight = 10;
    const isEven = itemIndex % 2 === 0;

    if (isEven) {
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(startX, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(startX, y + rowHeight, startX + contentWidth, y + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(String(itemIndex), colNoX, y + 6);

    doc.setFont('helvetica', 'bold');
    const sku = it.modelNo || (it.isCustom ? 'CUSTOM-ITEM' : 'STANDARD');
    doc.text(sku.slice(0, 18), colModelX, y + 6);

    doc.setFont('helvetica', 'normal');
    let descText = it.name || it.productName || 'Tooling unit';
    if (it.selectedSubModel) {
      const sm = it.selectedSubModel;
      const opts = Object.entries(sm.options || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      if (opts) descText += ` (${opts})`;
      else if (sm.label) descText += ` (${sm.label})`;
    }
    if (it.notes) descText += ` • Notes: ${it.notes}`;

    doc.text(descText.slice(0, 75), colDescX, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(String(it.quantity || 1), colQtyX, y + 6, { align: 'center' });

    y += rowHeight;
    itemIndex++;
  });

  // General Notes Box
  if (enquiryData?.generalNotes && y < 255) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
    doc.text('Customer Special Notes:', startX, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(enquiryData.generalNotes.slice(0, 200), startX, y);
    y += 6;
  }

  // Footer Disclaimer
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.line(startX, 278, startX + contentWidth, 278);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'This is an official computer-generated quotation request summary issued by PRAZTECH® Engineering. Formal pricing, blueprint assessments, and freight lead times will be provided by sales engineers within 24 business hours.',
    105,
    283,
    { align: 'center', maxWidth: contentWidth }
  );

  doc.save(`PRAZTECH_Enquiry_${ref}.pdf`);
};
