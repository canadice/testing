import { SessionProvider, useSession } from '../contexts/AuthContext';
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import '../styles/globals.css';
import '../styles/app.css';
import '../styles/reactable.css';
import '../styles/attributeBox.css';

import { PageWrapper } from '../components/common/PageWrapper';

function MyApp({ Component, pageProps }: AppProps) {

    const { loggedIn, handleRefresh, isLoading } = useSession();

    return (
        <SessionProvider>
            <ChakraProvider>
                <PageWrapper loading={loggedIn ? true : false}>
                    <Component {...pageProps} />
                </PageWrapper>
            </ChakraProvider>
        </SessionProvider>
    )
}

export default MyApp
