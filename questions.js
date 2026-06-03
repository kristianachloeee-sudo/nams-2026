const { getLcQuestions, getAllLcQuestionFields } = require("./lcQuestions");

/* ---------------- OPTIONS ---------------- */

const LC_OPTIONS = [
  "ADMU",
  "CSB",
  "DLSU",
  "MC",
  "UPC",
  "UPD",
  "UPLB",
  "UPM",
  "UST",
  "Other"
];

const ROLE_OPTIONS = ["Member", "TL", "EB", "LCP", "MCEB"];

const PROGRAM_OPTIONS = [
  "Business / Management",
  "Engineering",
  "Computer Science / IT",
  "Communication / Media",
  "Social Sciences",
  "Humanities / Arts",
  "Natural Sciences",
  "Health Sciences",
  "Education",
  "Law / Public Policy",
  "Other"
];

const JOIN_YEAR_OPTIONS = ["Before 2023", "2024", "2025"];

const DISCOVERY_OPTIONS = [
  "Friends / Family",
  "University Booth or Stall",
  "University Board",
  "Social Media",
  "Other"
];

const EXCHANGE_PROGRAM_OPTIONS = ["GV", "GTa", "GTe"];

/* ---------------- INTRO ---------------- */

function introQuestions() {
  return [
    {
      field: "has_existing_nams_code",
      type: "choice",
      options: ["Yes", "No"],
      prompt: "Do you already have a NAMS reference code? 🏷️"
    }
  ];
}

/* ---------------- EXISTING CODE PATH ---------------- */

function existingCodeQuestions() {
  return [
    {
      field: "existing_nams_code",
      type: "text",
      prompt: "Please enter your existing NAMS reference code ✨"
    }
  ];
}

/* ---------------- DEMOGRAPHICS (NO CODE USERS ONLY) ---------------- */

function demographicQuestions() {
  return [
    {
      field: "full_name",
      type: "text",
      prompt: "Let's start with the basics ✨ What full name should we record?"
    },
    {
      field: "lc",
      type: "choice",
      options: LC_OPTIONS,
      allowOther: true,
      detailField: "lc_other",
      selectionField: "lc_selection",
      prompt: "Which LC should I tag your response under? 💙"
    },
    {
      field: "role",
      type: "choice",
      options: ROLE_OPTIONS,
      prompt: "What is your current role? 🌟"
    },
    {
      field: "program_area_of_study",
      type: "choice",
      options: PROGRAM_OPTIONS,
      allowOther: true,
      detailField: "program_area_of_study_other",
      selectionField: "program_area_of_study_selection",
      prompt: "What program or area of study are you in? 🎓"
    },
    {
      field: "graduation_year",
      type: "year",
      prompt: "What year are you graduating? 🎉"
    },
    {
      field: "joined_aiesec",
      type: "choice",
      options: JOIN_YEAR_OPTIONS,
      prompt: "When did you join AIESEC? 👀"
    },
    {
      field: "found_out_about_aiesec",
      type: "choice",
      options: DISCOVERY_OPTIONS,
      allowOther: true,
      detailField: "found_out_about_aiesec_other",
      selectionField: "found_out_about_aiesec_selection",
      prompt: "How did you first hear about AIESEC? 👂"
    }
  ];
}

/* ---------------- NATIONAL QUESTIONS ---------------- */

function nationalQuestions() {
  return [
    {
      field: "why_stayed_in_aiesec",
      type: "text",
      prompt: "What has made you stay in AIESEC? 🌱"
    },
    {
      field: "local_community_relevance",
      type: "scale_1_10",
      prompt: "How relevant is AIESEC to your community? 🌍"
    },
    {
      field: "recommend_aiesec_score",
      type: "scale_1_10",
      prompt: "How likely are you to recommend AIESEC as a leadership organisation? 💬"
    },
    {
      field: "recommend_aiesec_reason",
      type: "text",
      prompt: "Could you share why you gave that score? ✨"
    },
    {
      field: "connected_to_exchange_mission_score",
      type: "scale_1_10",
      prompt: "How connected do you feel to exchange, and how likely are you to go? ✈️"
    },
    {
      field: "preferred_exchange_program",
      type: "choice",
      options: EXCHANGE_PROGRAM_OPTIONS,
      prompt: "Which exchange program interests you most? 🌏"
    }
  ];
}

