// --------------- Example usage: ----------------

// import { Audit, EsignAudit } from "@/server/audit";
// import { db } from "@captable/db";

// // Basic audit logging for user actions
// await db.transaction(async (tx) => {
//   const auditLog = await Audit.create({
//     action: "user.created",
//     actor: {
//       type: "user",
//       id: user.id,
//     },
//     target: [
//       {
//         type: "user",
//         id: user.id,
//       },
//     ],
//     context: {
//       location: "192.168.1.1",
//       user_agent: "Mozilla/5.0 (Chrome/120.0.0.0)",
//       request_id: "req_123456",
//     },
//   }, tx);
//
//   console.log("Audit log created:", auditLog.id);
// });

// // E-signature audit logging for document signing events
// await db.transaction(async (tx) => {
//   const esignLog = await EsignAudit.create({
//     action: "document.signed",
//     actor: {
//       type: "user",
//       id: signer.id,
//     },
//     target: [
//       {
//         type: "document",
//         id: document.id,
//       },
//     ],
//     context: {
//       ip_address: "192.168.1.1",
//       signature_method: "electronic",
//       timestamp: new Date().toISOString(),
//     },
//   }, tx);
//
//   console.log("E-sign audit log created:", esignLog.id);
// });

import type { AuditSchemaType, TEsignAuditSchema } from "@/server/audit/schema";
import type { DBTransaction } from "@captable/db";
import { audits, esignAudits } from "@captable/db";

const create = async (data: AuditSchemaType, tx: DBTransaction) => {
  const [result] = await tx.insert(audits).values(data).returning();
  return result;
};

export const Audit = {
  create,
};

const esignAuditCreate = async (data: TEsignAuditSchema, tx: DBTransaction) => {
  const [result] = await tx
    .insert(esignAudits)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  return result;
};

export const EsignAudit = {
  create: esignAuditCreate,
};
