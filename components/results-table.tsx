"use client";

import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  results: AnalysisResult[];
  onViewDetails: (result: AnalysisResult) => void;
}

function getRatingColor(rating: number) {
  if (rating >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (rating >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getRatingBg(rating: number) {
  if (rating >= 80) return "bg-emerald-500/10";
  if (rating >= 50) return "bg-amber-500/10";
  return "bg-red-500/10";
}

export function ResultsTable({ results, onViewDetails }: ResultsTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead className="w-28 text-center">Rating</TableHead>
            <TableHead className="w-24 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={result.fileName}>
              <TableCell className="text-center text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.fileName}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-sm font-semibold tabular-nums",
                    getRatingColor(result.rating),
                    getRatingBg(result.rating)
                  )}
                >
                  {result.rating}/100
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(result)}
                >
                  <Eye className="mr-1 size-3.5" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
