import { createContext, createElement, useContext, type ReactNode } from 'react'
import { en } from './locales/en'
import { de } from './locales/de'

export const SUPPORTED_LOCALES = ['en', 'de'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export type TranslationKey = keyof typeof en

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, de }

export function detectLocale(): Locale {
  const systemLocale = navigator.language.slice(0, 2)
  return (SUPPORTED_LOCALES as readonly string[]).includes(systemLocale) ? (systemLocale as Locale) : 'en'
}

const LocaleContext = createContext<Locale>('en')

interface LocaleProviderProps {
  locale: Locale
  children: ReactNode
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return createElement(LocaleContext.Provider, { value: locale }, children)
}

export function useTranslation(): { t: (key: TranslationKey, vars?: Record<string, string>) => string } {
  const locale = useContext(LocaleContext)
  const dictionary = DICTIONARIES[locale]

  const t = (key: TranslationKey, vars?: Record<string, string>): string => {
    const template = dictionary[key] ?? DICTIONARIES.en[key]
    if (!vars) return template
    return Object.entries(vars).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template)
  }

  return { t }
}
