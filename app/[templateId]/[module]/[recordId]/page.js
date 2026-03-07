import { notFound } from "next/navigation";
import { getRecord, searchRecords, ZOHO_TEMPLATE_MODULE } from "@/lib/zoho/crm";
import PortalPage from "./PortalPage";

export const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export default async function Page({ params }) {
  const { templateId, module, recordId } = await params;

  const submissionLogName = `${templateId}___${module}___${recordId}`;

  // Fetch template + CRM record + submission log search in parallel
  const [templateRecord, crmRecord, submissionLogRef] = await Promise.all([
    getRecord(ZOHO_TEMPLATE_MODULE, templateId),
    getRecord(module, recordId),
    searchRecords(SUBMISSION_LOGS_MODULE, "Name", submissionLogName),
  ]);

  // Search API doesn't return subform data — fetch full record by ID if found
  const submissionLog = submissionLogRef
    ? await getRecord(SUBMISSION_LOGS_MODULE, submissionLogRef.id)
    : null;

  if (!templateRecord || !crmRecord) {
    notFound();
  }

  const templateJson = JSON.parse(templateRecord.Template_JSON);

  return (
    <PortalPage
      templateId={templateId}
      module={module}
      recordId={recordId}
      templateJson={templateJson}
      crmRecord={crmRecord}
      submissionLog={submissionLog}
    />
  );
}
