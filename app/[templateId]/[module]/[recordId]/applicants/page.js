import { redirect } from "next/navigation";
import { searchRecords, getRecord } from "@/lib/zoho/crm";
import ApplicantsForm from "./ApplicantsForm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export default async function Page({ params }) {
  const { templateId, module, recordId } = await params;

  const submissionLogName = `${templateId}___${module}___${recordId}`;
  const submissionLogRef = await searchRecords(SUBMISSION_LOGS_MODULE, "Name", submissionLogName);

  const submissionLog = submissionLogRef
    ? await getRecord(SUBMISSION_LOGS_MODULE, submissionLogRef.id)
    : null;

  if (submissionLog?.Applicants_Listing) {
    redirect(`/${templateId}/${module}/${recordId}`);
  }

  return (
    <ApplicantsForm
      templateId={templateId}
      module={module}
      recordId={recordId}
      submissionLogId={submissionLog?.id ?? null}
    />
  );
}
