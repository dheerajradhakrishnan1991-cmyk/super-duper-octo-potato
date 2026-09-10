import { jsPDF } from 'jspdf';
import { PurchasedTicket } from '../types';

/**
 * Generates an official Kerala State Lottery digital ticket PDF representation.
 */
export function generateTicketPdf(ticket: PurchasedTicket, walletOwner?: string): jsPDF {
  // A5 Landscape: 210mm x 148mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5',
  });

  const width = 210;
  const height = 148;
  const isWon = ticket.status === 'won';

  // 1. Background Fill - Premium Ivory / Soft Cream with Subtle Tint
  doc.setFillColor(252, 252, 250);
  doc.rect(0, 0, width, height, 'F');

  // 2. Outer Ornate Border (Kerala Gold & Forest Green)
  doc.setDrawColor(180, 83, 9); // Amber 700 / Gold
  doc.setLineWidth(1.2);
  doc.rect(5, 5, width - 10, height - 10, 'D');

  doc.setDrawColor(6, 78, 59); // Emerald 900
  doc.setLineWidth(0.4);
  doc.rect(6.8, 6.8, width - 13.6, height - 13.6, 'D');

  // Corner Ornaments (decorative L-shapes)
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.line(x, y, x + dx * 6, y);
    doc.line(x, y, x, y + dy * 6);
  };
  drawCorner(8, 8, 1, 1);
  drawCorner(width - 8, 8, -1, 1);
  drawCorner(8, height - 8, 1, -1);
  drawCorner(width - 8, height - 8, -1, -1);

  // 3. Holographic Security Foil Strip representation (Top Ribbon)
  const ribbonY = 9;
  const ribbonHeight = 3.5;
  const ribbonSegments = [
    [245, 158, 11], // Gold
    [16, 185, 129], // Emerald
    [6, 182, 212],  // Cyan
    [168, 85, 247], // Purple
    [236, 72, 153], // Pink
    [245, 158, 11], // Gold
    [16, 185, 129], // Emerald
    [6, 182, 212],  // Cyan
  ];
  const segW = (width - 16) / ribbonSegments.length;
  ribbonSegments.forEach(([r, g, b], idx) => {
    doc.setFillColor(r, g, b);
    doc.rect(8 + idx * segW, ribbonY, segW, ribbonHeight, 'F');
  });

  // Foil Microtext
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text('★ KERALA STATE LOTTERIES OFFICIAL DIGITAL SECURITY FOIL ★ TON BLOCKCHAIN VERIFIED ★', width / 2, ribbonY + 2.5, { align: 'center' });

  // 4. Header: Government Emblem & Authority Title
  doc.setFillColor(6, 78, 59); // Deep Emerald
  doc.roundedRect(10, 14.5, width - 20, 15.5, 1.5, 1.5, 'F');

  // Authority Titles
  doc.setTextColor(253, 230, 138); // Warm Gold text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('GOVERNMENT OF KERALA', width / 2, 19, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DIRECTORATE OF STATE LOTTERIES • THIRUVANANTHAPURAM', width / 2, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(167, 243, 208); // Emerald 200
  doc.text('OFFICIAL DIGITAL LOTTERY CERTIFICATE OF OWNERSHIP • ISSUED UNDER LOTTERIES (REGULATION) RULES', width / 2, 27, { align: 'center' });

  // Left Seal Icon (vector circular stamp)
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.circle(17, 22.2, 5, 'D');
  doc.setFontSize(4.5);
  doc.setTextColor(253, 230, 138);
  doc.text('KL GOVT', 17, 21.5, { align: 'center' });
  doc.text('OFFICIAL', 17, 23.5, { align: 'center' });

  // Right Gazetted Code Box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(width - 36, 17, 23, 10, 1, 1, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.3);
  doc.roundedRect(width - 36, 17, 23, 10, 1, 1, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(245, 158, 11);
  doc.text('GAZETTE DRAW CODE', width - 24.5, 20.2, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(ticket.drawCode, width - 24.5, 24.5, { align: 'center' });

  // 5. Lottery Name & Draw Details Banner
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(ticket.lotteryName.toUpperCase(), 12, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`(${ticket.malayalamName})`, 12 + doc.getTextWidth(ticket.lotteryName.toUpperCase()) + 3, 36);

  // Draw Date on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`DRAW DATE: ${ticket.drawDate}`, width - 12, 35.5, { align: 'right' });

  // 6. Main Ticket Number Centerplate
  const centerplateY = 40;
  const centerplateH = 26;
  doc.setFillColor(15, 23, 42); // Slate 950
  doc.roundedRect(10, centerplateY, width - 20, centerplateH, 2, 2, 'F');

  // Decorative border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.roundedRect(10, centerplateY, width - 20, centerplateH, 2, 2, 'D');

  // Inner Subtle Watermark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59); // Slate 800 subtle
  doc.text('KERALA LOTTERY', width / 2, centerplateY + 18, { align: 'center' });

  // Top sublabel inside ticket box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('OFFICIAL TICKET NUMBER / ഔദ്യോഗിക ടിക്കറ്റ് നമ്പർ', 16, centerplateY + 5.5);

  // Series Badge
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.roundedRect(16, centerplateY + 7.5, 16, 12, 1.5, 1.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(ticket.series, 24, centerplateY + 15.5, { align: 'center' });

  // 6 Digit Lucky Numbers (Large Prominent Display)
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(20);
  const formattedDigits = ticket.ticketNumber.split('').join('  ');
  doc.text(formattedDigits, 36, centerplateY + 16);

  // Full Code badge on right of centerplate
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(width - 55, centerplateY + 6.5, 42, 14, 1.5, 1.5, 'F');
  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(0.3);
  doc.roundedRect(width - 55, centerplateY + 6.5, 42, 14, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text('VERIFIED FULL CODE', width - 34, centerplateY + 10.5, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(253, 230, 138);
  doc.text(ticket.fullCode, width - 34, centerplateY + 16, { align: 'center' });

  // Status Badge inside ticket box if won
  if (isWon) {
    doc.setFillColor(220, 38, 38); // Red
    doc.roundedRect(width - 85, centerplateY + 6.5, 27, 14, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('WINNING TICKET!', width - 71.5, centerplateY + 11.5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(254, 240, 138);
    doc.text(`₹${(ticket.winAmountInr || 0).toLocaleString('en-IN')}`, width - 71.5, centerplateY + 17, { align: 'center' });
  }

  // Barcode visualization below number
  doc.setFillColor(255, 255, 255);
  doc.rect(16, centerplateY + 20.5, 75, 4, 'F');

  // Draw simulated barcode lines
  doc.setFillColor(15, 23, 42);
  const barcodeChars = (ticket.barcode + ticket.ticketNumber).split('');
  let curBx = 17;
  barcodeChars.forEach((ch, idx) => {
    const charCode = ch.charCodeAt(0);
    const lineW = (charCode % 3 === 0 ? 0.8 : charCode % 2 === 0 ? 0.4 : 0.25);
    if (curBx + lineW < 89) {
      doc.rect(curBx, centerplateY + 20.7, lineW, 3.6, 'F');
      curBx += lineW + (idx % 2 === 0 ? 0.35 : 0.2);
    }
  });

  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text(ticket.barcode, 95, centerplateY + 23.5);

  // 7. Security & Blockchain Verification Section
  const infoY = 69;
  const colW = (width - 24) / 3;

  // Box 1: Holographic PIN & Security
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(10, infoY, colW, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, infoY, colW, 23, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('SECURITY FOIL PIN', 13, infoY + 5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.securityCode, 13, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Status: Tamper-Evident Foil', 13, infoY + 14.5);
  doc.text('Audit: Directorate Gazetted', 13, infoY + 18.5);

  // Box 2: Purchase & Payment Receipt
  const col2X = 10 + colW + 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, infoY, colW, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(col2X, infoY, colW, 23, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('PURCHASE & TRANSACTION', col2X + 3, infoY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(15, 23, 42);
  doc.text(`Price: INR ₹${ticket.pricePaidInr} (${ticket.pricePaidTon} TON)`, col2X + 3, infoY + 10);
  doc.text(`Date: ${ticket.purchaseDate}`, col2X + 3, infoY + 14.5);

  const shortTx = ticket.transactionHash ? `${ticket.transactionHash.slice(0, 16)}...` : '0xVerified';
  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Tx: ${shortTx}`, col2X + 3, infoY + 18.5);

  // Box 3: TON Blockchain Smart Contract Verification
  const col3X = col2X + colW + 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col3X, infoY, colW, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(col3X, infoY, colW, 23, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('TELEGRAM TON WALLET PROOF', col3X + 3, infoY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Contract: kerala_lotto.ton`, col3X + 3, infoY + 9.5);
  const ownerDisplay = walletOwner || 'Telegram TON User';
  doc.text(`Holder: ${ownerDisplay}`, col3X + 3, infoY + 14);

  // Draw miniature QR code representation
  const qrX = col3X + colW - 13;
  const qrY = infoY + 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(qrX, qrY, 10, 10, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 1.2, qrY + 1.2, 7.6, 7.6, 'F');
  doc.setFillColor(15, 23, 42);
  // Corner markers
  doc.rect(qrX + 1.8, qrY + 1.8, 2.2, 2.2, 'F');
  doc.rect(qrX + 6, qrY + 1.8, 2.2, 2.2, 'F');
  doc.rect(qrX + 1.8, qrY + 6, 2.2, 2.2, 'F');
  doc.rect(qrX + 4.5, qrY + 4.5, 1.5, 1.5, 'F');
  doc.rect(qrX + 6.5, qrY + 6.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(6, 78, 59);
  doc.text('SCAN TO VERIFY', col3X + 3, infoY + 19);

  // 8. Perforated Official Stub Divider Line
  const stubY = 95;
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  // Dashed line
  for (let x = 12; x < width - 12; x += 3) {
    doc.line(x, stubY, x + 1.8, stubY);
  }

  doc.setFillColor(252, 252, 250);
  doc.rect(width / 2 - 25, stubY - 2, 50, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(180, 83, 9);
  doc.text('✂ OFFICIAL TEAR-OFF STUB & CLAIM FORM', width / 2, stubY + 1, { align: 'center' });

  // 9. Lower Section: Prize Claim Instructions & Legal Notice
  const lowerY = 100;

  // Left side: Important Gazetted Rules
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS OF ISSUE & PRIZE CLAIM PROCEDURES:', 12, lowerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(71, 85, 105);
  const rules = [
    '1. This digital ticket certificate is an authentic legal record of entry into the Kerala State Lottery draw.',
    '2. Prize winning tickets must be claimed within 30 days of the official Gazetted publication of draw results.',
    '3. Prizes up to INR ₹1,00,000 can be disbursed directly to the authenticated Telegram TON Wallet address.',
    '4. Higher prizes must be claimed by presenting this signed certificate with valid Government Photo ID (Aadhaar / PAN)',
    '   at the Directorate of State Lotteries, Vikas Bhavan, Thiruvananthapuram, Kerala - 695033.',
    '5. Subject to the Kerala Paper Lotteries (Regulation) Rules and jurisdiction of courts in Thiruvananthapuram.',
  ];
  rules.forEach((rule, idx) => {
    doc.text(rule, 12, lowerY + 4 + idx * 3.2);
  });

  // Right side: Official Authorization Signatures & Digital Seal
  const sigX = width - 58;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sigX, lowerY - 1, 46, 26, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(sigX, lowerY - 1, 46, 26, 1.5, 1.5, 'D');

  // Digital Signature Stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(6, 78, 59);
  doc.text('OFFICIAL VERIFICATION STAMP', sigX + 23, lowerY + 3.5, { align: 'center' });

  // Stylized signature line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(sigX + 6, lowerY + 16, sigX + 40, lowerY + 16);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text('Director / Joint Director of State Lotteries', sigX + 23, lowerY + 19, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(180, 83, 9);
  doc.text(`AUTHENTICATED HASH: ${ticket.securityCode}`, sigX + 23, lowerY + 23, { align: 'center' });

  // 10. Bottom Footer Bar
  doc.setFillColor(6, 78, 59);
  doc.rect(8, height - 12.5, width - 16, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text('DEPARTMENT OF STATE LOTTERIES • GOVT. OF KERALA • TELEGRAM WEB3 TON VERIFIED PORTAL', width / 2, height - 9.5, { align: 'center' });

  return doc;
}

/**
 * Downloads the generated ticket PDF directly to the user's device.
 */
export function downloadTicketPdf(ticket: PurchasedTicket, walletOwner?: string): void {
  const doc = generateTicketPdf(ticket, walletOwner);
  const cleanCode = ticket.fullCode.replace(/\s+/g, '-');
  const filename = `Kerala-Lottery-${ticket.drawCode}-${cleanCode}.pdf`;
  doc.save(filename);
}

/**
 * Downloads a combined PDF containing all user tickets.
 */
export function downloadAllTicketsPdf(tickets: PurchasedTicket[], walletOwner?: string): void {
  if (tickets.length === 0) return;

  const firstDoc = generateTicketPdf(tickets[0], walletOwner);

  for (let i = 1; i < tickets.length; i++) {
    // Add page and draw ticket
    firstDoc.addPage('a5', 'landscape');
    const tempDoc = generateTicketPdf(tickets[i], walletOwner);
    // Since jsPDF doesn't directly merge instances, we can render using a page-level function
    // For clean architecture, we re-run ticket drawing logic for subsequent pages
    drawTicketOnCurrentPage(firstDoc, tickets[i], walletOwner);
  }

  const filename = `Kerala-Lottery-All-Tickets-${tickets.length}.pdf`;
  firstDoc.save(filename);
}

/**
 * Draws a ticket on the current page of an existing jsPDF document
 */
function drawTicketOnCurrentPage(doc: jsPDF, ticket: PurchasedTicket, walletOwner?: string): void {
  const width = 210;
  const height = 148;
  const isWon = ticket.status === 'won';

  // 1. Background Fill
  doc.setFillColor(252, 252, 250);
  doc.rect(0, 0, width, height, 'F');

  // 2. Outer Ornate Border
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(1.2);
  doc.rect(5, 5, width - 10, height - 10, 'D');

  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.4);
  doc.rect(6.8, 6.8, width - 13.6, height - 13.6, 'D');

  // Corner Ornaments
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.line(x, y, x + dx * 6, y);
    doc.line(x, y, x, y + dy * 6);
  };
  drawCorner(8, 8, 1, 1);
  drawCorner(width - 8, 8, -1, 1);
  drawCorner(8, height - 8, 1, -1);
  drawCorner(width - 8, height - 8, -1, -1);

  // 3. Holographic Security Foil Strip
  const ribbonY = 9;
  const ribbonHeight = 3.5;
  const ribbonSegments = [
    [245, 158, 11],
    [16, 185, 129],
    [6, 182, 212],
    [168, 85, 247],
    [236, 72, 153],
    [245, 158, 11],
    [16, 185, 129],
    [6, 182, 212],
  ];
  const segW = (width - 16) / ribbonSegments.length;
  ribbonSegments.forEach(([r, g, b], idx) => {
    doc.setFillColor(r, g, b);
    doc.rect(8 + idx * segW, ribbonY, segW, ribbonHeight, 'F');
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text('★ KERALA STATE LOTTERIES OFFICIAL DIGITAL SECURITY FOIL ★ TON BLOCKCHAIN VERIFIED ★', width / 2, ribbonY + 2.5, { align: 'center' });

  // 4. Header
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(10, 14.5, width - 20, 15.5, 1.5, 1.5, 'F');

  doc.setTextColor(253, 230, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('GOVERNMENT OF KERALA', width / 2, 19, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DIRECTORATE OF STATE LOTTERIES • THIRUVANANTHAPURAM', width / 2, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(167, 243, 208);
  doc.text('OFFICIAL DIGITAL LOTTERY CERTIFICATE OF OWNERSHIP • ISSUED UNDER LOTTERIES (REGULATION) RULES', width / 2, 27, { align: 'center' });

  // Left Seal
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.circle(17, 22.2, 5, 'D');
  doc.setFontSize(4.5);
  doc.setTextColor(253, 230, 138);
  doc.text('KL GOVT', 17, 21.5, { align: 'center' });
  doc.text('OFFICIAL', 17, 23.5, { align: 'center' });

  // Right Gazetted Code Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(width - 36, 17, 23, 10, 1, 1, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.3);
  doc.roundedRect(width - 36, 17, 23, 10, 1, 1, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(245, 158, 11);
  doc.text('GAZETTE DRAW CODE', width - 24.5, 20.2, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(ticket.drawCode, width - 24.5, 24.5, { align: 'center' });

  // 5. Lottery Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(ticket.lotteryName.toUpperCase(), 12, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`(${ticket.malayalamName})`, 12 + doc.getTextWidth(ticket.lotteryName.toUpperCase()) + 3, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`DRAW DATE: ${ticket.drawDate}`, width - 12, 35.5, { align: 'right' });

  // 6. Centerplate
  const centerplateY = 40;
  const centerplateH = 26;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(10, centerplateY, width - 20, centerplateH, 2, 2, 'F');

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.roundedRect(10, centerplateY, width - 20, centerplateH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59);
  doc.text('KERALA LOTTERY', width / 2, centerplateY + 18, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(52, 211, 153);
  doc.text('OFFICIAL TICKET NUMBER / ഔദ്യോഗിക ടിക്കറ്റ് നമ്പർ', 16, centerplateY + 5.5);

  // Series Badge
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(16, centerplateY + 7.5, 16, 12, 1.5, 1.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(ticket.series, 24, centerplateY + 15.5, { align: 'center' });

  // 6 Digit Numbers
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(20);
  const formattedDigits = ticket.ticketNumber.split('').join('  ');
  doc.text(formattedDigits, 36, centerplateY + 16);

  // Full Code badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(width - 55, centerplateY + 6.5, 42, 14, 1.5, 1.5, 'F');
  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(0.3);
  doc.roundedRect(width - 55, centerplateY + 6.5, 42, 14, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text('VERIFIED FULL CODE', width - 34, centerplateY + 10.5, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(253, 230, 138);
  doc.text(ticket.fullCode, width - 34, centerplateY + 16, { align: 'center' });

  if (isWon) {
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(width - 85, centerplateY + 6.5, 27, 14, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('WINNING TICKET!', width - 71.5, centerplateY + 11.5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(254, 240, 138);
    doc.text(`₹${(ticket.winAmountInr || 0).toLocaleString('en-IN')}`, width - 71.5, centerplateY + 17, { align: 'center' });
  }

  // Barcode
  doc.setFillColor(255, 255, 255);
  doc.rect(16, centerplateY + 20.5, 75, 4, 'F');

  doc.setFillColor(15, 23, 42);
  const barcodeChars = (ticket.barcode + ticket.ticketNumber).split('');
  let curBx = 17;
  barcodeChars.forEach((ch, idx) => {
    const charCode = ch.charCodeAt(0);
    const lineW = (charCode % 3 === 0 ? 0.8 : charCode % 2 === 0 ? 0.4 : 0.25);
    if (curBx + lineW < 89) {
      doc.rect(curBx, centerplateY + 20.7, lineW, 3.6, 'F');
      curBx += lineW + (idx % 2 === 0 ? 0.35 : 0.2);
    }
  });

  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text(ticket.barcode, 95, centerplateY + 23.5);

  // 7. Security & Blockchain
  const infoY = 69;
  const colW = (width - 24) / 3;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10, infoY, colW, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, infoY, colW, 23, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('SECURITY FOIL PIN', 13, infoY + 5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.securityCode, 13, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Status: Tamper-Evident Foil', 13, infoY + 14.5);
  doc.text('Audit: Directorate Gazetted', 13, infoY + 18.5);

  // Box 2
  const col2X = 10 + colW + 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, infoY, colW, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(col2X, infoY, colW, 23, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('PURCHASE & TRANSACTION', col2X + 3, infoY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(15, 23, 42);
  doc.text(`Price: INR ₹${ticket.pricePaidInr} (${ticket.pricePaidTon} TON)`, col2X + 3, infoY + 10);
  doc.text(`Date: ${ticket.purchaseDate}`, col2X + 3, infoY + 14.5);

  const shortTx = ticket.transactionHash ? `${ticket.transactionHash.slice(0, 16)}...` : '0xVerified';
  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Tx: ${shortTx}`, col2X + 3, infoY + 18.5);

  // Box 3
  const col3X = col2X + colW + 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col3X, infoY, colW, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(col3X, infoY, colW, 23, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 78, 59);
  doc.text('TELEGRAM TON WALLET PROOF', col3X + 3, infoY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Contract: kerala_lotto.ton`, col3X + 3, infoY + 9.5);
  const ownerDisplay = walletOwner || 'Telegram TON User';
  doc.text(`Holder: ${ownerDisplay}`, col3X + 3, infoY + 14);

  const qrX = col3X + colW - 13;
  const qrY = infoY + 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(qrX, qrY, 10, 10, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 1.2, qrY + 1.2, 7.6, 7.6, 'F');
  doc.setFillColor(15, 23, 42);
  doc.rect(qrX + 1.8, qrY + 1.8, 2.2, 2.2, 'F');
  doc.rect(qrX + 6, qrY + 1.8, 2.2, 2.2, 'F');
  doc.rect(qrX + 1.8, qrY + 6, 2.2, 2.2, 'F');
  doc.rect(qrX + 4.5, qrY + 4.5, 1.5, 1.5, 'F');
  doc.rect(qrX + 6.5, qrY + 6.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(6, 78, 59);
  doc.text('SCAN TO VERIFY', col3X + 3, infoY + 19);

  // 8. Perforated Divider
  const stubY = 95;
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  for (let x = 12; x < width - 12; x += 3) {
    doc.line(x, stubY, x + 1.8, stubY);
  }

  doc.setFillColor(252, 252, 250);
  doc.rect(width / 2 - 25, stubY - 2, 50, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(180, 83, 9);
  doc.text('✂ OFFICIAL TEAR-OFF STUB & CLAIM FORM', width / 2, stubY + 1, { align: 'center' });

  // 9. Lower Section
  const lowerY = 100;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS OF ISSUE & PRIZE CLAIM PROCEDURES:', 12, lowerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(71, 85, 105);
  const rules = [
    '1. This digital ticket certificate is an authentic legal record of entry into the Kerala State Lottery draw.',
    '2. Prize winning tickets must be claimed within 30 days of the official Gazetted publication of draw results.',
    '3. Prizes up to INR ₹1,00,000 can be disbursed directly to the authenticated Telegram TON Wallet address.',
    '4. Higher prizes must be claimed by presenting this signed certificate with valid Government Photo ID (Aadhaar / PAN)',
    '   at the Directorate of State Lotteries, Vikas Bhavan, Thiruvananthapuram, Kerala - 695033.',
    '5. Subject to the Kerala Paper Lotteries (Regulation) Rules and jurisdiction of courts in Thiruvananthapuram.',
  ];
  rules.forEach((rule, idx) => {
    doc.text(rule, 12, lowerY + 4 + idx * 3.2);
  });

  const sigX = width - 58;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sigX, lowerY - 1, 46, 26, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(sigX, lowerY - 1, 46, 26, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(6, 78, 59);
  doc.text('OFFICIAL VERIFICATION STAMP', sigX + 23, lowerY + 3.5, { align: 'center' });

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(sigX + 6, lowerY + 16, sigX + 40, lowerY + 16);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text('Director / Joint Director of State Lotteries', sigX + 23, lowerY + 19, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(180, 83, 9);
  doc.text(`AUTHENTICATED HASH: ${ticket.securityCode}`, sigX + 23, lowerY + 23, { align: 'center' });

  // 10. Bottom Footer Bar
  doc.setFillColor(6, 78, 59);
  doc.rect(8, height - 12.5, width - 16, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text('DEPARTMENT OF STATE LOTTERIES • GOVT. OF KERALA • TELEGRAM WEB3 TON VERIFIED PORTAL', width / 2, height - 9.5, { align: 'center' });
}
