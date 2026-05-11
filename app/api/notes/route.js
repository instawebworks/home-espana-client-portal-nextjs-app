import { getNotes } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionLogId = searchParams.get("submissionLogId");
    if (!submissionLogId) {
      return Response.json({ error: "Missing submissionLogId" }, { status: 400 });
    }
    const notes = await getNotes(SUBMISSION_LOGS_MODULE, submissionLogId);
    return Response.json({ notes });
  } catch (err) {
    console.error("Fetch notes error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
