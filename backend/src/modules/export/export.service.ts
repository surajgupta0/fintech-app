import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';

interface ExportFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

async function fetchTransactions(filters: ExportFilters) {
  const where: Prisma.TransactionWhereInput = { userId: filters.userId };

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = filters.startDate;
    if (filters.endDate) where.date.lte = filters.endDate;
  }

  if (filters.category) where.category = filters.category;

  return prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    select: {
      date: true,
      description: true,
      amount: true,
      type: true,
      category: true,
      confidence: true,
    },
  });
}

export async function exportToCSV(filters: ExportFilters): Promise<string> {
  const transactions = await fetchTransactions(filters);

  if (transactions.length === 0) {
    return 'Date,Description,Amount,Type,Category,Confidence\n';
  }

  const headers = 'Date,Description,Amount,Type,Category,Confidence';
  const rows = transactions.map((t) => {
    const date = t.date.toISOString().split('T')[0];
    const description = `"${t.description.replace(/"/g, '""')}"`;
    const amount = Number(t.amount).toFixed(2);
    return `${date},${description},${amount},${t.type},${t.category},${t.confidence.toFixed(2)}`;
  });

  return `${headers}\n${rows.join('\n')}`;
}

export async function exportToPDF(filters: ExportFilters): Promise<Buffer> {
  const transactions = await fetchTransactions(filters);

  // Also get summary data
  let totalDebit = 0;
  let totalCredit = 0;
  const categoryTotals = new Map<string, number>();

  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === 'DEBIT') totalDebit += amount;
    else totalCredit += amount;

    const current = categoryTotals.get(t.category) || 0;
    categoryTotals.set(t.category, current + amount);
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: filters.userId },
    select: { email: true, name: true },
  });

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(24)
      .fillColor('#4263eb')
      .text('FinTrack', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(14)
      .fillColor('#495057')
      .text('Expense Classification Report', { align: 'center' })
      .moveDown(0.5);

    // User info
    doc
      .fontSize(10)
      .fillColor('#868e96')
      .text(`Generated for: ${user?.name || 'User'} (${user?.email || 'N/A'})`, { align: 'center' });

    const dateRange = [];
    if (filters.startDate) dateRange.push(`From: ${filters.startDate.toISOString().split('T')[0]}`);
    if (filters.endDate) dateRange.push(`To: ${filters.endDate.toISOString().split('T')[0]}`);
    if (dateRange.length > 0) {
      doc.text(dateRange.join(' | '), { align: 'center' });
    }

    doc
      .text(`Generated on: ${new Date().toISOString().split('T')[0]}`, { align: 'center' })
      .moveDown(1);

    // Divider
    doc
      .strokeColor('#dee2e6')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1);

    // Summary section
    doc
      .fontSize(16)
      .fillColor('#212529')
      .text('Summary', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor('#495057')
      .text(`Total Transactions: ${transactions.length}`)
      .text(`Total Debited: ₹${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)
      .text(`Total Credited: ₹${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)
      .text(`Net: ₹${(totalCredit - totalDebit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)
      .moveDown(1);

    // Category breakdown
    doc
      .fontSize(16)
      .fillColor('#212529')
      .text('Category Breakdown', { underline: true })
      .moveDown(0.5);

    const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

    for (const [category, total] of sortedCategories) {
      doc
        .fontSize(10)
        .fillColor('#495057')
        .text(`${category}: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    }

    doc.moveDown(1);

    // Transaction list
    doc
      .fontSize(16)
      .fillColor('#212529')
      .text('Transactions', { underline: true })
      .moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const colWidths = [70, 180, 80, 55, 80];
    const colStarts = [50, 120, 300, 380, 435];

    doc.fontSize(9).fillColor('#ffffff');
    doc.rect(50, tableTop, 495, 18).fill('#4263eb');

    doc
      .fillColor('#ffffff')
      .text('Date', colStarts[0], tableTop + 4, { width: colWidths[0] })
      .text('Description', colStarts[1], tableTop + 4, { width: colWidths[1] })
      .text('Amount', colStarts[2], tableTop + 4, { width: colWidths[2] })
      .text('Type', colStarts[3], tableTop + 4, { width: colWidths[3] })
      .text('Category', colStarts[4], tableTop + 4, { width: colWidths[4] });

    let y = tableTop + 22;
    let pageCount = 1;

    for (let i = 0; i < Math.min(transactions.length, 500); i++) {
      const t = transactions[i];

      if (y > 750) {
        // Footer
        doc
          .fontSize(8)
          .fillColor('#adb5bd')
          .text(`Page ${pageCount}`, 50, 770, { align: 'center' });
        pageCount++;

        doc.addPage();
        y = 50;
      }

      const bgColor = i % 2 === 0 ? '#ffffff' : '#f8f9fa';
      doc.rect(50, y - 2, 495, 16).fill(bgColor);

      doc
        .fontSize(8)
        .fillColor('#495057')
        .text(t.date.toISOString().split('T')[0], colStarts[0], y, { width: colWidths[0] })
        .text(t.description.substring(0, 35), colStarts[1], y, { width: colWidths[1] })
        .text(`₹${Number(t.amount).toFixed(2)}`, colStarts[2], y, { width: colWidths[2] })
        .text(t.type, colStarts[3], y, { width: colWidths[3] })
        .text(t.category, colStarts[4], y, { width: colWidths[4] });

      y += 16;
    }

    // Final footer
    doc
      .fontSize(8)
      .fillColor('#adb5bd')
      .text(`Page ${pageCount}`, 50, 770, { align: 'center' });

    doc.end();
  });
}
