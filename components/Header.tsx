import { Link } from '@chakra-ui/react';
import {
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
} from '@chakra-ui/react';
import { ReactSVG } from 'react-svg';

export const Header = () => {

    return (
        <div>
            <div
                className="h-16 w-full bg-grey900"
                role="navigation"
                aria-label="Main"
            >
                <div className="relative mx-auto flex h-full w-full items-center justify-between px-[5%] sm:w-11/12 sm:justify-start sm:p-0 lg:w-3/4">
                    <Link
                        href="/"
                        className="order-2 m-0 h-full w-max transition-all sm:mx-2 sm:inline-block sm:h-full"
                    >
                        <ReactSVG className='w-20' src={'../SSL.svg'} />
                    </Link>
                    <Link
                        href="/draftClass"
                    >
                        Draft Class
                    </Link>

                </div>
            </div>
        </div>
    );
};