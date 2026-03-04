const ZOHO_BASE_URL = process.env.ZOHO_BASE_URL; // e.g. https://www.zohoapis.eu
import axios from "axios";

export const ZOHO_TEMPLATE_MODULE = process.env.ZOHO_TEMPLATE_MODULE; // custom module name for checklist templates

async function getAccessToken() {
  // const res = await axios.get(process.env.ZOHO_ACCESS_TOKEN_FUNCTION);
  const res = await axios.get(
    process.env.ADMIN_API_URL + "/auth/authenticator/accesstoken",
    {
      headers: {
        connname:
          "easyauthenticator__zoho__zoho_crm_connection__hola@hipoteken.com",
        orgid: "434889000000287639",
        apikey: "8E82HG7-KEC4P7G-KT3Q5D2-NDBVP27",
        Accept: "*/*",
        "content-type": "application/json",
      },
    },
  );

  const data = await res?.data?.data;

  if (!data.accessToken) {
    throw new Error("Failed to obtain Zoho access token");
  }

  return data.accessToken.replace("Bearer ", "");
}

export async function searchRecords(module, field, value) {
  const token = await getAccessToken();

  const res = await axios.get(
    `${ZOHO_BASE_URL}/crm/v8/${module}/search?criteria=(${field}:equals:${value})`,
    {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: (status) => status === 200 || status === 204,
    },
  );
  // Zoho returns 204 No Content when no records match — body is empty
  if (res.status === 204) {
    return null;
  }

  const data = res.data;

  if (!data.data?.[0]) {
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
