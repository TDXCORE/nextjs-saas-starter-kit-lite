'use client';

import { useMemo, useState, useEffect } from 'react';

import dynamic from 'next/dynamic';

import { ThemeProvider } from 'next-themes';

import { CaptchaProvider } from '@kit/auth/captcha/client';
import { I18nProvider } from '@kit/i18n/provider';
import { If } from '@kit/ui/if';
import { VersionUpdater } from '@kit/ui/version-updater';

import { AuthProvider } from '~/components/auth-provider';
import appConfig from '~/config/app.config';
import authConfig from '~/config/auth.config';
import featuresFlagConfig from '~/config/feature-flags.config';
import { i18nResolver } from '~/lib/i18n/i18n.resolver';
import { getI18nSettings } from '~/lib/i18n/i18n.settings';

import { ReactQueryProvider } from './react-query-provider';

const captchaSiteKey = authConfig.captchaTokenSiteKey;

const CaptchaTokenSetter = dynamic(async () => {
  if (!captchaSiteKey) {
    return Promise.resolve(() => null);
  }

  const { CaptchaTokenSetter } = await import('@kit/auth/captcha/client');

  return {
    default: CaptchaTokenSetter,
  };
});

export function RootProviders({
  lang,
  theme = appConfig.theme,
  children,
}: React.PropsWithChildren<{
  lang: string;
  theme?: string;
}>) {
  const i18nSettings = useMemo(() => getI18nSettings(lang), [lang]);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Simulate asynchronous i18n loading; replace with actual loading logic
    const timeoutId = setTimeout(() => {
      setI18nReady(true);
    }, 500); // Adjust delay as needed

    return () => clearTimeout(timeoutId);
  }, []);


  return (
    <ReactQueryProvider>
      <I18nProvider settings={i18nSettings} resolver={i18nResolver}>
        {i18nReady ? (
          <>
            <CaptchaProvider>
              <CaptchaTokenSetter siteKey={captchaSiteKey} />

              <AuthProvider>
                <ThemeProvider
                  attribute="class"
                  enableSystem
                  disableTransitionOnChange
                  defaultTheme={theme}
                  enableColorScheme={false}
                >
                  {children}
                </ThemeProvider>
              </AuthProvider>
            </CaptchaProvider>

            <If condition={featuresFlagConfig.enableVersionUpdater}>
              <VersionUpdater />
            </If>
          </>
        ) : (
          <div>Loading translations...</div> // Loading indicator
        )}
      </I18nProvider>
    </ReactQueryProvider>
  );
}