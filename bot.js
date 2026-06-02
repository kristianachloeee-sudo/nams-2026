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

function setSession(id, s) {
  sessions.set(id, s);
}

function clearSession(id) {
  sessions.delete(id);
}

function createSession(msg) {
  return {
    chatId: msg.chat.id,
    userId: msg.from.id,
    startedAt: new Date(),
    answers: {
      has_existing_nams_code: ""
    },
    flow: [],
    index: 0,
    isSubmitting: false
  };
}

/* ---------------- FLOW CONTROL ---------------- */

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

/* ---------------- ANSWER HANDLER ---------------- */

async function handleAnswer(session, text) {
  const q = session.flow[session.index];

  if (!q) return submit(session);

  session.answers[q.field] = text;

  session.index++;

  /* 🔥 KEY FIX: BRANCH AFTER NAMS ANSWER */
  if (q.field === "has_existing_nams_code") {
    session.flow = buildSurveyFlow({
      has_existing_nams_code: session.answers.has_existing_nams_code
    });

    session.index = 1;
    return ask(session);
  }

  /* 🔥 SECOND BRANCH: if YES → ask code next */
  if (
    q.field === "has_existing_nams_code" &&
    text === "Yes"
  ) {
    session.flow = buildSurveyFlow(session.answers);
    session.index = 1;
    return ask(session);
  }

  return ask(session);
}

/* ---------------- SUBMIT ---------------- */

async function submit(session) {
  if (session.isSubmitting) return;
  session.isSubmitting = true;

  let code;

  if (session.answers.has_existing_nams_code === "Yes") {
    code = session.answers.existing_nams_code;
  } else {
    code = createReferenceCode("NAMS");
  }

  const payload = {
    ...session.answers,
    reference_code: code,
    submitted_at: toIsoTimestamp(new Date()),
    started_at: toIsoTimestamp(session.startedAt)
  };

  await appendSurveyResponse(payload);

  await bot.sendMessage(
    session.chatId,
    `Thank you 💙\nYour reference code: ${code}`
  );

  clearSession(session.userId);
}

/* ---------------- EVENTS ---------------- */

bot.onText(/\/start/, async (msg) => {
  const session = createSession(msg);

  session.flow = buildSurveyFlow(session.answers);

  setSession(msg.from.id, session);

  await ask(session);
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const session = getSession(msg.from.id);
  if (!session) return;

  await handleAnswer(session, msg.text.trim());
});

console.log("Bot running");
