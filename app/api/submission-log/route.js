import { getRecord } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const record = await getRecord(SUBMISSION_LOGS_MODULE, id);
    return Response.json({ record });
  } catch (err) {
    console.error("Fetch submission log error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
