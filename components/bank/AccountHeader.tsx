import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'components/common/Link';
import { TeamLogo } from 'components/common/TeamLogo';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { NextSeo } from 'next-seo';
import { BankAccountHeaderData } from 'pages/api/v1/bank/header-info';
import { useMemo } from 'react';
import { formatCurrency } from 'utils/formatCurrency';
import { query } from 'utils/query';

export const AccountHeader = ({ userID }: { userID: number }) => {
  const { data: user, isLoading: userLoading } =
    useQuery<BankAccountHeaderData>({
      queryKey: ['accountHeaderUser', userID],
      queryFn: () =>
        query(`/api/v1/bank/header-info?uid=${userID}`, {
          headers: {},
        }),
      enabled: !!userID,
    });

  const { currentTeam, loading: teamLoading } = useTeamInfo(
    user?.currentLeague,
    user?.currentTeamID,
  );

  const bottomBorder = useMemo(() => {
    if (currentTeam?.colors.primary) {
      return {
        borderBottomWidth: '8px',
        borderBottomColor: currentTeam?.colors.primary,
      };
    } else {
      return {};
    }
  }, [currentTeam?.colors.primary]);

  return (
    <>
      <NextSeo
        title={user ? `${user.username}'s Bank Account` : 'Bank Account'}
        openGraph={{
          title: `${user?.username}'s Bank Account`,
        }}
      />
      <Breadcrumb className="mb-3 font-mont" separator={<ChevronRightIcon />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/bank">
            Bank
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink
            as={Link}
            href={`/bank/account/${userID}`}
            isCurrentPage
          >
            {user?.username
              ? `${user?.username}'s Account`
              : `Account #${userID}`}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Skeleton isLoaded={!teamLoading && !userLoading}>
        <div className="bg-grey900 p-4 text-grey100" style={bottomBorder}>
          <div className="flex justify-between font-bold lg:text-xl">
            <div className="flex space-x-4">
              <Avatar size="2xl" src={user?.avatar} />
              <div className="flex-col justify-center space-y-2 self-center align-middle">
                <p className="text-4xl">{user?.username}</p>
                {user?.playerName && user?.playerUpdateID && (
                  <Link
                    className="!hover:no-underline block max-w-[150px] text-blue600 lg:max-w-[300px]"
                    href={`/player/${user.playerUpdateID}`}
                  >
                    <p className="truncate text-lg">{user.playerName}</p>
                  </Link>
                )}
                <p className="font-mont text-lg">
                  {formatCurrency(user?.bankBalance ?? 0)}
                </p>
              </div>
            </div>
            {user?.currentLeague && currentTeam?.abbreviation && (
              <TeamLogo
                teamAbbreviation={currentTeam?.abbreviation}
                league={currentTeam?.league === 0 ? 'shl' : 'smjhl'}
                className="max-h-20 justify-center self-center align-middle max-sm:hidden lg:max-h-28"
              />
            )}
          </div>
        </div>
      </Skeleton>
    </>
  );
};
