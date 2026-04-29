/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { vi, enUS, fr } from 'date-fns/locale'

export const useDatePickerLocale = () => {
  const { i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18n.language)

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(i18n.language)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  return useMemo(() => {
    const getLocale = () => {
      switch (currentLang) {
        case 'vi': return vi
        case 'fr': return fr
        default: return enUS
      }
    }

    const getDateFormat = () => {
      switch (currentLang) {
        case 'vi':
        case 'fr':
          return 'dd/MM/yyyy'
        default:
          return 'MM/dd/yyyy'
      }
    }

    const getDateTimeFormat = () => {
      switch (currentLang) {
        case 'vi':
        case 'fr':
          return 'dd/MM/yyyy HH:mm'
        default:
          return 'MM/dd/yyyy HH:mm'
      }
    }

    const formatDateForAPI = (date: Date | null): Date | null => {
      if (date == null) return null

      // Create UTC date with same day/month/year at 00:00:00
      return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0, 0
      ))
    }
    // const formatDateTimeForAPI = (date: Date | null): Date | null => {
    //   if (date == null) return null

    //   return new Date(Date.UTC(
    //     date.getFullYear(),
    //     date.getMonth(),
    //     date.getDate(),
    //     date.getHours(),
    //     date.getMinutes(),
    //     0, 0
    //   ))
    // }
    return {
      locale: getLocale(),
      dateFormat: getDateFormat(),
      dateTimeFormat: getDateTimeFormat(),
      formatDateForAPI
      // formatDateTimeForAPI
    }
  }, [currentLang])
}
