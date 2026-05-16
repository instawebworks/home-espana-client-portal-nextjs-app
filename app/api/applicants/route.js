import { createRecord, updateRecord } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export async function POST(request) {
  try {
    const { templateId, module, recordId, submissionLogId, names } = await request.json();

    if (!templateId || !module || !recordId || !names?.length) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const applicantsListing = names.join("; ");
    let logId = submissionLogId;

    if (logId) {
      await updateRecord(SUBMISSION_LOGS_MODULE, logId, { Applicants_Listing: applicantsListing });
    } else {
      const result = await createRecord(SUBMISSION_LOGS_MODULE, {
        Name: `${templateId}___${module}___${recordId}`,
        Related_Module_Name: module,
        Related_Record_ID: recordId,
        Template_ID: templateId,
        Applicants_Listing: applicantsListing,
      });
      logId = result?.details?.id;

      if (!logId) {
        return Response.json({ error: "Failed to create submission log" }, { status: 500 });
      }
    }

    return Response.json({ success: true, submissionLogId: logId });
  } catch (err) {
    console.error("[applicants]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
