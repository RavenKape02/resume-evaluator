"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILES = 10;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, MAX_FILES);
      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxSize: MAX_SIZE,
      maxFiles: MAX_FILES - files.length,
      disabled: files.length >= MAX_FILES,
    });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive &&
            "border-muted-foreground/25 hover:border-muted-foreground/50",
          files.length >= MAX_FILES && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <FileUp className="mb-3 size-8 text-muted-foreground" />
        {isDragReject ? (
          <p className="text-sm font-medium text-destructive">
            Only PDF files up to 2MB are accepted
          </p>
        ) : isDragActive ? (
          <p className="text-sm font-medium text-primary">
            Drop your resumes here...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium">
              Drag & drop PDF resumes here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF only &middot; Max 2MB per file &middot; Up to {MAX_FILES}{" "}
              files
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {files.length} of {MAX_FILES} files selected
          </p>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
