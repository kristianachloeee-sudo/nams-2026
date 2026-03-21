# NAMS Telegram Bot

This project runs a Telegram bot for the Feb/March National AIESEC Membership Survey and saves each completed response to Google Sheets.

## Files

- `bot.js`: Telegram bot entrypoint and conversation flow handler
- `questions.js`: Main survey questions and role-based branching
- `lcQuestions.js`: LC-specific question placeholders
- `sheets.js`: Google Sheets integration
- `utils.js`: Reference code and timestamp helpers

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in:

- `TELEGRAM_BOT_TOKEN`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

3. Share your Google Sheet with the service account email as an editor.

4. Start the bot:

```bash
npm start
```

## LC-specific questions

Open `lcQuestions.js` and add questions inside the matching LC array.

Example:

```js
ADMU: [
  {
    field: "admu_local_support",
    type: "text",
    prompt: "What is one thing ADMU can improve in supporting your experience locally?"
  }
]
```

Supported question types:

- `text`
- `choice`
- `year`
- `scale_1_10`
- `satisfaction_1_5`

For `choice` questions, you can also add:

- `allowOther: true`
- `detailField: "your_field_other"`
- `selectionField: "your_field_selection"`
- `otherPrompt: "Your follow-up question here"`
