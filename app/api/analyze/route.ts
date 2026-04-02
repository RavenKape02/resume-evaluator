import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { rateLimiter } from "@/lib/rate-limit";
import { ResumeAnalysisSchema } from "@/lib/types";
import { extractTextWithOcr } from "@/lib/ocr";

const SYSTEM_PROMPT = `You are a world-class Technical Recruiter known for being extremely critical and detail-oriented. Your task is to evaluate a candidate's resume against a specific job role. If a candidate is missing a core technology or lacks evidence of impact, you must lower the rating. Provide feedback in basic, clear language.`;

const JSON_INSTRUCTION = `Respond with ONLY a valid JSON object (no markdown, no code fences) with these exact fields:
- "name": string (candidate's full name from the resume)
- "rating": number (0-100 score based on fit)
- "ai_insights": string (critical summary of fit)
- "pros": string[] (strengths relevant to the role)
- "cons": string[] (weaknesses or concerns)
- "missing_skills": string[] (key skills required but missing)`;

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILES = 10;
const MIN_TEXT_LENGTH = 50;

function parseJsonResponse(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return ResumeAnalysisSchema.parse(JSON.parse(jsonMatch[0]));
}

async function analyzeResume(
  extractedText: string,
  roleTitle: string,
  jobContext: string
) {
  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    prompt: `Evaluate the following resume for the role of "${roleTitle}".${jobContext ? `\n\nAdditional job context:\n${jobContext}` : ""}

Resume text:
${extractedText}

${JSON_INSTRUCTION}`,
  });

  return parseJsonResponse(text);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const { success, remaining, reset } = await rateLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. You can perform 5 analyses per hour.",
          remaining: 0,
          resetAt: reset,
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const roleTitle = formData.get("roleTitle") as string;
    const jobContext = formData.get("jobContext") as string;
    const files = formData.getAll("files") as File[];

    if (!roleTitle?.trim()) {
      return NextResponse.json(
        { error: "Role title is required." },
        { status: 400 }
      );
    }

    if (!files.length) {
      return NextResponse.json(
        { error: "At least one PDF file is required." },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed per analysis.` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 2MB size limit.` },
          { status: 400 }
        );
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PDF.` },
          { status: 400 }
        );
      }
    }

    async function processFile(file: File) {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = "";

      try {
        extractedText = await extractTextWithOcr(arrayBuffer);
      } catch (ocrErr) {
        console.error(`OCR extraction failed for ${file.name}:`, ocrErr);
      }

      if (extractedText.trim().length < MIN_TEXT_LENGTH) {
        return {
          fileName: file.name,
          name: file.name.replace(".pdf", ""),
          rating: 0,
          ai_insights:
            "Could not extract readable text from this PDF, even with OCR. The file may be corrupted or contain unsupported content.",
          pros: [],
          cons: ["No extractable text content"],
          missing_skills: [],
        };
      }

      try {
        const validated = await analyzeResume(
          extractedText,
          roleTitle.trim(),
          jobContext.trim()
        );
        return { ...validated, fileName: file.name };
      } catch (err) {
        console.error(`AI analysis failed for ${file.name}:`, err);
        return {
          fileName: file.name,
          name: file.name.replace(".pdf", ""),
          rating: 0,
          ai_insights: "AI analysis failed for this resume. Please try again.",
          pros: [],
          cons: ["Analysis error"],
          missing_skills: [],
        };
      }
    }

    const CONCURRENCY = 3;
    const results = [];
    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(batch.map(processFile));
      results.push(...batchResults);
    }

    results.sort((a, b) => b.rating - a.rating);

    return NextResponse.json({ results, remaining });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during analysis." },
      { status: 500 }
    );
  }
}
