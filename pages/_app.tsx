import { SessionProvider, useSession } from '../contexts/AuthContext';
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {

    const { loggedIn, handleRefresh, isLoading } = useSession();

    return (
        <SessionProvider>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </SessionProvider>
    )
}

export default MyApp
