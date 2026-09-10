import { redirect } from "next/navigation";
import { searchRecords, getRecord } from "@/lib/zoho/crm";
import { resolveLocale } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
import ApplicantsForm from "./ApplicantsForm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export default async function Page({ params }) {
  const { templateId, module, recordId } = await params;

  const submissionLogName = `${templateId}___${module}___${recordId}`;

  // crmRecord is only needed for the portal language, so it runs alongside the
  // submission-log lookup rather than adding a round trip.
  const [submissionLogRef, crmRecord] = await Promise.all([
    searchRecords(SUBMISSION_LOGS_MODULE, "Name", submissionLogName),
    getRecord(module, recordId),
  ]);

  const submissionLog = submissionLogRef
    ? await getRecord(SUBMISSION_LOGS_MODULE, submissionLogRef.id)
    : null;

  if (submissionLog?.Applicants_Listing) {
    redirect(`/${templateId}/${module}/${recordId}`);
  }

  return (
    <I18nProvider locale={resolveLocale(crmRecord)}>
      <ApplicantsForm
        templateId={templateId}
        module={module}
        recordId={recordId}
        submissionLogId={submissionLog?.id ?? null}
      />
    </I18nProvider>
  );
}
