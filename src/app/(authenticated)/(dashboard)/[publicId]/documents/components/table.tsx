"use client";

import { dayjsExt } from "@/common/dayjs";
import FileIcon from "@/components/common/file-icon";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { RiDeleteBinLine, RiMore2Fill } from "@remixicon/react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RouterOutputs } from "@/trpc/shared";

type DocumentType = RouterOutputs["document"]["getAll"];

type DocumentTableProps = {
  documents: DocumentType;
  companyPublicId: string;
};

const DocumentsTable = ({ documents, companyPublicId }: DocumentTableProps) => {
  const router = useRouter();
  const { mutateAsync: deleteDocument } = api.document.delete.useMutation();

  return (
    <>
      <Card>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {/* <TableHead>Type</TableHead> */}
              <TableHead>Owner</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell
                  className="flex cursor-pointer items-center hover:underline"
                  onClick={() => {
                    router.push(
                      `/${companyPublicId}/documents/${document.bucket.id}`,
                    );
                  }}
                >
                  <div className="mr-3">
                    <FileIcon type={document.bucket.mimeType} />
                  </div>
                  <span className="flex">{document.name}</span>
                </TableCell>
                <TableCell>{document?.uploader?.user?.name}</TableCell>
                <TableCell suppressHydrationWarning>
                  {dayjsExt().to(document.createdAt)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <RiMore2Fill className="cursor-pointer text-muted-foreground hover:text-primary/80" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* <DropdownMenuItem
                          onClick={() => {
                            if (document) {
                              setSelectedDocumentId(document.id);
                            }
                            setOpenShareModal(true);
                          }}
                        >
                          Share document
                        </DropdownMenuItem> */}

                        {document.bucket.mimeType === "application/pdf" && (
                          <DropdownMenuItem
                            onClick={() => {
                              console.log(
                                "TODO - Show recipient popup and redirect to template page.",
                              );
                            }}
                          >
                            eSign
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(
                              `/${companyPublicId}/documents/${document.bucket.id}`,
                            );
                          }}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("Are you sure you want to delete this document?")) return;
                            try {
                              await deleteDocument({ documentId: document.id });
                              router.refresh();
                            } catch {
                              alert("Failed to delete document.");
                            }
                          }}
                        >
                          <RiDeleteBinLine className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
};

export default DocumentsTable;
