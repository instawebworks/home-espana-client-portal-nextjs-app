import { notFound, redirect } from "next/navigation";
import {
  getRecord,
  getNotes,
  searchRecords,
  listAttachments,
  ZOHO_TEMPLATE_MODULE,
} from "@/lib/zoho/crm";
import { REQUIRED_INFO_PREFIX } from "@/lib/constants";
import PortalPage from "./PortalPage";

export const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export default async function Page({ params, searchParams }) {
  const { templateId, module, recordId } = await params;
  const { lid } = await searchParams;

  const submissionLogName = `${templateId}___${module}___${recordId}`;

  // If lid (log ID) is provided, use getRecord directly — avoids Zoho search indexing delay
  // after the submission log was just created by the applicants setup flow.
  const submissionLogId = lid ?? (await searchRecords(SUBMISSION_LOGS_MODULE, "Name", submissionLogName))?.id ?? null;

  // Fetch template + CRM record + record attachments in parallel; fetch full
  // submission log + notes by ID if found =>
  const [templateRecord, crmRecord, recordAttachments] = await Promise.all([
    getRecord(ZOHO_TEMPLATE_MODULE, templateId),
    getRecord(module, recordId),
    listAttachments(module, recordId),
  ]);

  // Only the forms re-uploaded through the portal (identified by the marker
  // prefix) — never expose unrelated attachments on the record to the client.
  const requiredInfoUploads = (recordAttachments ?? [])
    .filter((a) => (a.File_Name ?? "").startsWith(REQUIRED_INFO_PREFIX))
    .map((a) => ({
      id: a.id,
      name: (a.File_Name ?? "").slice(REQUIRED_INFO_PREFIX.length),
      time: a.Created_Time ?? a.Modified_Time ?? null,
    }))
    .sort((a, b) => new Date(b.time ?? 0) - new Date(a.time ?? 0));

  const [submissionLog, initialNotes] = submissionLogId
    ? await Promise.all([
        getRecord(SUBMISSION_LOGS_MODULE, submissionLogId),
        getNotes(SUBMISSION_LOGS_MODULE, submissionLogId),
      ])
    : [null, []];

  if (!templateRecord || !crmRecord) {
    notFound();
  }

  if (!submissionLog?.Applicants_Listing) {
    redirect(`/${templateId}/${module}/${recordId}/applicants`);
  }

  const templateJson = crmRecord.Additional_Template_JSON
    ? JSON.parse(crmRecord.Additional_Template_JSON)
    : JSON.parse(templateRecord.Template_JSON);

  return (
    <PortalPage
      templateId={templateId}
      module={module}
      recordId={recordId}
      templateJson={templateJson}
      crmRecord={crmRecord}
      submissionLog={submissionLog}
      initialNotes={initialNotes}
      requiredInfoUploads={requiredInfoUploads}
    />
  );
}
