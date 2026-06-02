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
  return {
    remove_keyboard: true
  };
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
    "Your responses help us understand your experience better and add more context to what comes up in your MXS Check-In.",
    "",
    "The more open you are, the easier it is for us to create better spaces, stronger support, and more meaningful experiences for members across the network ✨",
    "",
    "This should only take a few minutes, and we'll go one question at a time 🌼"
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
    await askCurrentQuestion(session);
    return;
  }

  const options = { reply_markup: removeKeyboard() };

  if (question.type === "choice") {
    options.reply_markup = {
      keyboard: getChoiceKeyboard(question.options),
      one_time_keyboard: true,
      resize_keyboard: true
    };
  }

  if (question.type === "multi_choice") {
    const doneLabel = question.doneLabel || "Done";
    options.reply_markup = {
      keyboard: [...getChoiceKeyboard(question.options), [doneLabel]],
      resize_keyboard: true
    };
  }

  if (question.type === "scale_1_10") {
    options.reply_markup = {
      keyboard: getScaleKeyboard(),
      one_time_keyboard: true,
      resize_keyboard: true
    };
  }

  if (question.type === "satisfaction_1_5") {
    options.reply_markup = {
      keyboard: getSatisfactionKeyboard(),
      one_time_keyboard: true,
      resize_keyboard: true
    };
  }

  await bot.sendMessage(session.chatId, question.prompt, options);
}

function parseScaleAnswer(text, min, max) {
  const match = text.match(/\d+/);

  if (!match) {
    return null;
  }

  const value = Number(match[0]);

  if (value < min || value > max) {
    return null;
  }

  return value;
}

function buildReplyError(question) {
  if (question.type === "choice") {
    return "Please choose one of the options on the keyboard so I can log it properly 😊";
  }

  if (question.type === "multi_choice") {
    return "Please choose from the options shown, then tap Done when you're finished 😊";
  }

  if (question.type === "scale_1_10") {
    return "Please reply with a number from 1 to 10 😊";
  }

  if (question.type === "satisfaction_1_5") {
    return "Please choose a score from 1 to 5 using the options shown 😊";
  }

  if (question.type === "year") {
    return "Please enter your graduation year in YYYY format, like 2026 ✨";
  }

  return "Could you send that one more time in a short text reply? 💌";
}

async function handleOtherFollowUp(session, text) {
  const question = session.pendingOtherQuestion;

  if (!question) {
    return false;
  }

  session.answers[question.detailField] = text;
  session.answers[question.field] = text;
  session.pendingOtherQuestion = null;
  session.index += 1;

  await askCurrentQuestion(session);
  return true;
}

