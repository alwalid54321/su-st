import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',
  
  // Do not use a prefix for the default locale
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  // We want to match all pages except api, static files, and next internal files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
