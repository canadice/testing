import { Search2Icon } from '@chakra-ui/icons';
import { Badge, Link, Tooltip } from '@chakra-ui/react';
import { ChangeIcon } from 'components/playerForms/changeForms/ChangeIcon';
import { TeamLogo } from 'components/TeamLogo';
import { useGetCappedTPE } from 'hooks/useGetCappedTPE';
import { useSeason } from 'hooks/useSeason';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { Base64 } from 'js-base64';
import { HTMLAttributes, ReactNode, useMemo } from 'react';
import { Player } from 'typings';
import { formatCurrency } from 'utils/formatCurrency';
import { formatDateTime } from 'utils/formatDateTime';

import { GoalieAttributeTable } from './GoalieAttributeTable';
import { HeaderProperty } from './HeaderProperty';
import { Property } from './Property';
import { Section } from './Section';
import { SkaterAttributeTable } from './SkaterAttributeTable';
import { TPEEventsAccordion } from './TPEEventsAccordion';
import { UpdateEventsAccordion } from './UpdateEventsAccordion';

export const FullPlayerSheet = ({
  player,
  attributeMenu,
  activityMenu,
  readOnly = false,
}: {
  player: Player;
  attributeMenu?: ReactNode;
  activityMenu?: ReactNode;
  readOnly?: boolean;
}) => {
  const { currentTeam, currentLeague, shlRightsTeam } = useTeamInfo(
    player.currentLeague,
    player.currentTeamID,
    player.shlRightsTeamID,
  );

  const { season } = useSeason();
  const { totalTPE, isCappedTPE } = useGetCappedTPE(player, season);

  const bottomBorderStyle: {
    primary: HTMLAttributes<HTMLDivElement>['style'];
    secondary: HTMLAttributes<HTMLDivElement>['style'];
  } = useMemo(() => {
    if (!currentTeam?.colors.primary) {
      return { primary: {}, secondary: {} };
    }

    return {
      primary: {
        borderBottomWidth: '8px',
        borderBottomColor: currentTeam?.colors.primary,
      },
      secondary: {
        borderBottomWidth: '4px',
        borderBottomColor: currentTeam?.colors.secondary,
      },
    };
  }, [currentTeam?.colors]);

  return (
    <div className="space-y-4">
      <div>
        <div
          className="bg-grey900 p-2 text-grey100"
          style={bottomBorderStyle.primary}
        >
          <div className="flex justify-between font-bold lg:text-xl">
            <div className="flex flex-col place-content-end">
              <div className="flex max-w-[200px] md:max-w-[400px] lg:max-w-[600px] xl:max-w-[800px]">
                <HeaderProperty
                  label="Player Name"
                  property={player.name}
                  changeType="Name"
                  readOnly={readOnly}
                />
              </div>
              <div className="flex">
                <HeaderProperty
                  label="Position"
                  property={player.position}
                  changeType="Position"
                  readOnly={readOnly}
                  showDivider
                />
                <HeaderProperty
                  label="Jersey Number"
                  property={`#${player.jerseyNumber}`}
                  changeType="JerseyNumber"
                  readOnly={readOnly}
                />
              </div>
              <div>
                <HeaderProperty
                  label="Height"
                  property={player.height}
                  showDivider
                />
                <HeaderProperty
                  label="Weight"
                  property={`${player.weight} lbs`}
                />
              </div>
            </div>
            {currentLeague && currentTeam?.abbreviation && (
              <TeamLogo
                teamAbbreviation={currentTeam?.abbreviation}
                league={currentLeague}
                className="mt-2 max-h-20 lg:max-h-28"
              />
            )}
          </div>
        </div>
        {activityMenu}
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 p-2">
          <div className="grid w-full grid-cols-1 gap-6 text-sm md:grid-cols-2">
            <Property label="Render" value={player.render}>
              {player.render}
              {!readOnly && <ChangeIcon type="Render" />}
            </Property>
            {player.birthplace && (
              <Property label="Birthplace" value={player.birthplace} />
            )}
            <Property label="Shoots" value={player.handedness} />
            <Property label="Bank Balance" className="font-mont">
              <Link
                title="View Bank Account"
                aria-label="Link navigates to Bank Account Page"
                className="!hover:no-underline flex items-center font-mont hover:text-blue600 focus:text-blue600"
                href={`/bank/account/${player.uid}`}
              >
                {formatCurrency(player.bankBalance ?? 0)}
                <Search2Icon className="ml-2 justify-self-center align-middle" />
              </Link>
            </Property>
            {readOnly && (
              <Property label="Username">
                <Link
                  title="View Forum Profile"
                  aria-label={`${player.username}. Link navigates to users forum profile.`}
                  className="!hover:no-underline flex items-center font-mont hover:text-blue600 focus:text-blue600"
                  href={`https://simulationhockey.com/member.php?action=profile&uid=${player.uid}`}
                >
                  {player.username}
                  <Search2Icon className="ml-2 justify-self-center align-middle" />
                </Link>
              </Property>
            )}
          </div>
        </div>
      </div>

      <Section label="League" borderStyle={bottomBorderStyle.secondary}>
        <Property label="Current League" value={player.currentLeague} />
        <Property label="Current Team" value={currentTeam?.name} />
        {player.currentLeague !== 'SHL' && shlRightsTeam && (
          <Property label="SHL Rights Team" value={shlRightsTeam.name} />
        )}
        <Property label="IIHF Nation" value={player.iihfNation} />
      </Section>

      <Section label="Historical" borderStyle={bottomBorderStyle.secondary}>
        <Property
          label="Creation Date"
          value={formatDateTime(player.creationDate, true)}
          className="font-mont"
        />
        <Property label="Draft Season" value={player.draftSeason} />
        {player.recruiter && (
          <Property label="Recruiter" value={player.recruiter} />
        )}
        {player.retirementDate && (
          <Property
            label="Retirement Date"
            value={formatDateTime(player.retirementDate, true)}
            className="font-mont"
          />
        )}
      </Section>

      <Section label="TPE" cols={3} borderStyle={bottomBorderStyle.secondary}>
        <Property
          label="Total TPE"
          value={player.totalTPE}
          className="font-mont"
        />
        <Property
          label="Banked TPE"
          value={player.bankedTPE}
          className="font-mont"
        />
        <Property label="Applied TPE" className="font-mont">
          <span className="flex flex-nowrap">
            <Link
              title="View Player Build"
              aria-label={`${player.appliedTPE}. Link navigates to view players build in the Build Tool.`}
              className="!hover:no-underline flex items-center font-mont hover:text-blue600 focus:text-blue600"
              href={`/player/build?token=${Base64.encode(
                JSON.stringify(
                  player
                    ? {
                        position: player.position,
                        totalTPE: player.totalTPE,
                        currentLeague: 'SHL',
                        draftSeason: 1,
                        bankedTPE: player.bankedTPE,
                        appliedTPE: player.appliedTPE,
                        attributes: player.attributes,
                      }
                    : {},
                ),
              )}`}
            >
              {player.appliedTPE}
              <Search2Icon className="ml-2" />
            </Link>
            {isCappedTPE && (
              <Tooltip
                hasArrow
                label={`Your TPE is capped at ${totalTPE}`}
                bg="gray.300"
                color="black"
              >
                <Badge className="ml-2" colorScheme="red">
                  CAPPED
                </Badge>
              </Tooltip>
            )}
            {player.appliedTPE > player.totalTPE && (
              <Tooltip
                hasArrow
                label="Your applied TPE is more than your total TPE."
                bg="gray.300"
                color="black"
              >
                <Badge className="ml-2" colorScheme="red">
                  REGRESSION DUE
                </Badge>
              </Tooltip>
            )}
          </span>
        </Property>
      </Section>

      <div>
        <div
          className="bg-grey900 p-2 text-grey100"
          style={bottomBorderStyle.secondary}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold">Attributes</span>
            <div className="text-grey900">{attributeMenu}</div>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 p-2">
          {player.position === 'Goalie' ? (
            <GoalieAttributeTable player={player} />
          ) : (
            <SkaterAttributeTable player={player} />
          )}
        </div>
      </div>
      <UpdateEventsAccordion
        pid={player.pid}
        borderStyle={bottomBorderStyle.secondary}
      />
      <TPEEventsAccordion
        pid={player.pid}
        borderStyle={bottomBorderStyle.secondary}
      />
    </div>
  );
};
