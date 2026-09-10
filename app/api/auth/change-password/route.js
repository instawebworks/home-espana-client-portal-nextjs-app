import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getRecord, updateRecord, ZOHO_TEMPLATE_MODULE } from "@/lib/zoho/crm";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return Response.json(
        { error: "Unauthorized", code: "SERVER_ERROR" },
        { status: 401 },
      );
    }

    const { oldPassword, newPassword, templateId, module, recordId } = await request.json();

    if (!oldPassword || !newPassword || !templateId || !module || !recordId) {
      return Response.json(
        { error: "Missing required fields", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    if (session.templateId !== templateId || session.module !== module || session.recordId !== recordId) {
      return Response.json(
        { error: "Unauthorized", code: "SERVER_ERROR" },
        { status: 401 },
      );
    }

    // Fetch template to get password field API name
    const templateRecord = await getRecord(ZOHO_TEMPLATE_MODULE, templateId);
    if (!templateRecord) {
      return Response.json(
        { error: "Template not found", code: "TEMPLATE_NOT_FOUND" },
        { status: 404 },
      );
    }
    const templateJson = JSON.parse(templateRecord.Template_JSON);
    const passwordFieldApi = templateJson?.passwordField?.value;
    if (!passwordFieldApi) {
      return Response.json(
        { error: "Template configuration error", code: "TEMPLATE_CONFIG" },
        { status: 500 },
      );
    }

    // Verify old password
    const crmRecord = await getRecord(module, recordId);
    if (!crmRecord) {
      return Response.json(
        { error: "Record not found", code: "RECORD_NOT_FOUND" },
        { status: 404 },
      );
    }
    if (crmRecord[passwordFieldApi] !== oldPassword) {
      return Response.json(
        { error: "Current password is incorrect", code: "INVALID_OLD_PASSWORD" },
        { status: 401 },
      );
    }

    // Update CRM record with new password
    await updateRecord(module, recordId, { [passwordFieldApi]: newPassword });

    // Clear session so user must re-login
    cookieStore.delete(SESSION_COOKIE);

    return Response.json({ success: true });
  } catch (err) {
    console.error("[change-password]", err);
    return Response.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
