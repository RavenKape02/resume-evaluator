# AI Resume Evaluator

AI Resume Evaluator is a full-stack web app that screens resumes with AI.
Users upload PDF resumes, enter a target role, and get ranked results with clear strengths, weaknesses, missing skills, and an overall fit score.

This project is built for portfolio demonstration of practical full-stack work: file upload handling, OCR fallback, LLM integration, validation, rate limiting, and polished UI.

## What The Project Does

- Accepts up to 10 PDF resumes in one submission
- Lets the user add a role title and optional job description/context
- Extracts resume text from each PDF
- Uses OCR fallback when PDF text extraction is weak or empty
- Sends extracted text to an AI model for strict recruiter-style evaluation
- Returns structured scoring and feedback per candidate
- Sorts candidates by score and shows details in a modal

## Main User Flow

1. User enters role title and optional job context.
2. User uploads resume PDFs through drag-and-drop.
3. App validates file count, file type, and file size.
4. Backend processes files in batches and analyzes each resume.
5. UI shows ranked results and detailed feedback per candidate.

## Core Features

- Batch analysis: up to 10 resumes at once
- Strict AI grading: score from 0 to 100
- Structured response fields: name, rating, insight, pros, cons, missing skills
- OCR fallback for scanned/image-heavy PDFs
- Rate-limited analyze endpoint (5 requests per hour per IP)
- Progress state and loading feedback in UI
- Light/dark theme toggle

## Tech Stack And What Each Part Is Used For

| Technology                                       | Purpose In This Project                                           |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| Next.js 16 (App Router)                          | Full-stack framework for UI pages and API route handling          |
| React 19                                         | Component-based frontend and client state management              |
| TypeScript                                       | Type safety for API responses, state, and shared models           |
| Tailwind CSS 4                                   | Utility-first styling and layout system                           |
| shadcn UI (base-nova style)                      | Reusable UI components and design tokens                          |
| @base-ui/react                                   | Primitive UI behavior used by custom UI components                |
| lucide-react                                     | Icons across uploader, results, modal, and controls               |
| react-dropzone                                   | Drag-and-drop PDF upload experience                               |
| ai + @ai-sdk/groq                                | LLM integration layer and Groq model access                       |
| Groq llama-3.3-70b-versatile                     | Resume evaluation model                                           |
| zod                                              | Output schema validation for AI response structure                |
| pdf-parse                                        | Primary text extraction from standard PDFs                        |
| OCR.space API                                    | Fallback extraction when PDFs are scanned or image-based          |
| @upstash/redis + @upstash/ratelimit              | Sliding-window rate limiting for API protection and usage control |
| class-variance-authority + clsx + tailwind-merge | Clean variant styling and utility class merging                   |

## Architecture Overview

### Frontend

- Main page manages three app states:
  - input
  - analyzing
  - results
- Reusable components handle upload, table view, and detail modal.
- Results are presented with score-based visual cues.

### Backend

- Single analyze API route handles:
  - request validation
  - rate limit checks
  - PDF parsing
  - OCR fallback
  - AI analysis
  - score sorting
- Files are processed in controlled concurrency batches to avoid overloading services.

### Data Shape

Each analyzed resume returns:

- name
- rating (0-100)
- ai_insights
- pros
- cons
- missing_skills
- fileName

## Validation And Guardrails

- Maximum files per request: 10
- Allowed file type: PDF only
- Maximum file size: 2 MB each
- Minimum extracted text threshold before OCR fallback
- Graceful fallback result when text cannot be extracted or AI analysis fails

## Project Structure

- app: Next.js app pages, layout, and API route
- components: feature components (uploader, results table, detail modal, theming)
- components/ui: reusable UI primitives and styled wrappers
- lib: shared logic (OCR, rate limit, types, utilities)
- public: static files and sample resume assets

## Notable Implementation Details

- AI prompt is intentionally strict to simulate a critical technical recruiter.
- AI output is parsed and validated against a strict schema for consistency.
- OCR is only used as a fallback to keep normal PDF analysis fast.
- Rate limiting is IP-based and enforced server-side.
- App returns useful partial results even when one file fails.

## Current Scope And Limits

- No persistent database storage for analysis history
- Single role target per analysis batch
- Synchronous request flow (no queue worker)
- OCR quality depends on scan quality

This project focuses on real-world resume screening workflow design, practical backend safeguards, and clear frontend delivery of AI-generated evaluation results.
