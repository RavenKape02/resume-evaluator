Project Blueprint: AI Resume Evaluator
Tech Stack
Framework: Next.js

Language: TypeScript

Styling: Tailwind CSS + Shadcn UI
USE THIS DESIGN SYSTEM WITH THE HELP OF FIGMA MCP: https://www.figma.com/design/xE17Qj57p4OYoqqwitup5s/-shadcn-ui---Design-System--Community-

PDF Processing, extract to text: pdf-parse

🛠️ Infrastructure Setup

- We're using groq's llama-3.3-70b-versatile for the AI model, i put the api key in .env.local
  Heres the usage of the Vercel AI Sdk

First, install the ai package and the Groq provider @ai-sdk/groq:

```bash
npm install ai @ai-sdk/groq
```

Then, you can use the Groq provider to generate text. By default, the provider will look for GROQ_API_KEY as the API key.

```typescript
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

const result = await generateText({
  model: groq("llama-3.3-70b-versatile"),
  messages: [{ role: "user", content: "Hello, how are you?" }],
});

console.log(result.text);
```

AI Logic & Structured Output
To ensure the "Critical Recruiter" persona and consistent data, use Structured Outputs with the following schema.

System Prompt
"You are a world-class Technical Recruiter known for being extremely critical and detail-oriented. Your task is to evaluate a candidate's resume against a specific job role. If a candidate is missing a core technology or lacks evidence of impact, you must lower the rating. Provide feedback in basic, clear language."

Response Schema (TypeScript)
TypeScript
const ResumeSchema = {
type: "object",
properties: {
name: { type: "string" },
rating: { type: "number", description: "Score from 0-100" },
ai_insights: { type: "string", description: "Critical summary of fit" },
pros: { type: "array", items: { type: "string" } },
cons: { type: "array", items: { type: "string" } },
missing_skills: { type: "array", items: { type: "string" } }
},
required: ["name", "rating", "ai_insights", "pros", "cons", "missing_skills"],
additionalProperties: false,
}

🌊 User Flow & UI Components

1. The Landing/Input Page
   Component: Input (Role Title) + Textarea (Job Context)

Component: FileUploader (Custom drag-and-drop using react-dropzone)
Constraint: Frontend validation to prevent more than 10 PDF files from being selected.

2. The Analysis State
   Logic: Once "Analyze" is clicked:

Validate: files.length <= 10.

Loop through files → Extract text via pdf-parse.

Batch send to Groq model

UI: Show a Progress Bar or a "Scanning" animation over the resumes.

3. The Results Dashboard
   Table: Use Shadcn Table.

Columns: Name, Rating (Color-coded), Details (Button).
Score > 80: Green text.
Score 50-79: Amber/Orange text.
Score < 50: Red text.

Sorting: Automatically sort the array by rating descending.

4. Detailed View (Modal)
   Component: Shadcn Dialog.

Layout:

Header: Name & Large Score.

Body: Two-column grid.

Left: Pros/Cons (Bullet points).

Right: Missing Skills (Red Badges).

Footer: Critical AI Insight paragraph.

📈 Credit Optimization & Constraints
Batch Limit: Maximum 10 PDFs per analysis. This prevents Vercel "Function Timeout" errors and manages your token spend.

Rate Limiting: Implement a limit (e.g., 5 analysis requests per hour), I dont know what tech stack to use for this, but the idea is rate limit for the analyze button, 5 analyzes per hour
File Size: Limit uploads to 2MB per file.