function validateAnswer(question, text) {
  if (question.type === "choice") {
    if (!question.options.includes(text)) {
      return { valid: false };
    }

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

  if (question.type === "year") {
    const cleaned = text.trim();
    if (!/^\d{4}$/.test(cleaned)) {
      return { valid: false };
    }

    return { valid: true, value: cleaned };
  }

  return { valid: true, value: text.trim() };
}

async function saveAnswer(session, text) {
  const question = session.flow[session.index];

  if (question.type === "multi_choice") {
    const doneLabel = question.doneLabel || "Done";
    const selectedValues = session.multiChoiceSelections[question.field] || [];

    if (text === doneLabel) {
      if (selectedValues.length === 0) {
        await bot.sendMessage(
          session.chatId,
          "Please choose at least one option before tapping Done 😊"
        );
        return;
      }

      session.answers[question.field] = selectedValues.join(", ");
      delete session.multiChoiceSelections[question.field];
      session.index += 1;
      await askCurrentQuestion(session);
      return;
    }

    if (!question.options.includes(text)) {
      await bot.sendMessage(session.chatId, buildReplyError(question));
      return;
    }

    let nextSelections;
    const noneOption = question.noneExclusiveOption || "None of the above";

    if (text === noneOption) {
      nextSelections = [noneOption];
    } else {
      nextSelections = selectedValues.filter((value) => value !== noneOption);

      if (nextSelections.includes(text)) {
        nextSelections = nextSelections.filter((value) => value !== text);
      } else {
        nextSelections.push(text);
      }
    }

    session.multiChoiceSelections[question.field] = nextSelections;

    const selectionText = nextSelections.length > 0 ? nextSelections.join(", ") : "nothing yet";
    await bot.sendMessage(
      session.chatId,
      `Current selection: ${selectionText} ✨\nTap more options or tap ${doneLabel} when you're finished 😊`
    );
    return;
  }

  const parsed = validateAnswer(question, text);

  if (!parsed.valid) {
    await bot.sendMessage(session.chatId, buildReplyError(question));
    return;
  }

  if (question.type === "choice" && question.allowOther && parsed.value === "Other") {
    session.answers[question.selectionField || `${question.field}_selection`] = "Other";
    session.pendingOtherQuestion = question;

    await bot.sendMessage(session.chatId, question.otherPrompt, {
      reply_markup: removeKeyboard()
    });
    return;
  }

  if (question.type === "choice" && question.selectionField) {
    session.answers[question.selectionField] = parsed.value;
  }

  session.answers[question.field] = parsed.value;
  session.index += 1;
  await askCurrentQuestion(session);
}

async function submitSurvey(session) {
  if (session.isSubmitting) {
    return;
  }

  session.isSubmitting = true;

  let referenceCode;

if (
  session.answers.has_existing_nams_code === "Yes" &&
  session.answers.existing_nams_code
) {
  referenceCode =
    session.answers.existing_nams_code;
} else {
  referenceCode = createReferenceCode(
    session.answers.lc || "NAMS"
  );
}

  const payload = {
    ...session.answers,
    reference_code: referenceCode,
    submitted_at: toIsoTimestamp(new Date()),
    started_at: toIsoTimestamp(session.startedAt)
  };

  try {
    await appendSurveyResponse(payload);

    const generatedNewCode =
  session.answers.has_existing_nams_code !==
  "Yes";

const thankYouMessage = [
  "Thank you so much for sharing all of that 💙",
  "",
  "Your responses have been recorded and will really help us shape better member experiences ✨"
];

if (generatedNewCode) {
  thankYouMessage.push(
    "",
    `Your reference code is: ${referenceCode} 🏷️`,
    "",
    "Please keep that code somewhere safe so you can submit this response with your MXS bot response to be recorded 😊"
  );
}

await bot.sendMessage(
  session.chatId,
  thankYouMessage.join("\n"),
  { reply_markup: removeKeyboard() }
);

clearSession(session.userId);

    session.isSubmitting = false;
  }
}

bot.onText(/\/start|\/survey/, async (msg) => {
  const session = createSession(msg);
  const flow = buildSurveyFlow();

  session.flow = flow;
  setSession(msg.from.id, session);

  await sendWelcome(msg.chat.id);
  await askCurrentQuestion(session);
});

bot.onText(/\/reset/, async (msg) => {
  clearSession(msg.from.id);

  await bot.sendMessage(
    msg.chat.id,
    "Your current session has been cleared 🌼 Send /start whenever you're ready to begin again.",
    { reply_markup: removeKeyboard() }
  );
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) {
    return;
  }

  const session = getSession(msg.from.id);

  if (!session) {
    await bot.sendMessage(
      msg.chat.id,
      "Send /start whenever you're ready, and I'll walk you through the survey from the top 😊"
    );
    return;
  }

  const text = msg.text.trim();

  if (session.pendingOtherQuestion) {
    await handleOtherFollowUp(session, text);
    return;
  }

  const currentQuestion = session.flow[session.index];

  if (!currentQuestion) {
    await submitSurvey(session);
    return;
  }

  const previousRole = session.answers.role;
const previousLc = session.answers.lc;
const previousCode = session.answers.has_existing_nams_code;

await saveAnswer(session, text);

const roleChanged =
  currentQuestion.field === "role" &&
  previousRole !== session.answers.role;

const lcChanged =
  currentQuestion.field === "lc" &&
  previousLc !== session.answers.lc;

const hasCodeChanged =
  currentQuestion.field === "has_existing_nams_code" &&
  previousCode !== session.answers.has_existing_nams_code;

if (roleChanged || lcChanged || hasCodeChanged) {
  session.flow = buildSurveyFlow({
    has_existing_nams_code: session.answers.has_existing_nams_code,
    existing_nams_code: session.answers.existing_nams_code,
    lc: session.answers.lc,
    role: session.answers.role
  });

  const currentField = currentQuestion.field;
  session.index =
    session.flow.findIndex((q) => q.field === currentField) + 1;
}

if (roleChanged || lcChanged || hasCodeChanged) {
  session.flow = buildSurveyFlow({
    has_existing_nams_code: session.answers.has_existing_nams_code,
    existing_nams_code: session.answers.existing_nams_code,
    lc: session.answers.lc,
    role: session.answers.role
  });

  const currentField = currentQuestion.field;
  session.index =
    session.flow.findIndex((q) => q.field === currentField) + 1;
}

    const currentField = currentQuestion.field;
    session.index = session.flow.findIndex((question) => question.field === currentField) + 1;
  }
});

console.log("NAMS bot is ready.");
