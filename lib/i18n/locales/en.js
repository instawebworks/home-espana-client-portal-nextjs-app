// English — the source dictionary. Every other locale mirrors these keys.
//
// Copy conventions:
//  - `**bold**` inside a string is rendered as <strong> by <Rich />.
//  - Values that vary with a number/name are functions, never string concatenation
//    at the call site — sentence order differs per language.

const en = {
  code: "en",
  // BCP-47 tag used for Intl date/number formatting.
  intl: "en-GB",

  brand: {
    portalName: "Hipoteken Document Portal",
  },

  common: {
    back: "Back",
    cancel: "Cancel",
    view: "View",
    save: "Save",
    genericError: "Something went wrong. Please try again.",
    networkError: "Connection problem. Please try again.",
  },

  login: {
    subtitle: "Sign in to view your documents",
    password: "Password",
    togglePassword: "Show or hide password",
    submit: "Sign In",
  },

  applicants: {
    subtitle: "First, tell us who is applying",
    countHeading: "How many applicants?",
    countHelp: "How many people are applying together on this application?",
    namesHeading: (n) => (n === 1 ? "Applicant name" : "Applicant names"),
    namesHelp: (n) =>
      n === 1
        ? "Please give us the applicant's full name, as it appears on their ID."
        : `Please give us the full name of all ${n} applicants, as it appears on their ID.`,
    nameLabel: (i) => `Applicant ${i} — full name`,
    missingNames: "Please fill in every applicant's name.",
    submit: "Continue to the portal",
  },

  changePassword: {
    title: "Change password",
    current: "Current password",
    new: "New password",
    confirm: "Confirm new password",
    criteria: {
      length: "At least 12 characters",
      upper: "An uppercase letter",
      lower: "A lowercase letter",
      number: "A number",
      special: (chars) => `A special character (${chars})`,
    },
    sameAsOld: "Please choose a password you haven't used before.",
    mismatch: "These two passwords don't match.",
    submit: "Save new password",
    failed: "We couldn't change your password. Please try again.",
  },

  portal: {
    tagline: "Upload and review the documents we need from you",
    changePassword: "Change password",
    welcome: (name) => `Welcome, ${name}!`,

    tabs: {
      instructions: "How it works",
      applicationForm: "Application form",
      // English forms a possessive; other languages restructure the phrase.
      applicant: (first) => `${first}'s documents`,
      messages: "Messages",
    },

    submit: {
      label: "Submit documents",
      busy: "Sending…",
      noFiles: "Please choose at least one file before sending.",
      ok: "Thanks — your documents are on their way to us.",
      failed: "We couldn't send your documents. Please try again.",
      uploadFailed: "Your files didn't upload. Please try again.",
    },
  },

  applicationForm: {
    greeting: (name) => `Hi ${name},`,
    // Used when the CRM record has no usable client name.
    greetingNoName: "Hi there,",
    intro:
      "Before we take your application to the banks, we need to check that your details are exactly right. Just **download the form below**, fill it in and send it back to us.",
    option1Title: "Download, fill in and return the form",

    step1Title: "Download the form",
    step1Body:
      "Open the form and fill in your details. You can complete it on your computer, or print it and write it in by hand.",
    step1Button: "Download the form",
    downloadFileName: "Hipoteken Application Form.pdf",

    step2Title: "Send us the completed form",
    step2Body:
      "Once it's filled in, upload the finished form (as a PDF) right here.",
    received: (n) => (n === 1 ? "Form received" : "Forms received"),
    chooseFile: (hasFile) =>
      hasFile ? "Choose a different file" : "Choose your completed form",
    uploadButton: "Upload the form",
    uploading: "Uploading…",
    uploadOk: "Got it — thanks for sending your form through.",
    uploadFail: "That upload didn't work. Please try again.",
  },

  instructions: {
    overline: "Getting around the portal",

    nav: {
      title: "Finding your way",
      body: "Each applicant has their own tab — **John's documents**, **Ana's documents**, and so on. Open the tab for whoever the document belongs to, then click any row to see exactly what we need.",
    },

    status: {
      title: "What the labels mean",
      notSubmitted: "**NOT SUBMITTED** — we haven't received this one yet.",
      pending: "**PENDING** — it's with us and we're checking it.",
      approved: "**APPROVED** — all good, there's nothing more to do here.",
      rejected:
        "**REJECTED** — have a look at our note, then send us a new copy.",
    },

    uploading: {
      title: "Sending us a document",
      step1: "Open the tab for the applicant the document belongs to.",
      step2: "Click the document row to open it.",
      step3: "Choose your file — front and back separately, where we ask for both.",
      step4: "When everything you want to send is attached, click **Submit documents** at the bottom.",
      note: "You can prepare documents for several applicants at once — nothing is lost when you switch between tabs.",
    },

    reference: {
      title: "Examples from our team",
      body: "Where we've shared an example or a reference file, you'll find it in the amber box inside that document. You can open it or save a copy.",
    },

    messages: {
      title: "Talking to us",
      body: "Got a question about a document, or about your application in general? Use the **Messages** tab — we'll answer you right there.",
    },

    security: {
      title: "Password and security",
      body: "You can update your password any time using **Change password** at the top. To keep your documents safe, we'll sign you out after 30 minutes of inactivity — just sign back in to carry on.",
    },
  },

  document: {
    uploadedFiles: "Files you've sent",
    adminComment: "Note from our team",
    dropzone: "Drag files here, or **click to browse**",
    fileTypeWarning: (types, rejected) =>
      `Only ${types} files can be used here. Not added: ${rejected}`,
    approvedSuffix: " — approved",
  },

  adminUploads: {
    title: "Reference documents from our team",
    count: (n) => (n === 1 ? "1 file" : `${n} files`),
  },

  messages: {
    empty: "No messages yet. Ask us anything — we're here to help.",
    placeholder: "Write a message…",
    you: "You",
    admin: "Hipoteken",
    todayAt: (time) => `Today at ${time}`,
    dateAt: (date, time) => `${date} at ${time}`,
  },

  // Derived in the portal from the upload/approval state.
  status: {
    "NOT SUBMITTED": "NOT SUBMITTED",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  },

  // Values that arrive verbatim from the CRM subform.
  approval: {
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
  },

  // `scanType` from the template JSON, shown as a heading above each upload zone.
  scan: {
    Front: "Front",
    Back: "Back",
  },

  // `requirement` from the template JSON.
  requirement: {
    Required: "Required",
    Optional: "If applicable",
  },

  // Keyed by the `code` returned by our API routes, so server messages localise too.
  errors: {
    MISSING_FIELDS: "Some details are missing. Please try again.",
    TEMPLATE_NOT_FOUND: "We couldn't load this portal. Please contact us.",
    TEMPLATE_CONFIG: "We couldn't load this portal. Please contact us.",
    RECORD_NOT_FOUND: "We couldn't find your application. Please contact us.",
    NO_PASSWORD: "This portal has no password set yet. Please contact us.",
    INVALID_PASSWORD: "That password isn't right. Please try again.",
    INVALID_OLD_PASSWORD: "That's not your current password.",
    SERVER_ERROR: "Something went wrong at our end. Please try again.",
  },
};

export default en;
