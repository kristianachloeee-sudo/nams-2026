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
      prompt: "What full name should we record? ✨"
    },
    {
      field: "lc",
      type: "choice",
      options: LC_OPTIONS,
      prompt: "Which LC should I tag this under? 💙",
      allowOther: true,
      detailField: "lc_other",
      selectionField: "lc_selection",
      otherPrompt: "Which LC should I record?"
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
      prompt: "What program are you in? 🎓",
      allowOther: true,
      detailField: "program_area_of_study_other",
      selectionField: "program_area_of_study_selection",
      otherPrompt: "What program should I record?"
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
      otherPrompt: "Tell me how you heard about AIESEC"
    }
  ];
}

/* ---------------- MAIN ---------------- */

function mainQuestions() {
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
      field: "connected_to_exchange_mission_score",
      type: "scale_1_10",
      prompt: "How connected do you feel to exchange? ✈️"
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
  if (!role) return [];

  const map = {
    Member: "Team Leader",
    TL: "LCVP",
    EB: "LCP",
    LCP: "MC Coach"
  };

  return [
    {
      field: "leader_satisfaction_primary",
      type: "satisfaction_1_5",
      prompt: `How satisfied are you with your ${map[role]}? 😊`
    },
    {
      field: "leader_feedback_primary",
      type: "text",
      prompt: "What is your leader doing well / improving on? 💬"
    }
  ];
}

/* ---------------- CLOSING ---------------- */

function closingQuestions(hasCode) {
  return [
    {
      field: "summer_nc_attendance_likelihood",
      type: "scale_1_10",
      prompt:
        "Our Summer National Conference will be happening from July 31–August 2 in Rizal (Friday–Sunday). How likely would you be able to attend? 🌞\n\nScale: 1 = Not attending, 10 = Will definitely be there"
    },
    {
      field: "summer_nc_non_attendance_reason",
      type: "text",
      prompt:
        "If you will be unable or are uninterested in attending, what are the top reasons for this? 💭\n\n(e.g. price, location, prior commitments, academic workload, etc.)"
    },
    {
      field: "exchange_objections",
      type: "multi_choice",
      options: ["Price", "Academics", "Family", "Others"],
      allowOther: true,
      detailField: "exchange_objections_other",
      selectionField: "exchange_objections_selection",
      prompt:
        "What are the biggest objections you have, or think others have, towards going on exchange? ✈️\n\nYou can select multiple."
    },
    {
      field: "exchange_accessibility_suggestions",
      type: "text",
      prompt:
        "What can we do nationally and locally to make exchange and our national initiatives more accessible and appealing to you? 💡\n\nPlease give concrete suggestions if possible (e.g. subsidies, clearer info sessions, alumni sharing, payment schemes, etc.)"
    },
    {
      field: "final_message",
      type: "text",
      prompt: "Anything else you'd like to share? 🤍"
    }
  ];
}

/* ---------------- FLOW ---------------- */

function buildSurveyFlow(context = {}) {
  const hasCode = context.has_existing_nams_code === "Yes";

  const flow = [
    ...introQuestions(),

    ...(hasCode
      ? existingCodeQuestion()
      : demographicQuestions()),

    ...mainQuestions(),

    {
      type: "message",
      prompt: "Now some final questions 💙"
    },

    ...closingQuestions(hasCode)
  ];

  return flow.map((q) => ({
    allowOther: false,
    prompt: "",
    ...q
  }));
}

/* ---------------- EXPORTS ---------------- */

module.exports = {
  buildSurveyFlow,
  getChoiceKeyboard: (opts) => opts,
  getScaleKeyboard: () => [["1","2","3","4","5"],["6","7","8","9","10"]],
  getSatisfactionKeyboard: () => [["1","2","3","4","5"]],
  getAllQuestionFields: () => []
};
