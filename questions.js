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

const EXCHANGE_PROGRAM_OPTIONS = ["GV", "GTa", "GTe"];

/* ---------------- INTRO FLOW ---------------- */

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

function existingCodeQuestion() {
  return [
    {
      field: "existing_nams_code",
      type: "text",
      prompt: "Please enter your existing NAMS reference code ✨"
    }
  ];
}

/* ---------------- DEMOGRAPHICS ---------------- */

function demographicQuestions() {
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
      otherPrompt: "Which LC should I record?"
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
      otherPrompt: "What program should I record for you?"
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
      otherPrompt: "Tell me how you heard about AIESEC 😊"
    }
  ];
}

/* ---------------- MAIN SURVEY ---------------- */

function mainQuestions() {
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
      prompt: "Which exchange program interests you most? 🌏"
    }
  ];
}

/* ---------------- LEADERSHIP ---------------- */

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

/* ---------------- CLOSING ---------------- */

function closingQuestions(hasCode) {
  const base = [
    {
      field: "summer_nc_attendance_likelihood",
      type: "scale_1_10",
      prompt: "How likely are you to attend Summer National Conference? 🌞"
    },
    {
      field: "summer_nc_non_attendance_reason",
      type: "text",
      prompt: "If not attending, what are the reasons? 💭"
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

  // ONLY give code if NO existing code
  if (!hasCode) {
    base.push({
      field: "generated_nams_code",
      type: "text",
      prompt: "Your NAMS reference code will be generated at the end ✨"
    });
  }

  return base;
}

/* ---------------- MAIN FLOW ENGINE ---------------- */

function buildSurveyFlow(context = {}) {
  const hasCode = context.has_existing_nams_code === "Yes";

  const flow = [
    ...introQuestions(),

    ...(hasCode ? existingCodeQuestion() : demographicQuestions()),

    ...mainQuestions(),

    ...getLeaderQuestions(context.role),

    {
      type: "message",
      prompt: "Now some final questions 💙"
    },

    ...(getLcQuestions(context.lc) || []),

    ...closingQuestions(hasCode)
  ];

  return flow.map(q => ({
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
  return [["1","2","3","4","5"],["6","7","8","9","10"]];
}

function getSatisfactionKeyboard() {
  return [["1","2","3","4","5"]];
}

/* ---------------- FIELD EXPORT ---------------- */

function getAllQuestionFields() {
  const flows = [
    buildSurveyFlow({}),
    buildSurveyFlow({ role: "Member" }),
    buildSurveyFlow({ role: "TL" }),
    buildSurveyFlow({ role: "EB" }),
    buildSurveyFlow({ role: "LCP" })
  ];

  const fields = new Set();

  flows.forEach(flow => {
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
