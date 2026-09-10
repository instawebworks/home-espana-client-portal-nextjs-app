"use client";

import { createContext, useContext, useEffect } from "react";
import { DEFAULT_LOCALE, getDictionary } from "@/lib/i18n";

// Server components pass only the resolved locale string across the boundary —
// dictionaries contain functions, which cannot be serialised as props.
const I18nContext = createContext(getDictionary(DEFAULT_LOCALE));

export function I18nProvider({ locale, children }) {
  // getDictionary returns a stable module-level object, so the context value
  // identity does not change between renders.
  const dictionary = getDictionary(locale);

  // <html lang> lives in the root layout, which cannot see a locale that is a
  // property of the CRM record. Keep it in sync so assistive technology and
  // browser translation prompts read the page as the right language.
  useEffect(() => {
    document.documentElement.lang = dictionary.code;
  }, [dictionary.code]);

  return (
    <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>
  );
}

/** The active dictionary, e.g. `const t = useT(); t.login.submit`. */
export function useT() {
  return useContext(I18nContext);
}
