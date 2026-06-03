const LC_SHEET_MAP = {
  ADMU: "ADMU May Responses",
  CSB: "CSB May Responses",
  DLSU: "DLSU May Responses",
  MC: "MC May Responses",
  UPC: "UPC May Responses",
  UPD: "UPD May Responses",
  UPLB: "UPLB May Responses",
  UPM: "UPM May Responses",
  UST: "UST May Responses"
};

const { google } = require("googleapis");
const { getAllQuestionFields } = require("./questions");

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createAuthClient() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey =
    getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
}

async function getSheetsApi() {
  const auth = createAuthClient();
  await auth.authorize();

  return google.sheets({
    version: "v4",
    auth
  });
}

async function ensureSheetTab(sheets, spreadsheetId, sheetName) {
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`
    });
  } catch (error) {
    const isMissingSheet =
      error?.code === 400 || error?.status === 400;

    if (!isMissingSheet) throw error;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetName }
            }
          }
        ]
      }
    });
  }
}

function getHeaderRow() {
  return [
    "submitted_at",
    "started_at",
    "reference_code",
    "telegram_user_id",
    "telegram_username",
    "telegram_first_name",
    "telegram_last_name",
    ...getAllQuestionFields()
  ];
}

async function ensureHeaderRow(
  sheets,
  spreadsheetId,
  sheetName,
  headers
) {
  await ensureSheetTab(sheets, spreadsheetId, sheetName);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`
  });

  const existingHeaders = response.data.values?.[0] || [];

  if (existingHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!1:1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] }
    });
  }

  return existingHeaders.length ? existingHeaders : headers;
}

function buildRow(headers, payload) {
  return headers.map((header) => {
    const value = payload[header];
    return value === undefined || value === null
      ? ""
      : String(value);
  });
}

async function appendSurveyResponse(payload) {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = await getSheetsApi();

  const lc = payload.lc || "";
  const sheetName =
    LC_SHEET_MAP[lc] || "NAMS Responses";

  const headers = getHeaderRow();

  const activeHeaders = await ensureHeaderRow(
    sheets,
    spreadsheetId,
    sheetName,
    headers
  );

  const row = buildRow(activeHeaders, payload);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row]
    }
  });
}

module.exports = {
  appendSurveyResponse
};
