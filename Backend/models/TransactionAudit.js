const mongoose = require("mongoose");

const transactionAuditSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  action: { type: String, required: true },
  status: { type: String, required: true },
  payload: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TransactionAudit", transactionAuditSchema);
