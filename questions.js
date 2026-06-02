const { getLcQuestions, getAllLcQuestionFields } = require("./lcQuestions");

const LC_OPTIONS = ["ADMU", "CSB", "DLSU", "MC", "UPC", "UPD", "UPLB", "UPM", "UST", "Other"];
const ROLE_OPTIONS = ["Member", "TL", "EB", "LCP"];

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

const MOTIVATION_OPTIONS = ["Impact", "Community", "Personal Growth and Development", "Other"];

const EXCHANGE_PROGRAM_OPTIONS = ["GV", "GTa", "GTe"];

/* ---------------- BASE BLOCK (NO DEMOGRAPHIC LOGIC HERE ANYMORE) ---------------- */

function baseQuestions() {
  return [
    {
      field: "why_stayed_in_aiesec",
      type: "text",
      prompt: "What has made you stay in AIESEC so far? 🌱"
    },
    {
      field: "local_community_relevance",
      type: "scale_1_10",
      prompt: "How relevant is AIESEC to your local community? 🌍"
    },
    {
      field: "connected_to_exchange_mission_score",
      type: "scale_1_10",
      prompt: "How connected do you feel to AIESEC's exchange mission? ✈️"
    },
    {
      field: "preferred_exchange_program",
      type: "choice",
      options: EXCHANGE_PROGRAM_OPTIONS,
      prompt: "If you were to go on exchange, which program feels most appealing? 🌏"
    }
  ];
}

/* ---------------- INTRO LOGIC (THIS IS THE FIX) ---------------- */

function introBlock() {
  return [
    {
      field: "has_existing_nams_code",
      type: "choice",
      options: ["Yes", "No"],
      prompt: "Do you already have a NAMS reference code? 🏷️"
    }
  ];
}

function codeBlock() {
  return [
    {
      field: "existing_nams_code",
      type: "text",
      prompt: "Please enter your existing NAMS reference code ✨"
    }
  ];
}

/* ---------------- DEMOGRAPHICS (ONLY IF NO CODE) ---------------- */

function demographicBlock() {
  return [
    {
      field: "full_name",
      type: "text",
      prompt: "Let's start with the basics ✨ What full name (Last Name, First Name) should we record?"
    },
    {
      field: "lc",
      type: "choice",
      options: LC_OPTIONS,
      prompt: "Which LC should I tag your response under? 💙",
      allowOther: true,
      detailField: "lc_other",
      selectionField: "lc_selection",
      otherPrompt: "Got it! Which LC should I record?"
    },
    {
      field: "role",
      type: "choice",
      options: ROLE_OPTIONS,
      prompt: "Which role best fits you right now? 🌟"
    },
    {
      field: "program_area_of_study",
      type: "choice",
      options: PROGRAM_OPTIONS,
      prompt: "What program or area of study are you in? 🎓",
      allowOther: true,
      detailField: "program_area_of_study_other",
      selectionField: "program_area_of_study_selection",
      otherPrompt: "What program should I record for you? ✍️"
    },
    {
      field: "graduation_year",
      type: "year",
      prompt: "What year are you graduating? 🎉"
    },
    {
      field: "found_out_about_aiesec",
      type: "choice",
      options: DISCOVERY_OPTIONS,
      prompt: "How did you first hear about AIESEC? 👂",
      allowOther: true,
      detailField: "found_out_about_aiesec_other",
      selectionField: "found_out_about_aiesec_selection",
      otherPrompt: "Tell me how you first heard about AIESEC 😊"
    }
  ];
}

/* ---------------- LEADERSHIP BLOCK ---------------- */

function getLeaderQuestions(role) {
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
        prompt: "What is your leader doing well / can improve? 💬"
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
        prompt: "What is your LCVP doing well / can improve? 💬"
      }
    ];
  }

  if (role === "EB") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your LCP? 😊"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your LCP doing well / can improve? 💬"
      },
      {
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your MCVP? 🌟"
      },
      {
        field: "leader_feedback_secondary",
        type: "text",
        prompt: "What is your MCVP doing well / can improve? 💬"
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
        prompt: "What is your coach doing well / can improve? 💬"
      }
    ];
  }

  return [];
}

/* ---------------- CLOSING BLOCK ---------------- */

function closingQuestions() {
  return [
    {
      field: "summer_nc_attendance_likelihood",
      type: "scale_1_10",
      prompt:
        "Summer National Conference (July 31–Aug 2). How likely are you to attend? 🌞"
    },
    {
      field: "summer_nc_non_attendance_reason",
      type: "text",
      prompt: "If unable to attend, what are the reasons? 💭"
    },
    {
      field: "exchange_objections",
      type: "multi_choice",
      options: ["Price", "Academics", "Family", "Others"],
      allowOther: true,
      detailField: "exchange_objections_other",
      selectionField: "exchange_objections_selection",
      prompt: "What stops people from going on exchange? ✈️"
    },
    {
      field: "exchange_accessibility_suggestions",
      type: "text",
      prompt: "How can we make exchange more accessible? 💡"
    },
    {
      field: "final_message",
      type: "text",
      prompt: "Anything else you'd like to share? 🤍"
    }
  ];
}

/* ---------------- MAIN FLOW (THIS IS NOW FIXED PROPERLY) ---------------- */

function buildSurveyFlow(context = {}) {
  const hasCode = context.has_existing_nams_code === "Yes";

  const lcQuestions = getLcQuestions(context.lc);

  const flow = [
    ...introBlock(),
    ...(hasCode ? codeBlock() : demographicBlock()),
    ...baseQuestions(),
    ...getLeaderQuestions(context.role),
    ...(lcQuestions.length > 0
      ? [
          {
            type: "message",
            prompt: "Now some LC-specific questions 💙"
          }
        ]
      : []),
    ...lcQuestions,
    ...closingQuestions()
  ];

  return flow.map((q) => ({
    allowOther: false,
    prompt: "",
    ...q
  }));
}

/* ---------------- KEYBOARD HELPERS ---------------- */

function buildKeyboardRows(options, rowSize) {
  const rows = [];
  for (let i = 0; i < options.length; i += rowSize) {
    rows.push(options.slice(i, i + rowSize));
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

/* ---------------- FIELD MAPPING ---------------- */

function getAllQuestionFields() {
  const base = buildSurveyFlow();
  const eb = buildSurveyFlow({ role: "EB" });
  const lcp = buildSurveyFlow({ role: "LCP" });
  const member = buildSurveyFlow({ role: "Member" });
  const tl = buildSurveyFlow({ role: "TL" });

  const fields = new Set();

  [base, eb, lcp, member, tl].forEach(flow => {
    flow.forEach(q => {
      fields.add(q.field);
      if (q.selectionField) fields.add(q.selectionField);
      if (q.detailField) fields.add(q.detailField);
    });
  });

  getAllLcQuestionFields().forEach(f => fields.add(f));

  return Array.from(fields);
}

module.exports = {
  buildSurveyFlow,
  getChoiceKeyboard,
  getScaleKeyboard,
  getSatisfactionKeyboard,
  getAllQuestionFields
};
