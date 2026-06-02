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

function baseQuestions() {
  return [
    {
      field: "full_name",
      type: "text",
      prompt: "Let's start with the basics first ✨ What full name (Last Name, First Name) should we record for your response?"
    },
    {
      field: "lc",
      type: "choice",
      options: LC_OPTIONS,
      prompt: "Before we dive in, which LC should I tag your response under? 💙",
      allowOther: true,
      detailField: "lc_other",
      selectionField: "lc_selection",
      otherPrompt: "Got you! Which LC should I record for you? 😊"
    },
    {
      field: "role",
      type: "choice",
      options: ROLE_OPTIONS,
      prompt: "Which role best fits you right now? 🌟",
      allowOther: false
    },
    {
      field: "program_area_of_study",
      type: "choice",
      options: PROGRAM_OPTIONS,
      prompt: "What university program or area of study are you in? 🎓",
      allowOther: true,
      detailField: "program_area_of_study_other",
      selectionField: "program_area_of_study_selection",
      otherPrompt: "What program or area of study should I write down for you? ✍️"
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
      prompt: "How did you first hear about AIESEC? 👂",
      allowOther: true,
      detailField: "found_out_about_aiesec_other",
      selectionField: "found_out_about_aiesec_selection",
      otherPrompt: "Tell me how you first heard about AIESEC 😊"
    },
    {
      field: "why_joined_aiesec",
      type: "choice",
      options: MOTIVATION_OPTIONS,
      prompt: "What mainly made you join AIESEC in the first place? 💭",
      allowOther: true,
      detailField: "why_joined_aiesec_other",
      selectionField: "why_joined_aiesec_selection",
      otherPrompt: "What made you decide to join AIESEC? 💙"
    },
    {
      field: "why_stayed_in_aiesec",
      type: "choice",
      options: MOTIVATION_OPTIONS,
      prompt: "And what has made you stay in AIESEC so far? 🌱",
      allowOther: true,
      detailField: "why_stayed_in_aiesec_other",
      selectionField: "why_stayed_in_aiesec_selection",
      otherPrompt: "What has made you stay in AIESEC so far? 😊"
    },
    {
      field: "local_community_relevance",
      type: "scale_1_10",
      prompt: "On a scale of 1 to 10, how relevant do you think AIESEC is to your local community? 🌍"
    },
    {
      field: "recommend_aiesec_score",
      type: "scale_1_10",
      prompt: "On a scale of 1 to 10, how likely are you to recommend AIESEC as a leadership development organisation? 💬"
    },
    {
      field: "recommend_aiesec_reason",
      type: "text",
      prompt: "Could you share a bit more about why you gave that score? ✨"
    },
    {
      field: "connected_to_exchange_mission_score",
      type: "scale_1_10",
      prompt: "On a scale of 1 to 10, how connected do you feel to AIESEC's exchange mission, and how likely do you feel you are to go on exchange? ✈️"
    },
    {
      field: "preferred_exchange_program",
      type: "choice",
      options: EXCHANGE_PROGRAM_OPTIONS,
      prompt: "If you were to go on exchange, which program feels most appealing to you? 🌏"
    }
  ];
}

function getLeaderQuestions(role) {
  if (role === "Member") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your direct Team Leader, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your direct leader doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "TL") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your LCVP, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your direct leader doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "EB") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your LCP, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your direct leader doing well, and what could they improve on? 💬"
      },
      {
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your commission head? 🌟\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        field: "leader_feedback_secondary",
        type: "text",
        prompt: "What is your MCVP doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "LCP") {
    return [
      {
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your MC Coach, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your coach doing well, and what could they improve on? 💬"
      },
      {
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your commission head? 🌟\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        field: "leader_feedback_secondary",
        type: "text",
        prompt: "What is your MCP doing well, and what could they improve on? 💬"
      }
    ];
  }

  return [];
}

function closingQuestions() {
  return [
    {
      field: "national_initiatives_incentives",
      type: "text",
      prompt: "What would make you more excited or willing to take part in national initiatives? ✨"
    },
    {
      field: "icomm_campaign_feedback",
      type: "text",
      prompt: "What kinds of internal communications or campaigns would make you feel more seen, recognised, or included? 💌"
    },
    {
      field: "experience_improvement_suggestions",
      type: "text",
      prompt: "Any suggestions or feedback you'd like to share to help improve the member experience? 🌱"
    },
    {
      field: "final_message",
      type: "text",
      prompt: "Last one, promise 🤍 Is there anything else you'd like us to know before we wrap up?"
    },

    // ✅ NEW BLOCK (ADDED ONLY)

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
      field: "fearless_cup_awareness",
      type: "scale_1_10",
      prompt:
        "How famiiar are you with our Operational Sprint, The Fearless Cup?\n\nScale: 1 = I don't know what that is, 10 = I know what that is!"
    },
    {
      field: "fearless_cup_feedback",
      type: "scale_1_10",
      prompt:
        "How effective or ineffective are operational sprints and hackathons such as The Fearless Cup to influencing your drive to perform?\n\nScale: 1 = It doesn't affect me at all, 10 = It makes me super motivated!"
    },
    {
      field: "icomms_feedback",
      type: "text",
      prompt:
        "How can we make national operational sprints, such as the Cup, recognition spaces and ICOMMs more motivating for you to participate and perform your operations?"
    }
  ];
}

function buildSurveyFlow(context = {}) {
  const lcQuestions = getLcQuestions(context.lc);
  const lcIntro =
    lcQuestions.length > 0
      ? [
          {
            type: "message",
            prompt:
              "Thank you so much for answering the national questions so far 💙\n\nNow, here are a few questions from your LC so we can understand your local experience better too 😊"
          }
        ]
      : [];

  return [
    ...baseQuestions(),
    ...getLeaderQuestions(context.role),
    ...lcIntro,
    ...lcQuestions,
    ...closingQuestions()
  ].map((question) => ({
    allowOther: false,
    prompt: "",
    ...question
  }));
}

function buildKeyboardRows(options, rowSize) {
  const rows = [];

  for (let index = 0; index < options.length; index += rowSize) {
    rows.push(options.slice(index, index + rowSize));
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

function getAllQuestionFields() {
  const base = buildSurveyFlow();
  const ebFlow = buildSurveyFlow({ role: "EB" });
  const lcpFlow = buildSurveyFlow({ role: "LCP" });
  const memberFlow = buildSurveyFlow({ role: "Member" });
  const tlFlow = buildSurveyFlow({ role: "TL" });

  const fields = new Set();

  [base, ebFlow, lcpFlow, memberFlow, tlFlow].forEach((flow) => {
    flow.forEach((question) => {
      fields.add(question.field);

      if (question.selectionField) fields.add(question.selectionField);
      if (question.detailField) fields.add(question.detailField);
    });
  });

  getAllLcQuestionFields().forEach((field) => fields.add(field));

  return Array.from(fields);
}

module.exports = {
  buildSurveyFlow,
  getChoiceKeyboard,
  getScaleKeyboard,
  getSatisfactionKeyboard,
  getAllQuestionFields
};
