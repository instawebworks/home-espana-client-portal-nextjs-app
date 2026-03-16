import { uploadAttachment, updateRecord } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";
const ORG_TIMEZONE = "Europe/Madrid";

function toZohoDatetime(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ORG_TIMEZONE,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
      timeZoneName: "shortOffset",
    }).formatToParts(date).map(({ type, value }) => [type, value])
  );
  const match = parts.timeZoneName.match(/GMT([+-])(\d+)(?::(\d+))?/);
  const offset = `${match[1]}${match[2].padStart(2, "0")}:${(match[3] ?? "0").padStart(2, "0")}`;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

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
      Last_Updated: toZohoDatetime(new Date()),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Upload error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
