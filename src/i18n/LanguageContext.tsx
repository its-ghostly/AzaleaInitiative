import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { TABLES, type Lang } from './translations'

export type { Lang }

const STORAGE_KEY = 'azalea-lang'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh-Hant' || stored === 'zh-Hans') return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStoredLang())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'zh-Hant' ? 'zh-Hant' : 'zh-Hans'
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => {
    const table = TABLES[lang]
    return {
      lang,
      setLang: setLangState,
      t: (key: string, vars?: Record<string, string | number>) => {
        let text = table[key] ?? TABLES.en[key] ?? key
        if (vars) {
          for (const [name, value] of Object.entries(vars)) {
            text = text.replaceAll(`{${name}}`, String(value))
          }
        }
        return text
      },
    }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    return {
      lang: 'en' as Lang,
      setLang: () => undefined,
      t: (key: string, vars?: Record<string, string | number>) => {
        let text = TABLES.en[key] ?? key
        if (vars) {
          for (const [name, value] of Object.entries(vars)) {
            text = text.replaceAll(`{${name}}`, String(value))
          }
        }
        return text
      },
    }
  }
  return ctx
}

export function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage()
  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>{t('lang.en')}</button>
      <button type="button" className={lang === 'zh-Hant' ? 'active' : ''} onClick={() => setLang('zh-Hant')}>{t('lang.zhHant')}</button>
      <button type="button" className={lang === 'zh-Hans' ? 'active' : ''} onClick={() => setLang('zh-Hans')}>{t('lang.zhHans')}</button>
    </div>
  )
}
