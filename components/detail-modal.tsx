"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DetailModalProps {
  result: AnalysisResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getRatingColor(rating: number) {
  if (rating >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (rating >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getRatingBg(rating: number) {
  if (rating >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (rating >= 50) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function DetailModal({ result, open, onOpenChange }: DetailModalProps) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-xl">{result.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {result.fileName}
              </DialogDescription>
            </div>
            <div
              className={cn(
                "flex flex-col items-center rounded-xl border px-4 py-2",
                getRatingBg(result.rating)
              )}
            >
              <span
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  getRatingColor(result.rating)
                )}
              >
                {result.rating}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Score
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="size-4 text-emerald-500" />
              Strengths
            </div>
            <ul className="space-y-1.5">
              {result.pros.map((pro, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-500" />
                  {pro}
                </li>
              ))}
              {result.pros.length === 0 && (
                <li className="text-sm text-muted-foreground italic">
                  No strengths identified
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <XCircle className="size-4 text-red-500" />
              Weaknesses
            </div>
            <ul className="space-y-1.5">
              {result.cons.map((con, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-red-500" />
                  {con}
                </li>
              ))}
              {result.cons.length === 0 && (
                <li className="text-sm text-muted-foreground italic">
                  No weaknesses identified
                </li>
              )}
            </ul>
          </div>
        </div>

        {result.missing_skills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="size-4 text-amber-500" />
              Missing Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.missing_skills.map((skill, i) => (
                <Badge key={i} variant="destructive">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI Insight
          </p>
          <p className="text-sm leading-relaxed">{result.ai_insights}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
