const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');

// STREAMING CSV EXPORT
exports.exportTransactionsCSV = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions_history.csv"');
        res.write('Transaction ID,Date,Amount,Payment Mode,Status\n');

        const cursor = Transaction.find({ userId }).sort({ createdAt: -1 }).cursor();

        cursor.on('data', (doc) => {
            const date = new Date(doc.createdAt).toISOString().split('T')[0];
            const row = `${doc.providerTransactionId},${date},${doc.amount},${doc.paymentMode},${doc.status}\n`;
            res.write(row);
        });

        cursor.on('end', () => {
            res.end(); 
        });

        cursor.on('error', (err) => {
            console.error("CSV Stream Error:", err);
            res.status(500).end('Error generating CSV');
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during export' });
    }
};

// GENERATE SECURE PDF RECEIPT
exports.downloadReceiptPDF = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id || req.user._id || req.user.userId;
        const transaction = await Transaction.findOne({ _id: id, userId });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (transaction.status !== 'Success') {
            return res.status(400).json({ success: false, message: 'Receipt only available for successful payments' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${transaction.providerTransactionId}.pdf"`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);
        doc.fontSize(20).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).font('Helvetica').text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`);
        doc.text(`Invoice ID: INV-${Date.now()}-${transaction.providerTransactionId.slice(-6).toUpperCase()}`);
        doc.moveDown();
        
        doc.rect(50, doc.y, 500, 1).fill('#cccccc');
        doc.moveDown(2);

        doc.fontSize(14).font('Helvetica-Bold').text('Transaction Details:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Transaction Ref: ${transaction.providerTransactionId}`);
        doc.text(`Payment Mode: ${transaction.paymentMode}`);
        doc.text(`Status: ${transaction.status}`);
        doc.moveDown();

        doc.fontSize(16).font('Helvetica-Bold').text(`Total Amount Paid: INR ${transaction.amount}`, { align: 'right' });
        
        doc.moveDown(4);
        doc.fontSize(10).font('Helvetica-Oblique').text('This is a computer-generated secure receipt.', { align: 'center', color: 'grey' });

        doc.end();

    } catch (error) {
        console.error("PDF Generation Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate PDF' });
        }
    }
};