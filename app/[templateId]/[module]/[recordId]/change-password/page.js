import { notFound } from "next/navigation";
import { getRecord, ZOHO_TEMPLATE_MODULE } from "@/lib/zoho/crm";
import { resolveLocale } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
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
    <I18nProvider locale={resolveLocale(crmRecord)}>
      <ChangePasswordForm
        templateId={templateId}
        module={module}
        recordId={recordId}
        currentPassword={currentPassword}
      />
    </I18nProvider>
  );
}
