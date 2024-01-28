import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  IconButton,
  Input,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CopyButton } from 'components/common/CopyButton';
import { PageWrapper } from 'components/common/PageWrapper';
import { UserAlerts } from 'components/common/UserAlerts';
import { ActivityButtons } from 'components/playerForms/activityForms/ActivityButtons';
import { AttributeFormTypes } from 'components/playerForms/attributeForms/attributeFormFlags';
import { FullPlayerSheet } from 'components/playerForms/common/FullPlayerSheet';
import {
  AttributeChange,
  EditAttributesForm,
} from 'components/playerForms/editAttributes/EditAttributesForm';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useGetCappedTPE } from 'hooks/useGetCappedTPE';
import { useRetirementMutation } from 'hooks/useRetirementMutation';
import { useSeason } from 'hooks/useSeason';
import { useUpdateEvents } from 'hooks/useUpdateEvents';
import { MAX_REDISTRIBUTION_TPE, SHL_GENERAL_DISCORD } from 'lib/constants';
import { useRouter } from 'next/router';
import DiscordLogo from 'public/discord.svg';
import { useCallback, useContext, useEffect, useState } from 'react';
import { GoalieAttributes, Player, SkaterAttributes } from 'typings';
import { mutate } from 'utils/query';

export default () => {
  const router = useRouter();
  const { loggedIn, session } = useSession();
  const queryClient = useQueryClient();
  const { player, loading, status } = useCurrentPlayer();
  const { updateFlags } = useUpdateEvents(player?.pid);
  const { season } = useSeason();
  const [isEditingAttributes, setIsEditingAttributes] =
    useState<boolean>(false);
  const [attributeFormType, setAttributeFormType] =
    useState<Exclude<AttributeFormTypes, 'Create'>>('Update');
  const { addToast } = useContext(ToastContext);
  const [isRetirementModalOpen, setIsRetirementModalOpen] = useState(false);
  const [retirementConfirmationText, setRetirementConfirmationText] =
    useState('');

  const setEditingForm = useCallback(
    (type: Exclude<AttributeFormTypes, 'Create'>) => {
      setAttributeFormType(type);
      setIsEditingAttributes(true);
    },
    [],
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [isEditingAttributes]);

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/');
    }

    if (loggedIn && !loading) {
      if (status === 'retired' || status === 'denied') {
        router.replace('/create');
      }
    }
  }, [loading, loggedIn, router, status]);

  const updatePlayer = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/update', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEdit = useCallback(
    async (
      changes: AttributeChange[],
      info: Partial<Player>,
      goalie?: Partial<GoalieAttributes>,
      skater?: Partial<SkaterAttributes>,
    ) => {
      setIsSubmitting(true);
      updatePlayer.mutate(
        {
          type: attributeFormType,
          changes,
          info,
          goalie,
          skater,
        },
        {
          onError: (e) => {
            setIsSubmitting(false);
            addToast({
              title: `Changes not saved`,
              description: `We were unable to perform your ${
                attributeFormType === 'Redistribute'
                  ? 'redistribution'
                  : attributeFormType.toLowerCase()
              }. Please try again.`,
              status: 'error',
            });
            throw new Error(`error: ${e}`);
          },
          onSettled: () => {
            setIsSubmitting(false);
            setIsEditingAttributes(false);
            addToast({
              title: `Player successfully updated`,
              description: `Your attribute changes for your ${
                attributeFormType === 'Redistribute'
                  ? 'redistribution'
                  : attributeFormType.toLowerCase()
              } have been applied.`,
              status: 'success',
            });
            queryClient.invalidateQueries({ queryKey: ['myPlayerInfo'] });
          },
        },
      );
    },
    [attributeFormType, queryClient, addToast, updatePlayer],
  );

  const { submitRetire, isSubmitting: isRetirementSubmitting } =
    useRetirementMutation(player?.pid, 'retire');

  const handleRetirement = useCallback(
    () => submitRetire().then(() => setIsRetirementModalOpen(false)),
    [submitRetire],
  );

  const { totalTPE, isCappedTPE } = useGetCappedTPE(player, season);

  return (
    <>
      <PageWrapper
        title="My Player"
        className="flex flex-col"
        loading={loading}
      >
        {player && (status === 'active' || status === 'pending') && (
          <>
            {status === 'pending' ? (
              <>
                <Alert
                  className="mb-4"
                  status="info"
                  variant="top-accent"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <AlertIcon />

                  <AlertTitle>Your player is awaiting approval</AlertTitle>
                  <AlertDescription fontSize="md" className="flex">
                    <div>
                      {player.name} is awaiting approval by the Head Office.
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Link
                        className="text-lg font-bold"
                        href={SHL_GENERAL_DISCORD}
                        isExternal
                      >
                        To follow-up on your submission, join our Discord.
                        <div className="mt-2 flex justify-center">
                          <DiscordLogo className="max-h-10" />
                        </div>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
                <FullPlayerSheet player={player} readOnly={true} />
              </>
            ) : (
              <>
                {isEditingAttributes ? (
                  <EditAttributesForm
                    player={player}
                    attributeFormType={attributeFormType}
                    season={season}
                    onSubmitCallback={submitEdit}
                    isSubmitting={isSubmitting}
                    onCancel={() => setIsEditingAttributes(false)}
                  />
                ) : (
                  <>
                    <UserAlerts />
                    <FullPlayerSheet
                      player={player}
                      activityMenu={<ActivityButtons />}
                      attributeMenu={
                        <Menu size="sm">
                          <MenuButton
                            as={IconButton}
                            aria-label="Attribute Updates, Regressions or Redistributions"
                            icon={<HamburgerIcon />}
                          />
                          <MenuList>
                            <MenuItem
                              isDisabled={player.bankedTPE <= 0 || isCappedTPE}
                              onClick={() => setEditingForm('Update')}
                            >
                              Update
                            </MenuItem>
                            <MenuItem
                              isDisabled={player.appliedTPE <= totalTPE}
                              onClick={() => setEditingForm('Regression')}
                            >
                              Regress
                            </MenuItem>
                            <MenuItem
                              isDisabled={
                                player.usedRedistribution >=
                                  MAX_REDISTRIBUTION_TPE || player.bankedTPE < 0
                              }
                              onClick={() => setEditingForm('Redistribute')}
                            >
                              Redistribute
                            </MenuItem>
                            <MenuItem
                              isDisabled={player.appliedTPE > player.totalTPE}
                              onClick={() => setIsRetirementModalOpen(true)}
                            >
                              <div>Retire</div>
                            </MenuItem>
                            {player.appliedTPE > player.totalTPE && (
                              <Text
                                className="block px-3 text-xs opacity-100"
                                textColor="red"
                              >
                                Regress to enable Retirement
                              </Text>
                            )}
                          </MenuList>
                        </Menu>
                      }
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </PageWrapper>
      <Modal
        size="lg"
        isOpen={isRetirementModalOpen}
        onClose={() => setIsRetirementModalOpen(false)}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Retire Player</ModalHeader>
          <ModalCloseButton isDisabled={isRetirementSubmitting} />
          <ModalBody>
            <Alert variant="subtle" status="error" className="mb-4">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Are you sure you want to retire?
                {updateFlags.unRetirementProcessed
                  ? ` Since you have already unretired this player, this action will be immediate and irreversible.`
                  : ` You will have 7 days to change
                your mind if you haven't yet created a new player. If you
                unretire there will be a 15% TPE penalty applied to your player.`}
                <br />
                Enter your player name below to proceed.
                <CopyButton
                  className="ml-2"
                  aria-label="Copy player name to clipboard"
                  colorScheme="blackAlpha"
                  size="sm"
                  variant="unstyled"
                  value={player?.name ?? ''}
                />
              </AlertDescription>
            </Alert>
            <Input
              onChange={(e) =>
                setRetirementConfirmationText(e.currentTarget.value)
              }
            ></Input>
          </ModalBody>
          <ModalFooter className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              isDisabled={isRetirementSubmitting}
              onClick={() => setIsRetirementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="button"
              className="w-1/2"
              isDisabled={
                retirementConfirmationText !== player?.name ||
                isRetirementSubmitting
              }
              isLoading={isRetirementSubmitting}
              onClick={handleRetirement}
            >
              Retire Player
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
