"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  RiCheckLine,
  RiCloseLine,
  RiFileTextLine,
  RiLoader4Line,
  RiUploadCloud2Line,
} from "@remixicon/react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

interface UploadResult {
  id: string;
  filename: string;
  type: string;
  status: string;
  partyName: string | null;
  stakeholder: string | null;
  matchConfidence: number | null;
  error?: string;
}

interface UploadFormProps {
  publicId: string;
}

export function UploadForm({ publicId }: UploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const pdfs = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf",
    );
    setFiles((prev) => [...prev, ...pdfs]);
    setError(null);
    setResults(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/admin/agreements/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setResults(data.agreements);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        }`}
      >
        <RiUploadCloud2Line className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drag and drop PDF files here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <Card className="divide-y divide-border">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <RiFileTextLine className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-foreground"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          ))}
        </Card>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? (
            <>
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              Processing {files.length} file{files.length > 1 ? "s" : ""}...
            </>
          ) : (
            <>
              Upload {files.length} file{files.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Processing Complete
          </h3>
          <div className="space-y-3">
            {results.map((r) => (
              <div
                key={r.id || r.filename}
                className="flex items-center justify-between rounded-md bg-secondary p-3"
              >
                <div className="flex items-center gap-3">
                  {r.error ? (
                    <RiCloseLine className="h-5 w-5 text-destructive" />
                  ) : (
                    <RiCheckLine className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {r.partyName || r.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.error
                        ? r.error
                        : `${r.type} — ${r.stakeholder ? `Matched: ${r.stakeholder}` : "No match"}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === "FLAGGED"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {r.status || "Error"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href={`/${publicId}/documents/agreements`}>
              <Button variant="outline" className="w-full">
                Go to Review Queue
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
