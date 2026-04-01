import { createTRPCRouter } from "@/trpc/api/trpc";
import { createDocumentProcedure } from "./procedures/create-document";
import { deleteDocumentProcedure } from "./procedures/delete-document";
import { getAllDocumentsProcedure } from "./procedures/get-all-documents";
import { getDocumentProcedure } from "./procedures/get-document";

export const documentRouter = createTRPCRouter({
  create: createDocumentProcedure,
  delete: deleteDocumentProcedure,
  get: getDocumentProcedure,
  getAll: getAllDocumentsProcedure,
});
