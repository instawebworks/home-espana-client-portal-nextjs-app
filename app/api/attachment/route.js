import { downloadAttachment } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionLogId = searchParams.get("submissionLogId");
    const attachmentId = searchParams.get("attachmentId");

    const zohoRes = await downloadAttachment(SUBMISSION_LOGS_MODULE, submissionLogId, attachmentId);

    if (!zohoRes.ok) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(zohoRes.body, {
      headers: {
        "Content-Type": zohoRes.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error("Attachment fetch error:", err?.message ?? err);
    return new Response("Internal server error", { status: 500 });
  }
}
