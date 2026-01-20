'use client'

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl'
import { useState, useEffect } from 'react'

interface Props {
    children: React.ReactNode
    initialMessages: AbstractIntlMessages
    initialLocale: string
}

export function I18nProvider({ children, initialMessages, initialLocale }: Props) {
    const [messages, setMessages] = useState<AbstractIntlMessages>(initialMessages)
    const [locale, setLocale] = useState(initialLocale)

    useEffect(() => {
        async function loadMessages() {
            if (typeof window === 'undefined') return

            const params = new URLSearchParams(window.location.search)
            const langParam = params.get('lang')

            let targetLocale = initialLocale

            if (langParam === 'en') {
                targetLocale = 'en'
            } else if (langParam === 'ja') {
                targetLocale = 'ja'
            }

            // If detecting English and currently using Japanese messages, load English
            if (targetLocale === 'en' && locale !== 'en') {
                try {
                    // Dynamic import of dictionary
                    const msgs = await import(`../messages/en.json`)
                    setMessages(msgs.default)
                    setLocale('en')
                } catch (e) {
                    console.error("Failed to load English dictionary", e)
                }
            }
            // If switching back to default (ja), we can reuse initialMessages if it was ja
            else if (targetLocale === 'ja' && locale !== 'ja') {
                // Assuming initialMessages was JA (default), or we re-import JA
                try {
                    const msgs = await import(`../messages/ja.json`)
                    setMessages(msgs.default)
                    setLocale('ja')
                } catch (e) {
                    console.error("Failed to load Japanese dictionary", e)
                }
            }
        }

        loadMessages()
    }, [initialLocale, locale]) // Check deps

    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Tokyo">
            {children}
        </NextIntlClientProvider>
    )
}
