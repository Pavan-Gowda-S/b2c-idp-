const store = require('../services/supabase.service');
const collections = require('../supabase/tables');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

const VALID_STATUSES = ['Paid', 'Due Now', 'Upcoming'];

exports.getProjectLedger = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const invoices = await store.list(collections.invoices, [['project_id', '==', projectId]]);
  const summary = invoices.reduce(
    (acc, invoice) => {
      const base = Number(invoice.baseAmount || 0);
      const cgst = Number(invoice.cgst || 0);
      const sgst = Number(invoice.sgst || 0);
      const invoiceTotal = Number(invoice.totalAmountInr || base + cgst + sgst);
      acc.totalInvoices += 1;
      acc.totalPaid += invoice.status === 'Paid' ? invoiceTotal : 0;
      acc.totalDueNow += invoice.status === 'Due Now' ? invoiceTotal : 0;
      acc.totalUpcoming += invoice.status === 'Upcoming' ? invoiceTotal : 0;
      acc.totalContractValue += invoiceTotal;
      return acc;
    },
    { totalInvoices: 0, totalPaid: 0, totalDueNow: 0, totalUpcoming: 0, totalContractValue: 0 }
  );

  ok(res, {
    invoices,
    summary: {
      totalInvoices: summary.totalInvoices,
      totalContractValue: summary.totalContractValue,
      totalPaid: summary.totalPaid,
      totalDueNow: summary.totalDueNow,
      totalUpcoming: summary.totalUpcoming
    }
  }, 'Ledger loaded');
});

exports.updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoiceId = req.params.invoiceId;
  const status = req.body.status;
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }
  const invoice = await store.getById(collections.invoices, invoiceId);
  if (!invoice) throw new AppError('Invoice not found', 404);

  const updated = await store.update(collections.invoices, invoiceId, { status });
  ok(res, { invoice: updated }, 'Invoice status updated');
});
