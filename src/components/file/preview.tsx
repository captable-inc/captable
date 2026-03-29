"use client";

import EmptyState from "@/components/common/empty-state";
import { OfficeViewer } from "@/components/file/office-viewer";
import { PdfViewer } from "@/components/ui/pdf-viewer";
import { fileType } from "@/lib/mime";
import { RiFileUnknowFill as UnknownFileIcon } from "@remixicon/react";

type FilePreviewProps = {
  name: string;
  url: string;
  mimeType?: string;
};

const ImagePreview = ({ url, name }: FilePreviewProps) => {
  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="select-none"
    >
      <img
        className="rounded pointer-events-none"
        src={url}
        alt={name}
        draggable={false}
      />
    </div>
  );
};

const AuditPreview = ({ url, name, mimeType }: FilePreviewProps) => {
  return (
    // biome-ignore lint/a11y/useMediaCaption: <explanation>
    <audio controls controlsList="nodownload" className="w-full">
      <source src={url} type={mimeType} />
      Your browser does not support the audio element.
    </audio>
  );
};

const VideoPreview = ({ url, name, mimeType }: FilePreviewProps) => {
  return (
    // biome-ignore lint/a11y/useMediaCaption: <explanation>
    <video controls controlsList="nodownload" className="w-full rounded">
      <source src={url} type={mimeType} />
      Your browser does not support the video type.
    </video>
  );
};

const UnknownPreview = ({ mimeType }: FilePreviewProps) => {
  return (
    <EmptyState
      title="Preview not available"
      subtitle={`This file type - ${mimeType} is not yet supported by the previewer.`}
      icon={<UnknownFileIcon />}
    />
  );
};

const FilePreview = ({ url, name, mimeType }: FilePreviewProps) => {
  mimeType = mimeType || "";
  const type = fileType(mimeType);

  switch (type) {
    case "pdf":
      return (
        <div onContextMenu={(e) => e.preventDefault()} className="select-none">
          <PdfViewer file={url} />
        </div>
      );
    case "image":
      return <ImagePreview url={url} name={name} />;
    case "audio":
      return <AuditPreview url={url} name={name} mimeType={mimeType} />;
    case "video":
      return <VideoPreview url={url} name={name} mimeType={mimeType} />;
    case "doc":
    case "excel":
    case "powerpoint":
      return <OfficeViewer url={url} />;
    default:
      return <UnknownPreview url={url} name={name} mimeType={mimeType} />;
  }
};

export default FilePreview;
