const OCR_API_URL = "https://api.ocr.space/parse/image";
const OCR_TIMEOUT_MS = 45_000;

interface OcrResult {
  ParsedResults?: Array<{
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
  }>;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
}

export async function extractTextWithOcr(
  pdfBuffer: ArrayBuffer
): Promise<string> {
  const base64 = Buffer.from(pdfBuffer).toString("base64");
  const dataUri = `data:application/pdf;base64,${base64}`;

  const formData = new FormData();
  formData.append("base64Image", dataUri);
  formData.append("apikey", process.env.OCR_SPACE_API_KEY!);
  formData.append("filetype", "PDF");
  formData.append("OCREngine", "1");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);

  try {
    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OCR API returned ${response.status}`);
    }

    const data: OcrResult = await response.json();

    if (data.IsErroredOnProcessing || !data.ParsedResults?.length) {
      const errMsg =
        data.ErrorMessage?.join(", ") ||
        data.ParsedResults?.[0]?.ErrorMessage ||
        "OCR processing failed";
      throw new Error(errMsg);
    }

    return data.ParsedResults.map((r) => r.ParsedText).join("\n");
  } finally {
    clearTimeout(timeout);
  }
}
