import { Link } from '@chakra-ui/react';
import { LeagueLogo } from './LeagueLogo';


export const Header = () => {

    return (
        <div>
            <div
                className="z-50 h-16 w-full bg-grey900"
                role="navigation"
                aria-label="Main"
            >
                <div className="relative mx-auto flex h-full w-full items-center justify-between px-[5%] sm:w-11/12 sm:justify-start sm:p-0 lg:w-3/4">
                    <Link
                        href="/"
                        className="order-2 m-0 h-full w-max transition-all sm:mx-2 sm:inline-block sm:h-full"
                    >
                        {/* <LeagueLogo
                            league="shl"
                            className="relative top-[5%] h-[90%] sm:top-[2.5%]"
                        /> */}
                    </Link>
                </div>
            </div>
        </div>
    );
};