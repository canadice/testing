import { Spinner } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

import { Footer } from '../Footer';
import { Header } from '../Header';

export const PageWrapper = ({
    children,
    loading = false,
}: PropsWithChildren<{ loading?: boolean }>) => (
    <>
        <Header />
        <div className="pb-16">
            {loading ? (
                <div className="flex h-[100vh] w-full items-center justify-center">
                    <Spinner size="xl" thickness="4px" />
                </div>
            ) : (
                <>{children}</>
            )}
        </div>
        <Footer />
    </>
);