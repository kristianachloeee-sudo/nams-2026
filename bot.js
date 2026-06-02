require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { appendSurveyResponse } = require("./sheets");
const {
  buildSurveyFlow,
  getChoiceKeyboard,
  getScaleKeyboard,
  getSatisfactionKeyboard
} = require("./questions");
const { createReferenceCode, toIsoTimestamp } = require("./utils");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

const sessions = new Map();

let bot;

if (process.env.TELEGRAM_WEBHOOK_URL) {
  const express = require("express");
  const app = express();

  app.use(express.json());

  bot = new TelegramBot(token, { polling: false });

  const webhookPath = `/webhook/${token}`;
  const webhookUrl = `${process.env.TELEGRAM_WEBHOOK_URL}${webhookPath}`;

  bot.setWebHook(webhookUrl);

  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.get("/", (_req, res) => {
    res.send("NAMS bot is running.");
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Webhook server listening on ${port}`);
  });
} else {
  bot = new TelegramBot(token, { polling: true });
}

function removeKeyboard() {
  return { remove_keyboard: true };
}

function getSession(userId) {
  return sessions.get(userId);
}

function setSession(userId, session) {
  sessions.set(userId, session);
}

function clearSession(userId) {
  sessions.delete(userId);
}

function createSession(msg) {
  return {
    chatId: msg.chat.id,
    userId: msg.from.id,
    startedAt: new Date(),
    answers: {
      has_existing_nams_code: "",
      existing_nams_code: "",

      telegram_first_name: msg.from.first_name || "",
      telegram_last_name: msg.from.last_name || "",
      telegram_username: msg.from.username || "",
      telegram_user_id: String(msg.from.id)
    },
    flow: [],
    index: 0,
    pendingOtherQuestion: null,
    multiChoiceSelections: {},
    isSubmitting: false
  };
}

async function sendWelcome(chatId) {
  const welcomeMessage = [
    "Hi there! Welcome to the Feb/March National AIESEC Membership Survey 💙",
    "",
    "We'd really love your honest thoughts here 😊",
    "Your responses help us understand your experience better.",
    "",
    "This will only take a few minutes 🌼"
  ].join("\n");

  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: removeKeyboard()
  });
}

async function askCurrentQuestion(session) {
  const question = session.flow[session.index];

  if (!question) {
    await submitSurvey(session);
    return;
  }

  if (question.type === "message") {
    await bot.sendMessage(session.chatId, question.prompt, {
      reply_markup: removeKeyboard()
    });
    session.index += 1;
    return askCurrentQuestion(session);
  }

  let options = { reply_markup: removeKeyboard() };

  if (question.type === "choice") {
    options.reply_markup = {
      keyboard: getChoiceKeyboard(question.options),
      resize_keyboard: true
    };
  }

  if (question.type === "scale_1_10") {
    options.reply_markup = {
      keyboard: getScaleKeyboard(),
      resize_keyboard: true
    };
  }

  if (question.type === "satisfaction_1_5") {
    options.reply_markup = {
      keyboard: getSatisfactionKeyboard(),
      resize_keyboard: true
    };
  }

  await bot.sendMessage(session.chatId, question.prompt, options);
}

function parseScaleAnswer(text, min, max) {
  const match = text.match(/\d+/);
  if (!match) return null;

  const value = Number(match[0]);
  if (value < min || value > max) return null;

  return value;
}

function validateAnswer(question, text) {
  if (question.type === "choice") {
    if (!question.options.includes(text)) return { valid: false };
    return { valid: true, value: text };
  }

  if (question.type === "scale_1_10") {
    const value = parseScaleAnswer(text, 1, 10);
    return value ? { valid: true, value } : { valid: false };
  }

  if (question.type === "satisfaction_1_5") {
    const value = parseScaleAnswer(text, 1, 5);
    return value ? { valid: true, value } : { valid: false };
  }

  return { valid: true, value: text.trim() };
}

async function saveAnswer(session, text) {
  const question = session.flow[session.index];

  const parsed = validateAnswer(question, text);
  if (!parsed.valid) {
    return bot.sendMessage(session.chatId, "Invalid answer, please try again 😊");
  }

  session.answers[question.field] = parsed.value;
  session.index += 1;

  return askCurrentQuestion(session);
}

async function submitSurvey(session) {
  if (session.isSubmitting) return;
  session.isSubmitting = true;

  let referenceCode;

  if (
    session.answers.has_existing_nams_code === "Yes" &&
    session.answers.existing_nams_code
  ) {
    referenceCode = session.answers.existing_nams_code;
  } else {
    referenceCode = createReferenceCode(session.answers.lc || "NAMS");
  }

  const payload = {
    ...session.answers,
    reference_code: referenceCode,
    submitted_at: toIsoTimestamp(new Date()),
    started_at: toIsoTimestamp(session.startedAt)
  };

  try {
    await appendSurveyResponse(payload);

    const thankYou = [
      "Thank you 💙",
      "",
      "Your responses were recorded ✨"
    ];

    if (session.answers.has_existing_nams_code !== "Yes") {
      thankYou.push("", `Your reference code: ${referenceCode}`);
    }

    await bot.sendMessage(session.chatId, thankYou.join("\n"), {
      reply_markup: removeKeyboard()
    });

    clearSession(session.userId);
  } catch (err) {
    console.error(err);

    await bot.sendMessage(
      session.chatId,
      "Error saving response. Please try again later 🥺",
      { reply_markup: removeKeyboard() }
    );

    session.isSubmitting = false;
  }
}

bot.onText(/\/start|\/survey/, async (msg) => {
  const session = createSession(msg);

  session.flow = buildSurveyFlow();
  setSession(msg.from.id, session);

  await sendWelcome(msg.chat.id);
  await askCurrentQuestion(session);
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const session = getSession(msg.from.id);
  if (!session) {
    return bot.sendMessage(msg.chat.id, "Send /start to begin 😊");
  }

  const text = msg.text.trim();

  const currentQuestion = session.flow[session.index];
  if (!currentQuestion) return submitSurvey(session);

  await saveAnswer(session, text);
});

console.log("NAMS bot is ready.");
