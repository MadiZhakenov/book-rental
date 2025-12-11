import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Поддерживаемые локали
export const locales = ['ru', 'kk'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
    // Валидация локали
    if (!locales.includes(locale as Locale)) notFound();

    return {
        locale: locale as string,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
