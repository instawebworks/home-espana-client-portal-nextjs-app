import { notFound } from "next/navigation";
import { getRecord, ZOHO_TEMPLATE_MODULE } from "@/lib/zoho/crm";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage({ params }) {
  const { templateId, module, recordId } = await params;

  const [templateRecord, crmRecord] = await Promise.all([
    getRecord(ZOHO_TEMPLATE_MODULE, templateId),
    getRecord(module, recordId),
  ]);

  if (!templateRecord || !crmRecord) notFound();

  const templateJson = JSON.parse(templateRecord.Template_JSON);
  const passwordFieldApi = templateJson?.passwordField?.value;
  const currentPassword = passwordFieldApi ? (crmRecord[passwordFieldApi] ?? "") : "";

  return (
    <ChangePasswordForm
      templateId={templateId}
      module={module}
      recordId={recordId}
      currentPassword={currentPassword}
    />
  );
}
