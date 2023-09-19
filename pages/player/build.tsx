import { CopyIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import {
  PLAYER_DEFAULTS,
  PLAYER_INFO_OPTIONS,
  Position,
} from 'components/playerForms/constants';
import {
  AttributeChange,
  EditAttributesForm,
} from 'components/playerForms/editAttributes/EditAttributesForm';
import { ToastContext } from 'contexts/ToastContext';
import { Base64 } from 'js-base64';
import { useRouter } from 'next/router';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { GoalieAttributes, Player, SkaterAttributes } from 'typings';

const defaultPlayer: Player = {
  recruiter: '',
  render: '',
  iihfNation: '',
  position: 'Center',
  uid: 0,
  username: '',
  pid: 0,
  creationDate: '',
  retirementDate: null,
  status: 'active',
  birthplace: null,
  totalTPE: 155,
  currentLeague: 'SHL',
  currentTeamID: null,
  shlRightsTeamID: null,
  draftSeason: 1,
  bankedTPE: 155,
  appliedTPE: 0,
  positionChanged: false,
  usedRedistribution: 0,
  coachingPurchased: 0,
  trainingPurchased: false,
  activityCheckComplete: false,
  trainingCampComplete: false,
  taskStatus: 'Draftee Free Agent',
  bankBalance: 0,
  attributes: {
    screening: 5,
    gettingOpen: 5,
    passing: 5,
    puckhandling: 5,
    shootingAccuracy: 5,
    shootingRange: 5,
    offensiveRead: 5,
    checking: 5,
    hitting: 5,
    positioning: 5,
    stickchecking: 5,
    shotBlocking: 5,
    faceoffs: 5,
    defensiveRead: 5,
    acceleration: 5,
    agility: 5,
    balance: 5,
    speed: 5,
    strength: 5,
    stamina: 14,
    fighting: 5,
    aggression: 5,
    bravery: 5,
    determination: 15,
    teamPlayer: 15,
    leadership: 15,
    temperament: 15,
    professionalism: 15,
  },
  name: '',
  handedness: 'Right',
  jerseyNumber: null,
  height: null,
  weight: null,
} as const;

export default () => {
  const [storedBuilds, setStoredBuilds] = useState<Player[] | undefined>(
    undefined,
  );

  const router = useRouter();

  const { addToast } = useContext(ToastContext);

  const [player, setPlayer] = useState(defaultPlayer);

  const onCancel = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/player/build');
      location.reload();
    }
  }, []);

  const fetchStoredBuilds = useCallback(() => {
    const saved = localStorage.getItem('builds');
    if (saved) {
      const initial = JSON.parse(saved);
      setStoredBuilds(initial);
    }
  }, []);

  useEffect(() => {
    if (router.query?.token) {
      const decodedPlayer = JSON.parse(
        Base64.decode(String(router.query.token)),
      );
      setTokenizedPlayer(String(router.query.token));
      setPlayer(decodedPlayer);
    }
  }, [router.query.token]);

  const [tokenizedPlayer, setTokenizedPlayer] = useState<string | undefined>(
    undefined,
  );

  const tokenizePlayer = useCallback((player: any) => {
    if (player !== undefined) return Base64.encode(JSON.stringify(player));
  }, []);

  useEffect(() => {
    fetchStoredBuilds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePosition = useCallback(
    (nextPosition: Position) => {
      if (nextPosition === 'Goalie' && player.position !== 'Goalie') {
        setPlayer((prev) => ({
          ...prev,
          position: nextPosition,
          attributes: { ...(PLAYER_DEFAULTS.goalie as GoalieAttributes) },
        }));
      } else if (nextPosition !== 'Goalie' && player.position === 'Goalie') {
        setPlayer((prev) => ({
          ...prev,
          position: nextPosition,
          attributes: { ...(PLAYER_DEFAULTS.skater as SkaterAttributes) },
        }));
      } else {
        setPlayer((prev) => ({
          ...prev,
          position: nextPosition,
        }));
      }
    },
    [player.position],
  );

  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    if (player.name) setPlayerName(player.name);
  }, [player.name]);

  const onSubmitCallback = useCallback(
    async (
      _changes: AttributeChange[],
      info: Partial<Player>,
      goalie?: Partial<GoalieAttributes>,
      skater?: Partial<SkaterAttributes>,
    ) => {
      if (info.position === 'Goalie') {
        const newPlayer = {
          ...info,
          ...player,
          name: playerName,
          creationDate: new Date().toISOString(),
          attributes: { ...goalie },
        };

        const builds = storedBuilds
          ? [...storedBuilds, newPlayer]
          : [newPlayer];

        localStorage.setItem('builds', JSON.stringify(builds));
        setTokenizedPlayer(tokenizePlayer(newPlayer));
        fetchStoredBuilds();
        setPlayer(newPlayer as Player);
      } else {
        const newPlayer = {
          ...info,
          ...player,
          name: playerName,
          creationDate: new Date().toISOString(),
          attributes: { ...skater },
        };

        const builds = storedBuilds
          ? [...storedBuilds, newPlayer]
          : [newPlayer];

        localStorage.setItem('builds', JSON.stringify(builds));
        setTokenizedPlayer(tokenizePlayer(newPlayer));
        fetchStoredBuilds();
        setPlayer(newPlayer as Player);
      }

      addToast({
        title: `Saved`,
        status: 'success',
      });
    },
    [
      addToast,
      fetchStoredBuilds,
      player,
      playerName,
      storedBuilds,
      tokenizePlayer,
    ],
  );

  const [isCopying, setIsCopying] = useState(false);

  const copyTokenizedURI = useCallback(async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(
        `${window.location.origin}/player/build?token=${tokenizedPlayer}`,
      );
      setIsCopying(false);
      addToast({
        title: `Copied`,
        status: 'success',
      });
    } catch {}
  }, [addToast, tokenizedPlayer]);

  const setActivePlayer = useCallback(
    (player: Player, skipTokenize?: boolean) => {
      setPlayer(player);
      if (!skipTokenize) setTokenizedPlayer(tokenizePlayer(player));
    },
    [tokenizePlayer],
  );

  const clearSavedPlayer = useCallback(
    (creationDate: string) => {
      if (storedBuilds && storedBuilds.length > 1) {
        const filteredBuilds = storedBuilds.filter(
          (build) => build.creationDate !== creationDate,
        );
        localStorage.setItem('builds', JSON.stringify(filteredBuilds));
        setStoredBuilds(filteredBuilds);
      } else {
        localStorage.removeItem('builds');
        setStoredBuilds(undefined);
      }
      setTokenizedPlayer(undefined);
      setActivePlayer(defaultPlayer, true);
    },
    [setActivePlayer, storedBuilds],
  );

  const MemoizedEditAttributesForm = memo(() => (
    <EditAttributesForm
      player={player}
      attributeFormType="Create"
      season={Infinity}
      onSubmitCallback={onSubmitCallback}
      onCancel={onCancel}
    />
  ));

  return (
    <PageWrapper title="Player Build Tool" className="flex w-full flex-col">
      <PageHeading className="mb-4">SHL Player Build Tool</PageHeading>
      <div className="mb-4 grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 p-2 font-mont">
        <FormControl>
          <FormLabel>Build Name</FormLabel>
          <Input type="text" onBlur={(e) => setPlayerName(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>TPE</FormLabel>
          <Input
            min={155}
            max={2200}
            type="number"
            onChange={(e) =>
              setPlayer((prev) => ({
                ...prev,
                totalTPE:
                  Number(e.target.value) < 2200 ? Number(e.target.value) : 2200,
              }))
            }
            value={player.totalTPE}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Position</FormLabel>
          <Select
            onChange={(e) => changePosition(e.target.value as Position)}
            value={player.position}
            name="position"
          >
            {PLAYER_INFO_OPTIONS.POSITIONS.map((position) => (
              <option value={position} key={`position-select-${position}`}>
                {position}
              </option>
            ))}
          </Select>
        </FormControl>
      </div>
      {storedBuilds?.length && (
        <div className="mb-4 flex items-center space-x-4 px-2">
          <div className="w-1/2">
            <Select
              onChange={(e) => {
                if (e.target.value)
                  setActivePlayer(
                    storedBuilds.find(
                      (build) => build.creationDate === e.target.value,
                    ) as Player,
                  );
              }}
              value={player.creationDate}
              name="build"
            >
              <option value="">Select a stored build to load..</option>
              {storedBuilds.map((player) => (
                <option value={player.creationDate} key={player.creationDate}>
                  {player.name} -{' '}
                  {new Date(player.creationDate).toLocaleString()}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            colorScheme="red"
            onClick={() => clearSavedPlayer(player.creationDate)}
            className="w-1/2"
          >
            Clear Saved Build
          </Button>
        </div>
      )}
      {tokenizedPlayer && (
        <div className="mb-4 p-2">
          <Button
            variant="outline"
            className="w-full"
            isLoading={isCopying}
            colorScheme="green"
            onClick={copyTokenizedURI}
            leftIcon={<CopyIcon />}
          >
            Copy Shareable Link
          </Button>
        </div>
      )}
      <MemoizedEditAttributesForm />
    </PageWrapper>
  );
};
