import { cookies } from "next/headers";
import { getRecord, ZOHO_TEMPLATE_MODULE } from "@/lib/zoho/crm";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  try {
    const { password, templateId, module, recordId } = await request.json();

    if (!password || !templateId || !module || !recordId) {
      return Response.json(
        { error: "Missing required fields", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    // 1. Fetch the template record
    const templateRecord = await getRecord(ZOHO_TEMPLATE_MODULE, templateId);
    if (!templateRecord) {
      return Response.json(
        { error: "Template not found", code: "TEMPLATE_NOT_FOUND" },
        { status: 404 },
      );
    }

    // 2. Parse Template_JSON to get the password field API name
    const templateJson = JSON.parse(templateRecord.Template_JSON);
    const passwordFieldApi = templateJson?.passwordField?.value;

    if (!passwordFieldApi) {
      return Response.json(
        { error: "Template configuration error", code: "TEMPLATE_CONFIG" },
        { status: 500 },
      );
    }

    // 3. Fetch the CRM record (Lead / Deal / Contact / etc.)
    const crmRecord = await getRecord(module, recordId);
    if (!crmRecord) {
      return Response.json(
        { error: "Record not found", code: "RECORD_NOT_FOUND" },
        { status: 404 },
      );
    }

    // 4. Get the stored password from the CRM record using the field API name
    const storedPassword = crmRecord[passwordFieldApi];

    if (!storedPassword) {
      return Response.json(
        { error: "No password set for this record", code: "NO_PASSWORD" },
        { status: 401 },
      );
    }

    // 5. Compare passwords
    if (password !== storedPassword) {
      return Response.json(
        { error: "Incorrect password", code: "INVALID_PASSWORD" },
        { status: 401 },
      );
    }

    // 6. Create a signed JWT session and set it as an HTTP-only cookie
    const { token, maxAge } = await createSession(templateId, module, recordId);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[login]", err);
    return Response.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
