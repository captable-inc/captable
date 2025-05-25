"use server";

import { api } from "@/trpc/server";
import type { Bucket, DataRoom } from "@captable/db";
import { notFound } from "next/navigation";
import DataRoomFiles from "../components/data-room-files";

const DataRoomSettinsPage = async ({
  params,
}: {
  params: Promise<{ publicId: string; dataRoomPublicId: string }>;
}) => {
  const { publicId, dataRoomPublicId } = await params;
  const { dataRoom, documents } = await api.dataRoom.getDataRoom.query({
    dataRoomPublicId,
    include: {
      company: false,
      recipients: true,
      documents: true,
    },
  });
  const contacts = await api.common.getContacts.query();

  if (!dataRoom) {
    return notFound();
  }

  return (
    <DataRoomFiles
      contacts={contacts}
      dataRoom={dataRoom as DataRoom}
      documents={documents as Bucket[]}
      companyPublicId={publicId}
    />
  );
};

export default DataRoomSettinsPage;
