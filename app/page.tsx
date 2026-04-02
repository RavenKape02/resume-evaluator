"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  RotateCcw,
  FileSearch,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileUploader } from "@/components/file-uploader";
import { ResultsTable } from "@/components/results-table";
import { DetailModal } from "@/components/detail-modal";
import type { AnalysisResult, AppState, AnalysisProgress } from "@/lib/types";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobContext, setJobContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({
    current: 0,
    total: 0,
    currentFileName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(
    null
  );

  const handleAnalyze = useCallback(async () => {
    if (!roleTitle.trim() || files.length === 0) return;

    setError(null);
    setAppState("analyzing");
    setProgress({ current: 0, total: files.length, currentFileName: "" });

    try {
      const formData = new FormData();
      formData.append("roleTitle", roleTitle.trim());
      formData.append("jobContext", jobContext.trim());
      files.forEach((file) => formData.append("files", file));

      setProgress({
        current: 0,
        total: files.length,
        currentFileName: "Uploading and processing...",
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed.");
        setAppState("input");
        return;
      }

      setResults(data.results);
      setRemainingAnalyses(data.remaining);
      setProgress({
        current: files.length,
        total: files.length,
        currentFileName: "Complete!",
      });

      setTimeout(() => setAppState("results"), 500);
    } catch {
      setError("Failed to connect to the server. Please try again.");
      setAppState("input");
    }
  }, [roleTitle, jobContext, files]);

  const handleReset = useCallback(() => {
    setAppState("input");
    setRoleTitle("");
    setJobContext("");
    setFiles([]);
    setResults([]);
    setError(null);
    setSelectedResult(null);
  }, []);

  const handleViewDetails = useCallback((result: AnalysisResult) => {
    setSelectedResult(result);
    setModalOpen(true);
  }, []);

  const canAnalyze = roleTitle.trim().length > 0 && files.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileSearch className="size-5 text-primary" />
            <h1 className="text-base font-semibold tracking-tight">
              Resume Evaluator
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {remainingAnalyses !== null && (
              <span className="text-xs text-muted-foreground">
                {remainingAnalyses} analyses left
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {appState === "input" && (
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                AI Resume Evaluator
              </h2>
              <p className="mt-2 text-muted-foreground">
                Upload resumes and get critical AI-powered analysis for any role.
                Up to 10 PDFs at once.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mb-6 rounded-lg border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium">Upload Guidelines</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Recommended: PDFs with selectable text for the fastest and most reliable analysis.</li>
                <li>Scanned or image-based PDFs are supported, but may take longer to process.</li>
                <li>Make sure scanned pages are clear, sharp, and not cropped for better OCR accuracy.</li>
                <li>Avoid low-resolution, tilted, or blurry scans to reduce extraction errors.</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="roleTitle"
                  className="text-sm font-medium"
                >
                  Role Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="roleTitle"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jobContext"
                  className="text-sm font-medium"
                >
                  Job Description / Context{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Textarea
                  id="jobContext"
                  placeholder="Paste the job description or key requirements here..."
                  value={jobContext}
                  onChange={(e) => setJobContext(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload Resumes <span className="text-destructive">*</span>
                </label>
                <FileUploader files={files} onFilesChange={setFiles} />
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              >
                <Sparkles className="mr-2 size-4" />
                Analyze {files.length > 0 ? `${files.length} Resume${files.length > 1 ? "s" : ""}` : "Resumes"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}

        {appState === "analyzing" && (
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16">
            <div className="mb-8 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative rounded-full bg-primary/10 p-4">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  Analyzing Resumes...
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our AI recruiter is critically evaluating each resume
                </p>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Progress
                value={
                  progress.total > 0
                    ? (progress.current / progress.total) * 100
                    : null
                }
              >
                <ProgressLabel>Processing</ProgressLabel>
                <ProgressValue />
              </Progress>
              {progress.currentFileName && (
                <p className="text-center text-xs text-muted-foreground">
                  {progress.currentFileName}
                </p>
              )}
            </div>
          </div>
        )}

        {appState === "results" && (
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Analysis Results
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {results.length} resume{results.length !== 1 ? "s" : ""}{" "}
                  evaluated for &ldquo;{roleTitle}&rdquo;
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 size-3.5" />
                New Analysis
              </Button>
            </div>

            <ResultsTable
              results={results}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}
      </main>

      <DetailModal
        result={selectedResult}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
