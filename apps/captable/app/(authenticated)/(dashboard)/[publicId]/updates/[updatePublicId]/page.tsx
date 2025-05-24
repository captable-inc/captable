"use server";

import { db, updates, eq } from "@captable/db";
import EditorWrapper from "./editor-wrapper";

const getUpdate = async (publicId: string) => {
  const result = await db.query.updates.findFirst({
    where: eq(updates.publicId, publicId),
  });

  if (!result) {
    throw new Error(`Update with publicId ${publicId} not found`);
  }

  return result;
};

const UpdatePage = async ({
  params: { publicId, updatePublicId },
}: {
  params: { publicId: string; updatePublicId: string };
}) => {
  if (updatePublicId === "new") {
    return <EditorWrapper companyPublicId={publicId} mode="new" />;
  }
  const update = await getUpdate(updatePublicId);

  return (
    <EditorWrapper companyPublicId={publicId} update={update} mode="edit" />
  );
};

export default UpdatePage;
