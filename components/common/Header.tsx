import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  MenuDivider,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import classnames from 'classnames';
import { useSession } from 'contexts/AuthContext';
import { Squash as Hamburger } from 'hamburger-react';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useRouter } from 'next/router';
import { BaseUserData } from 'pages/api/v1/user';
import { useState } from 'react';
import { query } from 'utils/query';

import { PermissionGuard } from '../auth/PermissionGuard';
import { RoleGuard } from '../auth/RoleGuard';

import { LeagueLogo } from './LeagueLogo';
import { Link } from './Link';
import { SudoButton } from './SudoButton';

const CURRENT_PAGE_LINK_CLASSES: HTMLDivElement['className'] =
  'border-b-0 sm:border-b-[4px] border-l-[4px] sm:border-l-0 pt-0 sm:pt-[4px] pr-[14px] sm:pr-[10px] border-grey100';
const LINK_CLASSES: HTMLDivElement['className'] =
  '!hover:no-underline flex h-12 w-full items-center justify-center px-[10px] text-sm font-bold capitalize !text-grey100 hover:bg-blue600 sm:h-full sm:w-max';

export const Header = ({
  showAuthButtons = true,
}: {
  showAuthButtons?: boolean;
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { session, loggedIn, handleLogout } = useSession();
  const { status } = useCurrentPlayer();
  const router = useRouter();

  const { data } = useQuery<BaseUserData>({
    queryKey: ['baseUser', session?.token],
    queryFn: () =>
      query(`api/v1/user`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
    enabled: loggedIn,
  });

  return (
    <div>
      {window.location.origin.startsWith('https://portaldev.') && (
        <div className="w-full items-center bg-red200 py-2 text-center text-xs lg:text-sm">
          <span className="font-semibold">
            This is a development environment. Any User/Player data reflected
            here is probably inaccurate, and any changes will not be reflected
            for your actual User/Player accounts.
          </span>
        </div>
      )}
      <div
        className="z-50 h-16 w-full bg-grey900"
        role="navigation"
        aria-label="Main"
      >
        <div className="relative mx-auto flex h-full w-full items-center justify-between px-[5%] sm:w-11/12 sm:justify-start sm:p-0 lg:w-3/4">
          <Link
            href="/"
            className="order-2 m-0 h-full w-max transition-all sm:mx-2 sm:inline-block sm:h-full"
            aria-label="Go home"
          >
            <LeagueLogo
              league="shl"
              className="relative top-[5%] h-[90%] sm:top-[2.5%]"
            />
          </Link>
          <div
            className={classnames(
              !drawerVisible && 'hidden',
              'absolute top-16 left-0 z-50 order-1 h-auto w-full flex-col bg-grey800 sm:relative sm:top-0 sm:order-3 sm:flex sm:h-full sm:w-auto sm:flex-row sm:bg-[transparent]',
            )}
          >
            {loggedIn && (
              <>
                {status && status !== 'retired' ? (
                  <Link
                    href="/player"
                    _hover={{ textDecoration: 'none' }}
                    className={classnames(
                      router.asPath === '/player' && CURRENT_PAGE_LINK_CLASSES,
                      LINK_CLASSES,
                    )}
                  >
                    Player
                  </Link>
                ) : (
                  <Link
                    href="/create"
                    _hover={{ textDecoration: 'none' }}
                    className={classnames(
                      router.asPath === '/create' && CURRENT_PAGE_LINK_CLASSES,
                      LINK_CLASSES,
                    )}
                  >
                    Create
                  </Link>
                )}
              </>
            )}
            <Link
              href="/teams"
              _hover={{ textDecoration: 'none' }}
              className={classnames(
                router.asPath.startsWith('/teams') && CURRENT_PAGE_LINK_CLASSES,
                LINK_CLASSES,
              )}
            >
              Teams
            </Link>

            <Link
              href="/bank"
              _hover={{ textDecoration: 'none' }}
              className={classnames(
                router.asPath.startsWith('/bank') && CURRENT_PAGE_LINK_CLASSES,
                LINK_CLASSES,
              )}
            >
              Bank
            </Link>

            {loggedIn && (
              <RoleGuard
                userRoles={[
                  'SHL_GM',
                  'SMJHL_GM',
                  'SHL_HO',
                  'SMJHL_HO',
                  'SMJHL_INTERN',
                  'IIHF_COMMISSIONER',
                  'IIHF_HO',
                  'SHL_COMMISSIONER',
                  'SMJHL_COMMISSIONER',
                  'PT_GRADER',
                  'UPDATER',
                  'HEAD_UPDATER',
                ]}
              >
                <Menu>
                  <MenuButton className="!hover:no-underline flex h-12 w-full items-center justify-center px-[10px] text-sm font-bold capitalize !text-grey100 hover:bg-blue600 sm:h-full sm:w-max">
                    Jobs
                  </MenuButton>
                  <MenuList>
                    <PermissionGuard userPermissions="canApprovePlayers">
                      <MenuItem onClick={() => router.push('/head-office')}>
                        Head Office
                      </MenuItem>
                    </PermissionGuard>
                    <PermissionGuard userPermissions="canAssignPlayerIIHFNation">
                      <MenuItem
                        onClick={() => router.push('/head-office/iihf')}
                      >
                        IIHF Head Office
                      </MenuItem>
                    </PermissionGuard>
                    <PermissionGuard userPermissions="canHandleTeamTransactions">
                      <MenuItem onClick={() => router.push('/manager')}>
                        General Manager
                      </MenuItem>
                    </PermissionGuard>
                    <PermissionGuard userPermissions="canApprovePlayers">
                      <MenuItem onClick={() => router.push('/approvals')}>
                        Approvals
                      </MenuItem>
                    </PermissionGuard>
                    <PermissionGuard userPermissions="canAdjustPlayerTPE">
                      <MenuItem onClick={() => router.push('/tpe')}>
                        TPE Management
                      </MenuItem>
                    </PermissionGuard>
                    <PermissionGuard userPermissions="canManagePlayerIndexIds">
                      <MenuItem
                        onClick={() => router.push('/index-management')}
                      >
                        Index Management
                      </MenuItem>
                    </PermissionGuard>
                  </MenuList>
                </Menu>
              </RoleGuard>
            )}

            {drawerVisible ? (
              <>
                <Link
                  href="/search"
                  _hover={{ textDecoration: 'none' }}
                  className={classnames(
                    router.asPath.startsWith('/search') &&
                      CURRENT_PAGE_LINK_CLASSES,
                    LINK_CLASSES,
                  )}
                >
                  Search
                </Link>
                <Link
                  href="/player/build"
                  _hover={{ textDecoration: 'none' }}
                  className={classnames(
                    router.asPath.startsWith('/player/build') &&
                      CURRENT_PAGE_LINK_CLASSES,
                    LINK_CLASSES,
                  )}
                >
                  Build Tool
                </Link>
                <Link
                  href="/history"
                  _hover={{ textDecoration: 'none' }}
                  className={classnames(
                    router.asPath.startsWith('/history') &&
                      CURRENT_PAGE_LINK_CLASSES,
                    LINK_CLASSES,
                  )}
                >
                  History
                </Link>
                <hr className="border-blue700" />
                <Link
                  href="https://www.simulationhockey.com"
                  _hover={{ textDecoration: 'none' }}
                  className={LINK_CLASSES}
                >
                  Forums
                </Link>

                <Link
                  href="https://index.simulationhockey.com"
                  _hover={{ textDecoration: 'none' }}
                  className={LINK_CLASSES}
                >
                  Index
                </Link>

                <Link
                  href="https://cards.simulationhockey.com"
                  _hover={{ textDecoration: 'none' }}
                  className={LINK_CLASSES}
                >
                  Cards
                </Link>
              </>
            ) : (
              <Menu>
                <MenuButton className="!hover:no-underline flex h-12 w-full items-center justify-center px-[10px] text-sm font-bold capitalize !text-grey100 hover:bg-blue600 sm:h-full sm:w-max">
                  More
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => router.push('/search')}>
                    Search
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/player/build')}>
                    Build Tool
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/history')}>
                    History
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    onClick={() =>
                      router.push('https://www.simulationhockey.com')
                    }
                  >
                    Forums
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      router.push('https://index.simulationhockey.com')
                    }
                  >
                    Index
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      router.push('https://cards.simulationhockey.com')
                    }
                  >
                    Cards
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </div>
          <div className="inline-block flex-1 sm:hidden">
            <Hamburger
              toggled={drawerVisible}
              toggle={() =>
                setDrawerVisible((currentVisibility) => !currentVisibility)
              }
              color="#F8F9FA"
              size={24}
            />
          </div>
          <div className="relative order-3 mr-4 flex flex-1 items-center justify-end space-x-3 sm:mr-[2%] sm:ml-auto sm:w-auto">
            {!loggedIn && showAuthButtons && (
              <Button onClick={() => router.push('/login')}>Log In</Button>
            )}
            {loggedIn && showAuthButtons && (
              <>
                <RoleGuard userRoles="PORTAL_MANAGEMENT">
                  <SudoButton />
                </RoleGuard>

                <Menu isLazy>
                  {({ isOpen }) => (
                    <>
                      <MenuButton className="font-mont text-grey100 hover:underline">
                        <div className="flex h-full items-center space-x-1">
                          <span className="hidden sm:inline">
                            {data?.username}
                          </span>
                          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          <Avatar
                            size="sm"
                            name={data?.username}
                            src={data?.avatar}
                          />
                        </div>
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                      </MenuList>
                    </>
                  )}
                </Menu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
