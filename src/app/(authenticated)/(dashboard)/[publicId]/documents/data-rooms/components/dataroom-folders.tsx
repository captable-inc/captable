"use client";

import { PageLayout } from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { DataRoom } from "@prisma/client";
import {
  RiFolder3Fill as FolderIcon,
  RiMore2Fill as MoreIcon,
  RiAddFill,
  RiDeleteBinLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataRoomPopover from "./data-room-popover";

interface DataRoomProps extends DataRoom {
  _count: {
    documents: number;
  };
}

type FolderProps = {
  companyPublicId: string;
  folders: DataRoomProps[];
};

const Folders = ({ companyPublicId, folders }: FolderProps) => {
  const router = useRouter();
  const { mutateAsync: deleteDataRoomMutation } =
    api.dataRoom.deleteDataRoom.useMutation();

  const handleDeleteDataRoom = async (
    e: React.MouseEvent,
    dataRoomPublicId: string,
    dataRoomName: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        `Are you sure you want to delete "${dataRoomName}"? This will permanently delete all documents in this data room.`,
      )
    ) {
      return;
    }

    try {
      await deleteDataRoomMutation({ dataRoomPublicId });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete data room:", error);
      alert("Failed to delete data room. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      <PageLayout
        title="Data room"
        description="A secure spaces to share multiple documents with investors, stakeholders and external parties."
        action={
          <DataRoomPopover
            trigger={
              <Button>
                <RiAddFill className="mr-2 h-5 w-5" />
                Data room
              </Button>
            }
          />
        }
      />

      <hr className="my-3" />

      <Card className="mt-3 border-none bg-transparent shadow-none">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {folders.map((folder) => (
            <li key={folder.id}>
              <Link
                href={`/${companyPublicId}/documents/data-rooms/${folder.publicId}`}
                className="col-span-1 flex cursor-pointer rounded-md shadow-sm hover:shadow-lg"
              >
                <div
                  className={cn(
                    "flex w-14 flex-shrink-0 items-center justify-center rounded-l-md border text-sm font-medium ",
                  )}
                >
                  <FolderIcon
                    className="h-6 w-6 text-primary/70"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-y border-r border-border bg-card">
                  <div className="flex-1 truncate px-4 py-2 text-sm">
                    <span className="font-medium text-foreground hover:text-muted-foreground">
                      {folder.name}
                    </span>
                    <p className="text-muted-foreground">
                      {folder._count.documents === 1
                        ? `${folder._count.documents} file`
                        : `${folder._count.documents} files`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 pr-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-muted-foreground hover:text-foreground focus:outline-none"
                          onClick={(e) => e.preventDefault()}
                        >
                          <span className="sr-only">Open options</span>
                          <MoreIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) =>
                            handleDeleteDataRoom(
                              e,
                              folder.publicId,
                              folder.name,
                            )
                          }
                        >
                          <RiDeleteBinLine className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Folders;
