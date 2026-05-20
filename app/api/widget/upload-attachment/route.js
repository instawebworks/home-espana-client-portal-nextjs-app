import { uploadAttachment } from "@/lib/zoho/crm";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const submissionLogId = formData.get("submissionLogId");
    const file = formData.get("file");

    if (!submissionLogId || !file) {
      return Response.json(
        { error: "Missing submissionLogId or file" },
        { status: 400, headers: CORS }
      );
    }

    const result = await uploadAttachment("Submission_Logs", submissionLogId, file);
    const attachmentId = result?.details?.id;

    if (!attachmentId) {
      return Response.json({ error: "Upload failed" }, { status: 500, headers: CORS });
    }

    return Response.json({ attachmentId: String(attachmentId) }, { headers: CORS });
  } catch (err) {
    console.error("Widget upload-attachment error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS });
  }
}
