'use client';

import { createContext, useContext, ReactNode } from 'react';

type Translations = {
    [key: string]: string | Translations;
};

const TranslationsContext = createContext<Translations>({});

export function TranslationsProvider({
    children,
    translations
}: {
    children: ReactNode;
    translations: Translations;
}) {
    return (
        <TranslationsContext.Provider value={translations}>
            {children}
        </TranslationsContext.Provider>
    );
}

export function useTranslations(namespace?: string) {
    const translations = useContext(TranslationsContext);

    return (key: string) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const keys = fullKey.split('.');
        let value: any = translations;

        for (const k of keys) {
            value = value?.[k];
        }

        return value || fullKey;
    };
}
