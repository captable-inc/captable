"use client";

import FileIcon from "@/components/common/file-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { Bucket } from "@prisma/client";
import { RiDeleteBinLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DocumentExplorerProps = {
  shared?: boolean;
  jwtToken?: string;
  companyPublicId: string;
  dataRoomPublicId: string;
  documents: Bucket[];
};

const DataRoomFileExplorer = ({
  jwtToken,
  shared,
  documents,
  companyPublicId,
  dataRoomPublicId,
}: DocumentExplorerProps) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { mutateAsync: deleteDocumentMutation } =
    api.dataRoom.deleteDocument.useMutation();

  const handleDelete = async (
    e: React.MouseEvent,
    bucketId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(bucketId);
    try {
      await deleteDocumentMutation({
        dataRoomPublicId,
        bucketId,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {documents.map((document) => (
          <li key={document.id} className="relative">
            <Link
              href={
                shared
                  ? `/data-rooms/${dataRoomPublicId}/${document.id}?token=${jwtToken}`
                  : `/${companyPublicId}/documents/${document.id}`
              }
              className="col-span-1 flex cursor-pointer rounded-md transition duration-150 ease-in-out hover:shadow-md"
            >
              <div
                className={cn(
                  "flex w-14 flex-shrink-0 items-center justify-center rounded-l-md border text-sm font-medium ",
                )}
              >
                <FileIcon type={document.mimeType} />
              </div>
              <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-y border-r border-gray-200 bg-white">
                <div className="text-md flex-1 truncate px-4 py-2">
                  <span className="font-medium text-gray-900 hover:text-gray-600">
                    {document.name}
                  </span>
                  <p className="text-xs text-gray-500">{`${
                    document.mimeType
                  } - ${(document.size / 1024 / 1024).toFixed(2)} MB`}</p>
                </div>
                {!shared && (
                  <div className="flex-shrink-0 pr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, document.id)}
                      disabled={deletingId === document.id}
                    >
                      <RiDeleteBinLine className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default DataRoomFileExplorer;
