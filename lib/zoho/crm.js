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

export async function createRecord(module, data) {
  const token = await getAccessToken();

  const res = await axios.post(
    `${ZOHO_BASE_URL}/crm/v8/${module}`,
    { data: [data] },
    {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: () => true,
    },
  );

  if (res.status !== 201 && res.status !== 200) {
    console.error(
      "Zoho createRecord error:",
      JSON.stringify(res.data, null, 2),
    );
    throw new Error(`Zoho API returned ${res.status}`);
  }

  return res.data?.data?.[0];
}

export async function downloadAttachment(module, recordId, attachmentId) {
  const token = await getAccessToken();
  return fetch(
    `${ZOHO_BASE_URL}/crm/v8/${module}/${recordId}/Attachments/${attachmentId}`,
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } },
  );
}

export async function uploadAttachment(module, recordId, file) {
  const token = await getAccessToken();

  const bytes = await file.arrayBuffer();
  const formData = new FormData();
  formData.append("file", new Blob([bytes], { type: file.type }), file.name);

  const res = await axios.post(
    `${ZOHO_BASE_URL}/crm/v8/${module}/${recordId}/Attachments`,
    formData,
    {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: () => true,
    },
  );

  if (res.status !== 200 && res.status !== 201) {
    console.error(
      "Zoho uploadAttachment error:",
      JSON.stringify(res.data, null, 2),
    );
    throw new Error(`Zoho API returned ${res.status}`);
  }

  return res.data?.data?.[0];
}

export async function updateRecord(module, recordId, data) {
  const token = await getAccessToken();

  const res = await axios.put(
    `${ZOHO_BASE_URL}/crm/v8/${module}/${recordId}`,
    { data: [{ id: recordId, ...data }] },
    {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: () => true,
    },
  );

  if (res.status !== 200) {
    console.error(
      "Zoho updateRecord error:",
      JSON.stringify(res.data, null, 2),
    );
    throw new Error(`Zoho API returned ${res.status}`);
  }

  return res.data?.data?.[0];
}

export async function createNote(module, recordId, content) {
  const token = await getAccessToken();

  const res = await axios.post(
    `${ZOHO_BASE_URL}/crm/v8/Notes`,
    {
      data: [
        {
          Note_Title: "Client Note",
          Note_Content: content,
          Parent_Id: { id: recordId, module: { api_name: module } },
        },
      ],
    },
    {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      validateStatus: () => true,
    },
  );

  if (res.status !== 200 && res.status !== 201) {
    console.error("Zoho createNote error:", JSON.stringify(res.data, null, 2));
    throw new Error(`Zoho API returned ${res.status}`);
  }

  return res.data?.data?.[0];
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
