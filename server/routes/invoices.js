const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'client') filter.client = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const invoices = await Invoice.find(filter).populate('client', 'name email company').populate('order', 'orderNumber').sort('-createdAt');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client', 'name email company phone address').populate('order');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role === 'client' && invoice.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.body.order).populate('client');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const subtotal = order.totalAmount;
    const taxRate = req.body.taxRate || 18;
    const discount = req.body.discount || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;

    const invoiceData = {
      ...req.body,
      client: order.client._id,
      items: order.items.map(item => ({
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice || item.quantity * item.unitPrice
      })),
      subtotal,
      taxRate,
      taxAmount,
      discount,
      totalAmount
    };

    const invoice = await Invoice.create(invoiceData);
    await invoice.populate('client', 'name email company');
    await invoice.populate('order', 'orderNumber');
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('client', 'name email company').populate('order', 'orderNumber');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invoices/:id/pdf
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email company phone address')
      .populate('order', 'orderNumber processType');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role === 'client' && invoice.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#1e3a8a');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(22)
       .text('SAI PATHIRAKALIAMMAN', 50, 20)
       .fontSize(11).font('Helvetica')
       .text('Textile Process Management', 50, 46)
       .fontSize(10).text('Tamil Nadu, India', 50, 60);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(28)
       .text('INVOICE', 0, 25, { align: 'right', width: doc.page.width - 50 });

    // Invoice Info
    const infoY = 100;
    doc.rect(50, infoY, 240, 90).fill('#eff6ff').stroke('#bfdbfe');
    doc.rect(310, infoY, 240, 90).fill('#eff6ff').stroke('#bfdbfe');
    doc.fillColor('#1e40af').font('Helvetica-Bold').fontSize(10).text('INVOICE DETAILS', 60, infoY + 10);
    doc.fillColor('#334155').font('Helvetica').fontSize(9)
       .text(`Invoice No : ${invoice.invoiceNumber}`, 60, infoY + 25)
       .text(`Date       : ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 60, infoY + 40)
       .text(`Due Date   : ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A'}`, 60, infoY + 55)
       .text(`Status     : ${invoice.status}`, 60, infoY + 70);
    doc.fillColor('#1e40af').font('Helvetica-Bold').fontSize(10).text('BILLED TO', 320, infoY + 10);
    doc.fillColor('#334155').font('Helvetica').fontSize(9)
       .text(`Name    : ${invoice.client?.name || 'N/A'}`, 320, infoY + 25)
       .text(`Company : ${invoice.client?.company || 'N/A'}`, 320, infoY + 40)
       .text(`Email   : ${invoice.client?.email || 'N/A'}`, 320, infoY + 55)
       .text(`Phone   : ${invoice.client?.phone || 'N/A'}`, 320, infoY + 70);

    // Items Table
    const tableTop = infoY + 110;
    doc.rect(50, tableTop, 500, 24).fill('#1e3a8a');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
       .text('DESCRIPTION', 60, tableTop + 8)
       .text('QTY', 280, tableTop + 8)
       .text('UNIT PRICE', 340, tableTop + 8)
       .text('TOTAL', 450, tableTop + 8);

    let rowY = tableTop + 24;
    (invoice.items || []).forEach((item, i) => {
      doc.rect(50, rowY, 500, 22).fill(i % 2 === 0 ? '#f8fafc' : 'white');
      doc.fillColor('#334155').font('Helvetica').fontSize(9)
         .text(item.description || '', 60, rowY + 6, { width: 200 })
         .text(String(item.quantity || 0), 280, rowY + 6)
         .text(`Rs. ${(item.unitPrice || 0).toLocaleString('en-IN')}`, 340, rowY + 6)
         .text(`Rs. ${(item.total || 0).toLocaleString('en-IN')}`, 450, rowY + 6);
      rowY += 22;
    });

    // Totals
    rowY += 10;
    doc.rect(350, rowY, 200, 22).fill('#f1f5f9');
    doc.fillColor('#334155').font('Helvetica').fontSize(9)
       .text('Subtotal', 360, rowY + 6)
       .text(`Rs. ${(invoice.subtotal || 0).toLocaleString('en-IN')}`, 450, rowY + 6);
    rowY += 22;

    doc.rect(350, rowY, 200, 22).fill('#f1f5f9');
    doc.fillColor('#334155').font('Helvetica').fontSize(9)
       .text(`GST (${invoice.taxRate || 18}%)`, 360, rowY + 6)
       .text(`Rs. ${(invoice.taxAmount || 0).toLocaleString('en-IN')}`, 450, rowY + 6);
    rowY += 22;

    if (invoice.discount > 0) {
      doc.rect(350, rowY, 200, 22).fill('#f1f5f9');
      doc.fillColor('#059669').font('Helvetica').fontSize(9)
         .text('Discount', 360, rowY + 6)
         .text(`- Rs. ${invoice.discount.toLocaleString('en-IN')}`, 450, rowY + 6);
      rowY += 22;
    }

    doc.rect(350, rowY, 200, 26).fill('#1e3a8a');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
       .text('TOTAL AMOUNT', 360, rowY + 7)
       .text(`Rs. ${(invoice.totalAmount || 0).toLocaleString('en-IN')}`, 450, rowY + 7);
    rowY += 36;

    if (invoice.notes) {
      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text(`Notes: ${invoice.notes}`, 50, rowY + 10);
    }

    // Footer
    const footerY = doc.page.height - 60;
    doc.rect(0, footerY, doc.page.width, 60).fill('#1e3a8a');
    doc.fillColor('white').font('Helvetica').fontSize(8)
       .text('Thank you for your business!', 50, footerY + 12, { align: 'center', width: doc.page.width - 100 })
       .text('SAI PATHIRAKALIAMMAN Textile Process | Tamil Nadu, India', 50, footerY + 28, { align: 'center', width: doc.page.width - 100 })
       .text('For queries contact: admin@textile.com', 50, footerY + 42, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;