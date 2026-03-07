import { createNote } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export async function POST(request) {
  try {
    const { submissionLogId, content } = await request.json();

    if (!submissionLogId || !content?.trim()) {
      return Response.json({ error: "Missing submissionLogId or content" }, { status: 400 });
    }

    await createNote(SUBMISSION_LOGS_MODULE, submissionLogId, content.trim());

    return Response.json({ success: true });
  } catch (err) {
    console.error("Note creation error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
