require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { appendSurveyResponse } = require("./sheets");
const { buildSurveyFlow } = require("./questions");
const { createReferenceCode, toIsoTimestamp } = require("./utils");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
polling: true
});

const sessions = new Map();

/* ---------------- SESSION HELPERS ---------------- */

function getSession(id) {
return sessions.get(id);
}

function setSession(id, session) {
sessions.set(id, session);
}

function clearSession(id) {
sessions.delete(id);
}

/* ---------------- SESSION INIT ---------------- */

function createSession(msg) {
return {
chatId: msg.chat.id,
userId: msg.from.id,
startedAt: new Date(),
answers: {
telegram_first_name: msg.from.first_name || "",
telegram_last_name: msg.from.last_name || "",
telegram_username: msg.from.username || "",
telegram_user_id: String(msg.from.id)
},
flow: buildSurveyFlow({}),
index: 0,
pendingOtherQuestion: null,
multiChoiceSelections: {},
isSubmitting: false
};
}

/* ---------------- FLOW NAVIGATION ---------------- */

async function askCurrentQuestion(session) {
const q = session.flow[session.index];

if (!q) return submit(session);

if (q.type === "message") {
await bot.sendMessage(session.chatId, q.prompt);
session.index++;
return askCurrentQuestion(session);
}

await bot.sendMessage(session.chatId, q.prompt);
}

/* ---------------- ANSWER HANDLING ---------------- */

async function handleAnswer(session, text) {
const q = session.flow[session.index];

if (!q) return submit(session);

session.answers[q.field] = text;
session.index++;

// rebuild flow when key branching answers are made
const shouldRebuild =
q.field === "has_existing_nams_code" ||
q.field === "lc" ||
q.field === "role";

if (shouldRebuild) {
session.flow = buildSurveyFlow(session.answers);

```
const nextIndex = session.flow.findIndex(
  (x) => x.field === q.field
);

session.index = nextIndex + 1;
```

}

return askCurrentQuestion(session);
}

/* ---------------- SUBMIT ---------------- */

async function submit(session) {
if (session.isSubmitting) return;
session.isSubmitting = true;

const referenceCode =
session.answers.has_existing_nams_code === "Yes"
? session.answers.existing_nams_code
: createReferenceCode(session.answers.lc || "NAMS");

const payload = {
...session.answers,
reference_code: referenceCode,
submitted_at: toIsoTimestamp(new Date()),
started_at: toIsoTimestamp(session.startedAt)
};

try {
await appendSurveyResponse(payload);

```
await bot.sendMessage(
  session.chatId,
  `Thank you 💙\n\nYour reference code is:\n${referenceCode}`
);

clearSession(session.userId);
```

} catch (err) {
console.error(err);

```
await bot.sendMessage(
  session.chatId,
  "Sorry — something went wrong saving your response. Please try again later 🥺"
);

session.isSubmitting = false;
```

}
}

/* ---------------- COMMANDS ---------------- */

bot.onText(//start/, async (msg) => {
const session = createSession(msg);

setSession(msg.from.id, session);

await askCurrentQuestion(session);
});

bot.onText(//reset/, async (msg) => {
clearSession(msg.from.id);

await bot.sendMessage(
msg.chat.id,
"Session reset 🌼 Send /start to begin again."
);
});

/* ---------------- MESSAGE HANDLER ---------------- */

bot.on("message", async (msg) => {
if (!msg.text || msg.text.startsWith("/")) return;

const session = getSession(msg.from.id);

if (!session) {
await bot.sendMessage(
msg.chat.id,
"Send /start to begin the survey 😊"
);
return;
}

const text = msg.text.trim();

if (session.pendingOtherQuestion) return;

await handleAnswer(session, text);
});

console.log("NAMS bot running...");
