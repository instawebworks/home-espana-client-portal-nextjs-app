// Spanish (Spain) — formal register (usted), as used by Spanish lenders.
// Written as native portal copy rather than a translation of the English.

const es = {
  code: "es",
  intl: "es-ES",

  brand: {
    portalName: "Portal de Documentación de Hipoteken",
  },

  common: {
    back: "Atrás",
    cancel: "Cancelar",
    view: "Ver",
    save: "Guardar",
    genericError: "Algo no ha ido bien. Inténtelo de nuevo.",
    networkError: "Problema de conexión. Inténtelo de nuevo.",
  },

  login: {
    subtitle: "Acceda para consultar su documentación",
    password: "Contraseña",
    togglePassword: "Mostrar u ocultar la contraseña",
    submit: "Iniciar sesión",
  },

  applicants: {
    subtitle: "Antes de empezar, díganos quién solicita la hipoteca",
    countHeading: "¿Cuántos solicitantes?",
    countHelp: "¿Cuántas personas presentan esta solicitud conjuntamente?",
    namesHeading: (n) =>
      n === 1 ? "Nombre del solicitante" : "Nombres de los solicitantes",
    namesHelp: (n) =>
      n === 1
        ? "Indíquenos el nombre completo del solicitante, tal y como aparece en su documento de identidad."
        : `Indíquenos el nombre completo de los ${n} solicitantes, tal y como aparece en su documento de identidad.`,
    nameLabel: (i) => `Solicitante ${i} — nombre completo`,
    missingNames: "Complete el nombre de todos los solicitantes.",
    submit: "Entrar en el portal",
  },

  changePassword: {
    title: "Cambiar contraseña",
    current: "Contraseña actual",
    new: "Nueva contraseña",
    confirm: "Confirme la nueva contraseña",
    criteria: {
      length: "Mínimo 12 caracteres",
      upper: "Una letra mayúscula",
      lower: "Una letra minúscula",
      number: "Un número",
      special: (chars) => `Un carácter especial (${chars})`,
    },
    sameAsOld: "Elija una contraseña que no haya utilizado antes.",
    mismatch: "Las contraseñas no coinciden.",
    submit: "Guardar contraseña",
    failed: "No hemos podido cambiar su contraseña. Inténtelo de nuevo.",
  },

  portal: {
    tagline: "Suba y revise la documentación que necesitamos",
    changePassword: "Cambiar contraseña",
    // Gender-neutral on purpose: avoids "Bienvenido/a".
    welcome: (name) => `Le damos la bienvenida, ${name}`,

    // Tab labels are kept short — Spanish runs long and these sit in a fixed
    // strip. The fuller wording still appears in the panels themselves.
    tabs: {
      instructions: "Cómo funciona",
      applicationForm: "Formulario",
      applicant: (first) => `Documentos de ${first}`,
      messages: "Mensajes",
    },

    submit: {
      label: "Enviar documentación",
      busy: "Enviando…",
      noFiles: "Seleccione al menos un archivo antes de enviar.",
      ok: "Gracias, ya hemos recibido su documentación.",
      failed: "No hemos podido enviar su documentación. Inténtelo de nuevo.",
      uploadFailed: "Sus archivos no se han subido. Inténtelo de nuevo.",
    },
  },

  applicationForm: {
    greeting: (name) => `Hola, ${name}:`,
    greetingNoName: "Hola:",
    intro:
      "Antes de presentar su solicitud a los bancos, necesitamos comprobar que sus datos son exactos. Solo tiene que **descargar el formulario**, rellenarlo y devolvérnoslo.",
    option1Title: "Descargue, rellene y devuelva el formulario",

    step1Title: "Descargue el formulario",
    step1Body:
      "Ábralo y complete sus datos. Puede rellenarlo en el ordenador o imprimirlo y escribirlo a mano.",
    step1Button: "Descargar el formulario",
    downloadFileName: "Formulario de solicitud Hipoteken.pdf",

    step2Title: "Envíenos el formulario completado",
    step2Body:
      "Cuando lo tenga listo, suba aquí mismo el formulario terminado en PDF.",
    received: (n) => (n === 1 ? "Formulario recibido" : "Formularios recibidos"),
    chooseFile: (hasFile) =>
      hasFile ? "Elegir otro archivo" : "Elegir el formulario completado",
    uploadButton: "Subir el formulario",
    uploading: "Subiendo…",
    uploadOk: "Recibido. Gracias por enviarnos el formulario.",
    uploadFail: "La subida no ha funcionado. Inténtelo de nuevo.",
  },

  instructions: {
    overline: "Cómo moverse por el portal",

    nav: {
      title: "Dónde está cada cosa",
      body: "Cada solicitante tiene su propia pestaña: **Documentos de John**, **Documentos de Ana**, etc. Abra la pestaña de la persona a la que corresponde el documento y haga clic en cualquier fila para ver exactamente qué necesitamos.",
    },

    status: {
      title: "Qué significa cada etiqueta",
      notSubmitted: "**SIN ENVIAR** — todavía no hemos recibido este documento.",
      pending: "**EN REVISIÓN** — ya lo tenemos y lo estamos comprobando.",
      approved: "**APROBADO** — todo correcto, no hay nada más que hacer.",
      rejected:
        "**RECHAZADO** — lea nuestro comentario y envíenos una copia nueva.",
    },

    uploading: {
      title: "Cómo enviarnos un documento",
      step1: "Abra la pestaña del solicitante al que corresponde el documento.",
      step2: "Haga clic en la fila del documento para desplegarla.",
      step3:
        "Elija el archivo: el anverso y el reverso por separado cuando le pidamos ambos.",
      step4:
        "Cuando haya adjuntado todo lo que quiere enviar, pulse **Enviar documentación** al final de la página.",
      note: "Puede preparar documentos de varios solicitantes a la vez: no se pierde nada al cambiar de pestaña.",
    },

    reference: {
      title: "Ejemplos de nuestro equipo",
      body: "Cuando le hayamos dejado un ejemplo o un documento de referencia, lo encontrará en el recuadro ámbar dentro de ese documento. Puede abrirlo o guardar una copia.",
    },

    messages: {
      title: "Hablar con nosotros",
      body: "¿Tiene alguna duda sobre un documento o sobre su solicitud? Utilice la pestaña **Mensajes** y le responderemos ahí mismo.",
    },

    security: {
      title: "Contraseña y seguridad",
      body: "Puede cambiar su contraseña cuando quiera desde **Cambiar contraseña**, arriba. Para proteger su documentación, cerraremos su sesión tras 30 minutos de inactividad; solo tiene que volver a entrar.",
    },
  },

  document: {
    uploadedFiles: "Archivos enviados",
    adminComment: "Comentario de nuestro equipo",
    dropzone: "Arrastre los archivos aquí o **haga clic para buscarlos**",
    fileTypeWarning: (types, rejected) =>
      `Aquí solo se admiten archivos ${types}. No se han añadido: ${rejected}`,
    approvedSuffix: " — aprobado",
  },

  adminUploads: {
    title: "Documentos de referencia de nuestro equipo",
    count: (n) => (n === 1 ? "1 archivo" : `${n} archivos`),
  },

  messages: {
    empty: "Aún no hay mensajes. Pregúntenos lo que necesite, estamos para ayudarle.",
    placeholder: "Escriba un mensaje…",
    you: "Usted",
    admin: "Hipoteken",
    todayAt: (time) => `Hoy a las ${time}`,
    dateAt: (date, time) => `${date} a las ${time}`,
  },

  status: {
    "NOT SUBMITTED": "SIN ENVIAR",
    PENDING: "EN REVISIÓN",
    APPROVED: "APROBADO",
    REJECTED: "RECHAZADO",
  },

  approval: {
    Pending: "En revisión",
    Approved: "Aprobado",
    Rejected: "Rechazado",
  },

  scan: {
    Front: "Anverso",
    Back: "Reverso",
  },

  requirement: {
    Required: "Obligatorio",
    Optional: "Si procede",
  },

  errors: {
    MISSING_FIELDS: "Faltan algunos datos. Inténtelo de nuevo.",
    TEMPLATE_NOT_FOUND:
      "No hemos podido cargar el portal. Póngase en contacto con nosotros.",
    TEMPLATE_CONFIG:
      "No hemos podido cargar el portal. Póngase en contacto con nosotros.",
    RECORD_NOT_FOUND:
      "No encontramos su solicitud. Póngase en contacto con nosotros.",
    NO_PASSWORD:
      "Este portal aún no tiene contraseña. Póngase en contacto con nosotros.",
    INVALID_PASSWORD: "La contraseña no es correcta. Inténtelo de nuevo.",
    INVALID_OLD_PASSWORD: "Esa no es su contraseña actual.",
    SERVER_ERROR: "Ha ocurrido un error por nuestra parte. Inténtelo de nuevo.",
  },
};

export default es;
