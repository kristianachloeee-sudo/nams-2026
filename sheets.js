const { google } = require("googleapis");
const { getAllQuestionFields } = require("./questions");

const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "NAMS Responses";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createAuthClient() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

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

async function ensureSheetTab(sheets, spreadsheetId) {
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!1:1`
    });
  } catch (error) {
    const isMissingSheet = error?.code === 400 || error?.status === 400;

    if (!isMissingSheet) {
      throw error;
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: SHEET_NAME
              }
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

async function ensureHeaderRow(sheets, spreadsheetId, headers) {
  await ensureSheetTab(sheets, spreadsheetId);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!1:1`
  });

  const existingHeaders = response.data.values?.[0] || [];

  if (existingHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!1:1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers]
      }
    });

    return headers;
  }

  return existingHeaders;
}

function buildRow(headers, payload) {
  return headers.map((header) => {
    const value = payload[header];

    if (value === undefined || value === null) {
      return "";
    }

    return String(value);
  });
}

async function appendSurveyResponse(payload) {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = await getSheetsApi();
  const headers = getHeaderRow();
  const activeHeaders = await ensureHeaderRow(sheets, spreadsheetId, headers);
  const row = buildRow(activeHeaders, payload);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:A`,
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
