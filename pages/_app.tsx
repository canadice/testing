import 'styles/globals.css';
import { Spinner } from '@chakra-ui/react';
import { Raleway, Montserrat } from '@next/font/google';
import {
  Hydrate,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Footer } from 'components/common/Footer';
import { LeagueLogo } from 'components/common/LeagueLogo';
import { SessionProvider, useSession } from 'contexts/AuthContext';
import { ToastProvider } from 'contexts/ToastContext';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import SEO from 'next-seo.config';
import React from 'react';
import { CustomChakraProvider } from 'styles/CustomChakraProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal'],
  variable: '--font-montserrat',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal'],
  variable: '--font-raleway',
});

const AppWrappers = ({ Component, pageProps }: AppProps) => {
  const { loggedIn, handleRefresh, isLoading } = useSession();

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: async (error, query) => {
            //@ts-ignore
            if (error.status === 401) {
              // This will refresh our token automatically if any of our queries don't pass auth
              await handleRefresh();
              if (loggedIn) {
                queryClient.refetchQueries(query.queryKey);
              }
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <main
          className={`${montserrat.variable} ${raleway.variable} relative min-h-screen font-raleway`}
        >
          <DefaultSeo {...SEO} />
          <CustomChakraProvider>
            <ToastProvider>
              {isLoading ? (
                <>
                  <div
                    className="z-50 h-16 w-full bg-grey900"
                    role="navigation"
                    aria-label="Main"
                  >
                    <div className="relative mx-auto flex h-full w-full items-center justify-between px-[5%] sm:w-11/12 sm:justify-start sm:p-0 lg:w-3/4">
                      <LeagueLogo
                        league="shl"
                        className="relative top-[5%] h-[90%] sm:top-[2.5%]"
                      />
                    </div>
                  </div>
                  <div className="m-auto w-full bg-grey100 pb-8 2xl:w-4/5 ">
                    <div className="m-auto flex h-[calc(100vh-10rem)] w-full items-center justify-center">
                      <Spinner size="xl" thickness="4px" />
                    </div>
                  </div>
                  <Footer />
                </>
              ) : (
                <Component {...pageProps} />
              )}
            </ToastProvider>
          </CustomChakraProvider>
        </main>
      </Hydrate>
    </QueryClientProvider>
  );
};

export default function App(props: AppProps) {
  return (
    <SessionProvider>
      <AppWrappers {...props} />
    </SessionProvider>
  );
}
