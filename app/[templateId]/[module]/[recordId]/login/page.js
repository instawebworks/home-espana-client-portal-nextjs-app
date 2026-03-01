import LoginForm from "./LoginForm";

export default async function LoginPage({ params }) {
  const { templateId, module, recordId } = await params;

  return (
    <LoginForm
      templateId={templateId}
      module={module}
      recordId={recordId}
    />
  );
}
