// German — formal register (Sie), the standard for German mortgage providers.
// Uses "Unterlagen" for the document set, as German lenders do, and
// "Vorderseite/Rückseite" for two-sided ID scans.

const de = {
  code: "de",
  intl: "de-DE",

  brand: {
    portalName: "Hipoteken Dokumentenportal",
  },

  common: {
    back: "Zurück",
    cancel: "Abbrechen",
    view: "Ansehen",
    save: "Speichern",
    genericError: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    networkError: "Verbindungsproblem. Bitte versuchen Sie es erneut.",
  },

  login: {
    subtitle: "Melden Sie sich an, um Ihre Unterlagen zu sehen",
    password: "Passwort",
    togglePassword: "Passwort ein- oder ausblenden",
    submit: "Anmelden",
  },

  applicants: {
    subtitle: "Zuerst: Wer stellt den Antrag?",
    countHeading: "Wie viele Antragsteller?",
    countHelp: "Wie viele Personen stellen diesen Antrag gemeinsam?",
    namesHeading: (n) =>
      n === 1 ? "Name des Antragstellers" : "Namen der Antragsteller",
    namesHelp: (n) =>
      n === 1
        ? "Bitte geben Sie den vollständigen Namen an, genau wie im Ausweis."
        : `Bitte geben Sie die vollständigen Namen aller ${n} Antragsteller an, genau wie im Ausweis.`,
    nameLabel: (i) => `Antragsteller ${i} — vollständiger Name`,
    missingNames: "Bitte tragen Sie alle Namen ein.",
    submit: "Weiter zum Portal",
  },

  changePassword: {
    title: "Passwort ändern",
    current: "Aktuelles Passwort",
    new: "Neues Passwort",
    confirm: "Neues Passwort bestätigen",
    criteria: {
      length: "Mindestens 12 Zeichen",
      upper: "Ein Großbuchstabe",
      lower: "Ein Kleinbuchstabe",
      number: "Eine Ziffer",
      special: (chars) => `Ein Sonderzeichen (${chars})`,
    },
    sameAsOld: "Bitte wählen Sie ein Passwort, das Sie noch nicht verwendet haben.",
    mismatch: "Die beiden Passwörter stimmen nicht überein.",
    submit: "Neues Passwort speichern",
    failed:
      "Ihr Passwort konnte nicht geändert werden. Bitte versuchen Sie es erneut.",
  },

  portal: {
    tagline: "Laden Sie hier die benötigten Unterlagen hoch",
    changePassword: "Passwort ändern",
    welcome: (name) => `Willkommen, ${name}!`,

    tabs: {
      instructions: "So funktioniert es",
      applicationForm: "Antragsformular",
      applicant: (first) => `Unterlagen von ${first}`,
      messages: "Nachrichten",
    },

    submit: {
      label: "Unterlagen senden",
      busy: "Wird gesendet…",
      noFiles: "Bitte wählen Sie mindestens eine Datei aus.",
      ok: "Vielen Dank – Ihre Unterlagen sind bei uns eingegangen.",
      failed:
        "Ihre Unterlagen konnten nicht gesendet werden. Bitte versuchen Sie es erneut.",
      uploadFailed:
        "Ihre Dateien wurden nicht hochgeladen. Bitte versuchen Sie es erneut.",
    },
  },

  applicationForm: {
    greeting: (name) => `Hallo ${name},`,
    greetingNoName: "Hallo,",
    intro:
      "Bevor wir Ihren Antrag bei den Banken einreichen, prüfen wir, ob Ihre Angaben genau stimmen. **Laden Sie dazu einfach das Formular herunter**, füllen Sie es aus und senden Sie es uns zurück.",
    option1Title: "Formular herunterladen, ausfüllen und zurücksenden",

    step1Title: "Formular herunterladen",
    step1Body:
      "Öffnen Sie das Formular und tragen Sie Ihre Angaben ein. Sie können es am Computer ausfüllen oder ausdrucken und von Hand ausfüllen.",
    step1Button: "Formular herunterladen",
    downloadFileName: "Hipoteken Antragsformular.pdf",

    step2Title: "Ausgefülltes Formular senden",
    step2Body:
      "Sobald es ausgefüllt ist, laden Sie das fertige Formular hier als PDF hoch.",
    received: (n) => (n === 1 ? "Formular erhalten" : "Formulare erhalten"),
    chooseFile: (hasFile) =>
      hasFile ? "Andere Datei wählen" : "Ausgefülltes Formular wählen",
    uploadButton: "Formular hochladen",
    uploading: "Wird hochgeladen…",
    uploadOk: "Angekommen – vielen Dank für Ihr Formular.",
    uploadFail: "Der Upload hat nicht geklappt. Bitte versuchen Sie es erneut.",
  },

  instructions: {
    overline: "Wegweiser durch das Portal",

    nav: {
      title: "Wo Sie was finden",
      body: "Jeder Antragsteller hat einen eigenen Reiter – **Unterlagen von John**, **Unterlagen von Ana** und so weiter. Öffnen Sie den Reiter der Person, zu der das Dokument gehört, und klicken Sie auf eine Zeile, um zu sehen, was genau wir brauchen.",
    },

    status: {
      title: "Was die Kennzeichnungen bedeuten",
      notSubmitted:
        "**NICHT EINGEREICHT** — dieses Dokument haben wir noch nicht erhalten.",
      pending: "**IN PRÜFUNG** — es liegt uns vor und wir sehen es gerade durch.",
      approved: "**FREIGEGEBEN** — alles in Ordnung, hier ist nichts weiter zu tun.",
      rejected:
        "**ABGELEHNT** — bitte lesen Sie unseren Hinweis und senden Sie uns eine neue Kopie.",
    },

    uploading: {
      title: "So senden Sie uns ein Dokument",
      step1:
        "Öffnen Sie den Reiter des Antragstellers, zu dem das Dokument gehört.",
      step2: "Klicken Sie auf die Zeile des Dokuments, um sie zu öffnen.",
      step3:
        "Wählen Sie Ihre Datei aus – Vorder- und Rückseite getrennt, wenn wir beides brauchen.",
      step4:
        "Wenn alles angehängt ist, klicken Sie unten auf **Unterlagen senden**.",
      note: "Sie können Unterlagen für mehrere Antragsteller gleichzeitig vorbereiten – beim Wechseln der Reiter geht nichts verloren.",
    },

    reference: {
      title: "Beispiele von unserem Team",
      body: "Wenn wir ein Beispiel oder eine Vorlage hinterlegt haben, finden Sie sie im gelben Kasten innerhalb des Dokuments. Sie können sie öffnen oder speichern.",
    },

    messages: {
      title: "Kontakt zu uns",
      body: "Fragen zu einem Dokument oder zu Ihrem Antrag? Nutzen Sie den Reiter **Nachrichten** – wir antworten Ihnen direkt dort.",
    },

    security: {
      title: "Passwort und Sicherheit",
      body: "Ihr Passwort können Sie jederzeit oben über **Passwort ändern** anpassen. Zum Schutz Ihrer Unterlagen melden wir Sie nach 30 Minuten ohne Aktivität ab – melden Sie sich dann einfach neu an.",
    },
  },

  document: {
    uploadedFiles: "Ihre gesendeten Dateien",
    adminComment: "Hinweis von unserem Team",
    dropzone: "Dateien hierher ziehen oder **zum Auswählen klicken**",
    fileTypeWarning: (types, rejected) =>
      `Hier sind nur ${types}-Dateien möglich. Nicht hinzugefügt: ${rejected}`,
    approvedSuffix: " — freigegeben",
  },

  adminUploads: {
    title: "Referenzdokumente von unserem Team",
    count: (n) => (n === 1 ? "1 Datei" : `${n} Dateien`),
  },

  messages: {
    empty: "Noch keine Nachrichten. Fragen Sie uns gern alles – wir helfen Ihnen weiter.",
    placeholder: "Nachricht schreiben…",
    you: "Sie",
    admin: "Hipoteken",
    todayAt: (time) => `Heute um ${time}`,
    dateAt: (date, time) => `${date} um ${time}`,
  },

  status: {
    "NOT SUBMITTED": "NICHT EINGEREICHT",
    PENDING: "IN PRÜFUNG",
    APPROVED: "FREIGEGEBEN",
    REJECTED: "ABGELEHNT",
  },

  approval: {
    Pending: "In Prüfung",
    Approved: "Freigegeben",
    Rejected: "Abgelehnt",
  },

  scan: {
    Front: "Vorderseite",
    Back: "Rückseite",
  },

  requirement: {
    Required: "Erforderlich",
    Optional: "Falls zutreffend",
  },

  errors: {
    MISSING_FIELDS: "Es fehlen einige Angaben. Bitte versuchen Sie es erneut.",
    TEMPLATE_NOT_FOUND:
      "Das Portal konnte nicht geladen werden. Bitte kontaktieren Sie uns.",
    TEMPLATE_CONFIG:
      "Das Portal konnte nicht geladen werden. Bitte kontaktieren Sie uns.",
    RECORD_NOT_FOUND:
      "Wir konnten Ihren Antrag nicht finden. Bitte kontaktieren Sie uns.",
    NO_PASSWORD:
      "Für dieses Portal ist noch kein Passwort vergeben. Bitte kontaktieren Sie uns.",
    INVALID_PASSWORD: "Das Passwort ist nicht korrekt. Bitte versuchen Sie es erneut.",
    INVALID_OLD_PASSWORD: "Das ist nicht Ihr aktuelles Passwort.",
    SERVER_ERROR: "Bei uns ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
};

export default de;
