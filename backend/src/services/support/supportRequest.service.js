const crypto = require("crypto");
const { sequelize } = require("../../models");
const SupportRequest = require("../../models/SupportRequest");
const SupportContact = require("../../models/SupportContact");
const PaymentRequest = require("../../models/PaymentRequest");
const { assertValidMinor } = require("../../utils/money");
const paymentService = require("../payments/payment.service");

async function expireIfDue(request) {
  if (
    request.expiresAt &&
    new Date(request.expiresAt) < new Date() &&
    !["EXPIRED", "CANCELLED", "FUNDED"].includes(request.status)
  ) {
    await request.update({ status: "EXPIRED" });
    console.log(`[support] support request expired id=${request.id}`);
  }
  return request;
}

async function create({
  patientRef,
  consultationId = null,
  requestedAmountMinor,
  contacts = [],
  message = null,
  expiresAt = null,
}) {
  if (!patientRef) {
    const err = new Error("patientRef is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  assertValidMinor(requestedAmountMinor);
  const created = await sequelize.transaction(async (txn) => {
    const request = await SupportRequest.create(
      {
        patientRef,
        consultationId,
        requestedAmountMinor,
        message,
        expiresAt,
        shareToken: crypto.randomUUID(),
        status: "PENDING",
      },
      { transaction: txn }
    );
    if (Array.isArray(contacts) && contacts.length > 0) {
      const rows = contacts.slice(0, 20).map((c) => ({
        supportRequestId: request.id,
        displayName: String(c.displayName || "").slice(0, 120),
        contactChannel: c.contactChannel ? String(c.contactChannel).slice(0, 160) : null,
      }));
      await SupportContact.bulkCreate(rows, { transaction: txn });
    }
    return request;
  });
  console.log(
    `[support] support request created id=${created.id} amountMinor=${requestedAmountMinor} contacts=${contacts.length}`
  );
  return created;
}

function publicView(request, contacts = []) {
  return {
    shareToken: request.shareToken,
    message: request.message,
    currency: request.currency,
    requestedAmountMinor: Number(request.requestedAmountMinor),
    receivedAmountMinor: Number(request.receivedAmountMinor),
    remainingAmountMinor: Math.max(
      0,
      Number(request.requestedAmountMinor) - Number(request.receivedAmountMinor)
    ),
    status: request.status,
    expiresAt: request.expiresAt,
    createdAt: request.createdAt,
  };
}

async function getByShareToken(shareToken) {
  let request = await SupportRequest.findOne({ where: { shareToken } });
  if (!request) {
    const err = new Error("Support request not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  request = await expireIfDue(request);
  const paidContributions = await PaymentRequest.findAll({
    where: {
      supportRequestId: request.id,
      type: "SUPPORT_CONTRIBUTION",
      status: "PAID",
    },
    attributes: ["contributorName", "amountMinor", "paidAt", "currency"],
    order: [["paidAt", "DESC"]],
  });
  return { request, contributions: paidContributions };
}

async function getByIdForPatient(id, patientRef) {
  const request = await SupportRequest.findByPk(id);
  if (!request || (patientRef && request.patientRef !== patientRef)) {
    const err = new Error("Support request not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  return expireIfDue(request);
}

async function contribute({ shareToken, amountMinor, contributorName, contributorContact, customer, idempotencyKey }) {
  let request = await SupportRequest.findOne({ where: { shareToken } });
  if (!request) {
    const err = new Error("Support request not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  request = await expireIfDue(request);
  if (["CANCELLED", "EXPIRED"].includes(request.status)) {
    const err = new Error(`Support request is ${request.status}`);
    err.code = "SUPPORT_REQUEST_CLOSED";
    throw err;
  }
  const remainingBefore =
    request.requestedAmountMinor - Number(request.receivedAmountMinor || 0);
  if (remainingBefore <= 0) {
    const err = new Error("This support request is already fully funded");
    err.code = "SUPPORT_REQUEST_FUNDED";
    throw err;
  }
  const result = await paymentService.initiate({
    type: "SUPPORT_CONTRIBUTION",
    amountMinor,
    currency: request.currency,
    supportRequestId: request.id,
    actorId: null,
    contributorName,
    contributorContact,
    customer,
    description: "ALAFIA healthcare support contribution",
    idempotencyKey,
    metadata: { shareToken },
  });
  return { supportRequest: request, ...result };
}

async function cancel(id, patientRef) {
  const request = await getByIdForPatient(id, patientRef);
  if (["CANCELLED", "EXPIRED"].includes(request.status)) {
    const err = new Error(`Support request is already ${request.status}`);
    err.code = "INVALID_TRANSITION";
    throw err;
  }
  await request.update({ status: "CANCELLED" });
  console.log(`[support] support request cancelled id=${request.id}`);
  return request;
}

module.exports = {
  create,
  getByShareToken,
  getByIdForPatient,
  contribute,
  cancel,
  publicView,
};
