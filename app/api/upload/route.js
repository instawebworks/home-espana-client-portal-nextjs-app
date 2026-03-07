import { uploadAttachment, updateRecord } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const submissionLogId = formData.get("submissionLogId");
    const metadata = JSON.parse(formData.get("metadata")); // [{ docName }, ...]
    const existingUploads = JSON.parse(formData.get("existingUploads")); // from submissionLog
    const files = formData.getAll("file");

    // Upload each file as an attachment and collect subform entries
    const newUploads = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadAttachment(SUBMISSION_LOGS_MODULE, submissionLogId, file);
      const attachmentId = result?.details?.id;

      newUploads.push({
        Document_Name: file.name,
        Attachment_ID: attachmentId,
        Document_Type: metadata[i].docName,
        Approval_Status: "Pending",
      });
    }

    // Preserve existing subform rows (by including their id) + append new ones
    const documentUploads = [
      ...existingUploads.map((entry) => ({ id: entry.id, ...entry })),
      ...newUploads,
    ];

    await updateRecord(SUBMISSION_LOGS_MODULE, submissionLogId, {
      Document_Uploads: documentUploads,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Upload error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
