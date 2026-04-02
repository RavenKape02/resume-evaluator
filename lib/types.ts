import { z } from "zod/v4";

export const ResumeAnalysisSchema = z.object({
  name: z.string(),
  rating: z.number().min(0).max(100),
  ai_insights: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

export interface AnalysisResult extends ResumeAnalysis {
  fileName: string;
}

export type AppState = "input" | "analyzing" | "results";

export interface AnalysisProgress {
  current: number;
  total: number;
  currentFileName: string;
}
