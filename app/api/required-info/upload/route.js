import { cookies } from "next/headers";
import { uploadAttachment } from "@/lib/zoho/crm";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE, REQUIRED_INFO_PREFIX } from "@/lib/constants";

// Re-upload of the filled "Required Information" form.
// For now the file is saved to the related record's (e.g. Deal's) Attachments
// section — we can later move it to a dedicated destination per the client.
export async function POST(request) {
  try {
    const formData = await request.formData();
    const module = formData.get("module");
    const recordId = formData.get("recordId");
    const file = formData.get("file");

    if (!module || !recordId || !file) {
      return Response.json(
        { error: "Missing module, recordId or file" },
        { status: 400 },
      );
    }

    // Ensure the session belongs to this exact record before writing to it.
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (
      !session ||
      session.module !== module ||
      session.recordId !== recordId
    ) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prefix the stored filename so we can later identify (and only show the
    // client) forms that were uploaded through the portal.
    const storedName = `${REQUIRED_INFO_PREFIX}${file.name}`;
    const result = await uploadAttachment(module, recordId, file, storedName);
    const attachmentId = result?.details?.id;

    if (!attachmentId) {
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    return Response.json({ success: true, attachmentId: String(attachmentId) });
  } catch (err) {
    console.error("Required-info upload error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
