import { getRecord } from "@/lib/zoho/crm";
import { resolveLocale } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
import LoginForm from "./LoginForm";

export default async function LoginPage({ params }) {
  const { templateId, module, recordId } = await params;

  // Fetched purely to pick the portal language — the login screen renders
  // before any session exists, so there is nothing else to read it from.
  // A failed lookup returns null and resolveLocale falls back to English.
  const crmRecord = await getRecord(module, recordId);

  return (
    <I18nProvider locale={resolveLocale(crmRecord)}>
      <LoginForm templateId={templateId} module={module} recordId={recordId} />
    </I18nProvider>
  );
}
