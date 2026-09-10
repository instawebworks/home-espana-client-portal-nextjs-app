// Dutch — formal register (u), as used by Dutch mortgage advisers.
// Uses "aanleveren" for submitting paperwork and "afgekeurd"/"in behandeling"
// for document states, which is the wording Dutch mortgage portals actually use.

const nl = {
  code: "nl",
  intl: "nl-NL",

  brand: {
    portalName: "Hipoteken Documentenportaal",
  },

  common: {
    back: "Terug",
    cancel: "Annuleren",
    view: "Bekijken",
    save: "Opslaan",
    genericError: "Er ging iets mis. Probeert u het opnieuw.",
    networkError: "Verbindingsprobleem. Probeert u het opnieuw.",
  },

  login: {
    subtitle: "Log in om uw documenten te bekijken",
    password: "Wachtwoord",
    togglePassword: "Wachtwoord tonen of verbergen",
    submit: "Inloggen",
  },

  applicants: {
    subtitle: "Om te beginnen: wie vraagt de hypotheek aan?",
    countHeading: "Hoeveel aanvragers?",
    countHelp: "Met hoeveel personen vraagt u deze hypotheek samen aan?",
    namesHeading: (n) =>
      n === 1 ? "Naam van de aanvrager" : "Namen van de aanvragers",
    namesHelp: (n) =>
      n === 1
        ? "Vul de volledige naam in, precies zoals die op het identiteitsbewijs staat."
        : `Vul de volledige naam van alle ${n} aanvragers in, precies zoals die op het identiteitsbewijs staat.`,
    nameLabel: (i) => `Aanvrager ${i} — volledige naam`,
    missingNames: "Vul de naam van elke aanvrager in.",
    submit: "Verder naar het portaal",
  },

  changePassword: {
    title: "Wachtwoord wijzigen",
    current: "Huidig wachtwoord",
    new: "Nieuw wachtwoord",
    confirm: "Bevestig het nieuwe wachtwoord",
    criteria: {
      length: "Minimaal 12 tekens",
      upper: "Een hoofdletter",
      lower: "Een kleine letter",
      number: "Een cijfer",
      special: (chars) => `Een speciaal teken (${chars})`,
    },
    sameAsOld: "Kies een wachtwoord dat u nog niet eerder gebruikt heeft.",
    mismatch: "Deze twee wachtwoorden komen niet overeen.",
    submit: "Nieuw wachtwoord opslaan",
    failed: "We konden uw wachtwoord niet wijzigen. Probeert u het opnieuw.",
  },

  portal: {
    tagline: "Lever hier de documenten aan die wij nodig hebben",
    changePassword: "Wachtwoord wijzigen",
    welcome: (name) => `Welkom, ${name}!`,

    tabs: {
      instructions: "Zo werkt het",
      applicationForm: "Aanvraagformulier",
      applicant: (first) => `Documenten van ${first}`,
      messages: "Berichten",
    },

    submit: {
      label: "Documenten versturen",
      busy: "Bezig met versturen…",
      noFiles: "Kies eerst minstens één bestand.",
      ok: "Dank u wel — uw documenten zijn bij ons binnen.",
      failed: "We konden uw documenten niet versturen. Probeert u het opnieuw.",
      uploadFailed: "Uw bestanden zijn niet geüpload. Probeert u het opnieuw.",
    },
  },

  applicationForm: {
    greeting: (name) => `Hallo ${name},`,
    greetingNoName: "Hallo,",
    intro:
      "Voordat we uw aanvraag bij de banken indienen, controleren we of uw gegevens precies kloppen. **Download het formulier hieronder**, vul het in en stuur het naar ons terug.",
    option1Title: "Formulier downloaden, invullen en terugsturen",

    step1Title: "Download het formulier",
    step1Body:
      "Open het formulier en vul uw gegevens in. Dat kan op de computer, of u print het uit en vult het met de hand in.",
    step1Button: "Formulier downloaden",
    downloadFileName: "Hipoteken aanvraagformulier.pdf",

    step2Title: "Stuur het ingevulde formulier op",
    step2Body: "Zodra het ingevuld is, uploadt u het formulier hier als pdf.",
    received: (n) => (n === 1 ? "Formulier ontvangen" : "Formulieren ontvangen"),
    chooseFile: (hasFile) =>
      hasFile ? "Ander bestand kiezen" : "Ingevuld formulier kiezen",
    uploadButton: "Formulier uploaden",
    uploading: "Bezig met uploaden…",
    uploadOk: "Binnengekomen — bedankt voor het opsturen.",
    uploadFail: "Het uploaden is niet gelukt. Probeert u het opnieuw.",
  },

  instructions: {
    overline: "Wegwijs in het portaal",

    nav: {
      title: "Waar vindt u wat",
      body: "Elke aanvrager heeft een eigen tabblad — **Documenten van John**, **Documenten van Ana**, enzovoort. Open het tabblad van de persoon bij wie het document hoort en klik op een regel om te zien wat we precies nodig hebben.",
    },

    status: {
      title: "Wat de labels betekenen",
      notSubmitted:
        "**NIET AANGELEVERD** — dit document hebben we nog niet ontvangen.",
      pending: "**IN BEHANDELING** — het is binnen en we kijken ernaar.",
      approved: "**GOEDGEKEURD** — helemaal in orde, hier hoeft u niets meer te doen.",
      rejected:
        "**AFGEKEURD** — lees onze opmerking en stuur ons een nieuwe versie.",
    },

    uploading: {
      title: "Zo levert u een document aan",
      step1: "Open het tabblad van de aanvrager bij wie het document hoort.",
      step2: "Klik op de regel van het document om die te openen.",
      step3: "Kies uw bestand — voor- en achterkant apart als we allebei vragen.",
      step4: "Staat alles klaar? Klik onderaan op **Documenten versturen**.",
      note: "U kunt documenten voor meerdere aanvragers tegelijk klaarzetten — bij het wisselen van tabblad gaat er niets verloren.",
    },

    reference: {
      title: "Voorbeelden van ons team",
      body: "Als wij een voorbeeld of naslagdocument hebben klaargezet, vindt u dat in het gele kader binnen dat document. U kunt het openen of bewaren.",
    },

    messages: {
      title: "Contact met ons",
      body: "Vragen over een document of over uw aanvraag? Gebruik het tabblad **Berichten** — we antwoorden u daar.",
    },

    security: {
      title: "Wachtwoord en veiligheid",
      body: "U kunt uw wachtwoord altijd aanpassen via **Wachtwoord wijzigen** bovenaan. Om uw documenten te beschermen loggen we u na 30 minuten zonder activiteit uit — log daarna gewoon opnieuw in.",
    },
  },

  document: {
    uploadedFiles: "Door u aangeleverde bestanden",
    adminComment: "Opmerking van ons team",
    dropzone: "Sleep bestanden hierheen of **klik om te bladeren**",
    fileTypeWarning: (types, rejected) =>
      `Hier kunnen alleen ${types}-bestanden. Niet toegevoegd: ${rejected}`,
    approvedSuffix: " — goedgekeurd",
  },

  adminUploads: {
    title: "Naslagdocumenten van ons team",
    count: (n) => (n === 1 ? "1 bestand" : `${n} bestanden`),
  },

  messages: {
    empty: "Nog geen berichten. Stel ons gerust een vraag — we helpen u graag.",
    placeholder: "Schrijf een bericht…",
    you: "U",
    admin: "Hipoteken",
    todayAt: (time) => `Vandaag om ${time}`,
    dateAt: (date, time) => `${date} om ${time}`,
  },

  status: {
    "NOT SUBMITTED": "NIET AANGELEVERD",
    PENDING: "IN BEHANDELING",
    APPROVED: "GOEDGEKEURD",
    REJECTED: "AFGEKEURD",
  },

  approval: {
    Pending: "In behandeling",
    Approved: "Goedgekeurd",
    Rejected: "Afgekeurd",
  },

  scan: {
    Front: "Voorkant",
    Back: "Achterkant",
  },

  requirement: {
    Required: "Verplicht",
    Optional: "Indien van toepassing",
  },

  errors: {
    MISSING_FIELDS: "Er ontbreken gegevens. Probeert u het opnieuw.",
    TEMPLATE_NOT_FOUND:
      "We konden dit portaal niet laden. Neemt u contact met ons op.",
    TEMPLATE_CONFIG:
      "We konden dit portaal niet laden. Neemt u contact met ons op.",
    RECORD_NOT_FOUND:
      "We konden uw aanvraag niet vinden. Neemt u contact met ons op.",
    NO_PASSWORD:
      "Voor dit portaal is nog geen wachtwoord ingesteld. Neemt u contact met ons op.",
    INVALID_PASSWORD: "Dat wachtwoord klopt niet. Probeert u het opnieuw.",
    INVALID_OLD_PASSWORD: "Dat is niet uw huidige wachtwoord.",
    SERVER_ERROR: "Er ging bij ons iets mis. Probeert u het opnieuw.",
  },
};

export default nl;
