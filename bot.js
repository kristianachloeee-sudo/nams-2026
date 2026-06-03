require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { appendSurveyResponse } = require("./sheets");
const { buildSurveyFlow } = require("./questions");
const { createReferenceCode, toIsoTimestamp } = require("./utils");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

const sessions = new Map();

/* ---------------- SESSION ---------------- */

function getSession(id) {
  return sessions.get(id);
}

function setSession(id, session) {
  sessions.set(id, session);
}

function clearSession(id) {
  sessions.delete(id);
}

function createSession(msg) {
  return {
    chatId: msg.chat.id,
    userId: msg.from.id,
    startedAt: new Date(),
    answers: {},
    flow: buildSurveyFlow(),
    index: 0,
    isSubmitting: false
  };
}

/* ---------------- ASK ---------------- */

async function ask(session) {
  const q = session.flow[session.index];

  if (!q) return submit(session);

  if (q.type === "message") {
    await bot.sendMessage(session.chatId, q.prompt);
    session.index++;
    return ask(session);
  }

  await bot.sendMessage(session.chatId, q.prompt);
}

/* ---------------- HANDLE ANSWER ---------------- */

async function handleAnswer(session, text) {
  const q = session.flow[session.index];

  if (!q) return submit(session);

  // skip message nodes safely
  if (!q.field) {
    session.index++;
    return ask(session);
  }

  // store answer
  session.answers[q.field] = text;
  session.index++;

  // ---------------- IMPORTANT FIX ----------------
  // Rebuild flow IMMEDIATELY AFTER we capture the branching answer
  if (q.field === "has_existing_nams_code") {
    const updatedFlow = buildSurveyFlow(session.answers);

    session.flow = updatedFlow;

    // IMPORTANT:
    // reset index to NEXT valid question in new flow
    session.index = 1;

    return ask(session);
  }

  return ask(session);
}

/* ---------------- SUBMIT ---------------- */

async function submit(session) {
  if (session.isSubmitting) return;
  session.isSubmitting = true;

  const referenceCode =
    session.answers.has_existing_nams_code === "Yes"
      ? session.answers.existing_nams_code
      : createReferenceCode("NAMS");

  const payload = {
    ...session.answers,
    reference_code: referenceCode,
    submitted_at: toIsoTimestamp(new Date()),
    started_at: toIsoTimestamp(session.startedAt)
  };

  await appendSurveyResponse(payload);

  await bot.sendMessage(
    session.chatId,
    `Thank you 💙\n\nYour reference code is:\n${referenceCode}`
  );

  clearSession(session.userId);
}

/* ---------------- EVENTS ---------------- */

bot.onText(/\/start/, async (msg) => {
  const session = createSession(msg);

  setSession(msg.from.id, session);

  await ask(session);
});

bot.on("message", async (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  const session = getSession(msg.from.id);
  if (!session) return;

  await handleAnswer(session, msg.text.trim());
});

console.log("Bot running...");

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send("NAMS bot is running 💙");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Health server running on", PORT);
});