/* ---------------- LEADER QUESTIONS ---------------- */

function getLeaderQuestions(role) {
  if (!role) return [];

  const isMCEB = role === "MCEB";

  if (role === "Member") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your Team Leader? 😊"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your Team Leader doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "TL") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your LCVP? 😊"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your LCVP doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "EB" || isMCEB) {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: isMCEB
          ? "How satisfied are you with your MCP? 😊"
          : "How satisfied are you with your LCP? 😊"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: isMCEB
          ? "What is your MCP doing well, and what could they improve on? 💬"
          : "What is your LCP doing well, and what could they improve on? 💬"
      },
      {
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: isMCEB
          ? "How satisfied are you with your AIVP? 🌟"
          : "How satisfied are you with your Commission Head? 🌟"
      },
      {
        field: "leader_feedback_secondary",
        type: "text",
        prompt: isMCEB
          ? "What is your AIVP doing well, and what could they improve on? 💬"
          : "What is your Commission Head doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "LCP") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your MC Coach? 😊"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your MC Coach doing well, and what could they improve on? 💬"
      },
      {
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your Commission Head? 🌟"
      },
      {
        field: "leader_feedback_secondary",
        type: "text",
        prompt: "What is your Commission Head doing well, and what could they improve on? 💬"
      }
    ];
  }

  return [];
}

/* ---------------- CLOSING QUESTIONS ---------------- */

function closingQuestions() {
  return [
    {
      field: "national_initiatives_incentives",
      type: "text",
      prompt: "What would make you more excited to join national initiatives? ✨"
    },
    {
      field: "icomm_campaign_feedback",
      type: "text",
      prompt: "What communications would make you feel more seen and included? 💌"
    },
    {
      field: "experience_improvement_suggestions",
      type: "text",
      prompt: "Any suggestions to improve member experience? 🌱"
    },
    {
      field: "final_message",
      type: "text",
      prompt: "Last one 🤍 Anything else you'd like to share?"
    }
  ];
}

/* ---------------- FLOW BUILDER ---------------- */

function buildSurveyFlow(context = {}) {
  const hasCode =
    String(context.has_existing_nams_code || "")
      .trim()
      .toLowerCase() === "yes";

  const lcQuestions = getLcQuestions(context.lc);

  const lcIntro =
    lcQuestions && lcQuestions.length > 0
      ? [
          {
            type: "message",
            prompt:
              "Now we’ll move to your LC-specific questions 💙"
          }
        ]
      : [];

  return [
    ...introQuestions(),

    ...(hasCode
      ? existingCodeQuestions()
      : demographicQuestions()),

    ...nationalQuestions(),

    ...getLeaderQuestions(context.role),

    ...lcIntro,

    ...(lcQuestions || []),

    ...closingQuestions()
  ].map((q) => ({
    allowOther: false,
    prompt: "",
    ...q
  }));
}

/* ---------------- KEYBOARD HELPERS ---------------- */

function buildKeyboardRows(options, size) {
  const rows = [];
  for (let i = 0; i < options.length; i += size) {
    rows.push(options.slice(i, i + size));
  }
  return rows;
}

function getChoiceKeyboard(options) {
  return buildKeyboardRows(options, 2);
}

function getScaleKeyboard() {
  return [["1", "2", "3", "4", "5"], ["6", "7", "8", "9", "10"]];
}

function getSatisfactionKeyboard() {
  return [["1", "2", "3", "4", "5"]];
}

/* ---------------- FIELD TRACKING ---------------- */

function getAllQuestionFields() {
  const flows = [
    buildSurveyFlow(),
    buildSurveyFlow({ role: "Member" }),
    buildSurveyFlow({ role: "TL" }),
    buildSurveyFlow({ role: "EB" }),
    buildSurveyFlow({ role: "LCP" }),
    buildSurveyFlow({ role: "MCEB" })
  ];

  const fields = new Set();

  flows.forEach((flow) => {
    flow.forEach((q) => {
      fields.add(q.field);
      if (q.selectionField) fields.add(q.selectionField);
      if (q.detailField) fields.add(q.detailField);
    });
  });

  getAllLcQuestionFields().forEach((f) => fields.add(f));

  return Array.from(fields);
}

module.exports = {
  buildSurveyFlow,
  getChoiceKeyboard,
  getScaleKeyboard,
  getSatisfactionKeyboard,
  getAllQuestionFields
};
