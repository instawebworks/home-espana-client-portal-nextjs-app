const ZOHO_BASE_URL = process.env.ZOHO_BASE_URL; // e.g. https://www.zohoapis.eu
import axios from "axios";

export const ZOHO_TEMPLATE_MODULE = process.env.ZOHO_TEMPLATE_MODULE; // custom module name for checklist templates

async function getAccessToken() {
  const res = await axios.get(process.env.ZOHO_ACCESS_TOKEN_FUNCTION);

  const data = await res?.data;

  if (!data.accessToken) {
    throw new Error("Failed to obtain Zoho access token");
  }

  return data.accessToken.replace("Bearer ", "");
}

export async function searchRecords(module, field, value) {
  const token = await getAccessToken();

  const res = await fetch(`${ZOHO_BASE_URL}/crm/v8/Leads?fields=Last_Name`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log(res);
  // Zoho returns 204 No Content when no records match — body is empty
  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok || !data.data?.[0]) {
    return null;
  }

  return data.data[0];
}

export async function getRecord(module, recordId) {
  const token = await getAccessToken();

  const res = await fetch(`${ZOHO_BASE_URL}/crm/v8/${module}/${recordId}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });

  const data = await res.json();

  if (!res.ok || !data.data?.[0]) {
    return null;
  }

  return data.data[0];
}
