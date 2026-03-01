import PortalPage from "./PortalPage";

export default async function Page({ params }) {
  const { templateId, module, recordId } = await params;

  return (
    <PortalPage
      templateId={templateId}
      module={module}
      recordId={recordId}
    />
  );
}
