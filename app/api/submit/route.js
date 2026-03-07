import { createRecord } from "@/lib/zoho/crm";

const SUBMISSION_LOGS_MODULE = "Submission_Logs";
const ORG_TIMEZONE = "Europe/Madrid";

// Returns "YYYY-MM-DDTHH:mm:ss+HH:mm" in the org's timezone (DST-aware)
function toZohoDatetime(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ORG_TIMEZONE,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
      timeZoneName: "shortOffset",
    }).formatToParts(date).map(({ type, value }) => [type, value])
  );
  // shortOffset gives e.g. "GMT+1" or "GMT+2" — convert to "+01:00" / "+02:00"
  const match = parts.timeZoneName.match(/GMT([+-])(\d+)(?::(\d+))?/);
  const offset = `${match[1]}${match[2].padStart(2, "0")}:${(match[3] ?? "0").padStart(2, "0")}`;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

function toZohoDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ORG_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date); // "YYYY-MM-DD"
}

export async function POST(request) {
  try {
    const { templateId, module, recordId, submissionLogId } =
      await request.json();

    let logId = submissionLogId;

    // Scenario 2: no existing record — create it
    if (!logId) {
      const now = new Date();
      const submissionDate = toZohoDate(now);
      const lastUpdated = toZohoDatetime(now);

      const name = `${templateId}___${module}___${recordId}`;
      const result = await createRecord(SUBMISSION_LOGS_MODULE, {
        Name: name,
        Related_Module_Name: module,
        Related_Record_ID: recordId,
        Template_ID: templateId,
        Submission_Date: submissionDate,
        Last_Updated: lastUpdated,
      });
      logId = result?.details?.id;

      if (!logId) {
        return Response.json(
          { error: "Failed to create submission log" },
          { status: 500 },
        );
      }
    }

    return Response.json({ submissionLogId: logId });
  } catch (err) {
    console.error("Submit error:", err?.message ?? err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
