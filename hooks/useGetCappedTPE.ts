import { SMJHL_ROOKIE_CAP, SMJHL_SOPHOMORE_CAP } from 'lib/constants';
import { useMemo } from 'react';
import { Player } from 'typings';

export const useGetCappedTPE = (player: Player | undefined, season: number) => {
  const currentTPECap = useMemo(() => {
    if (!player?.draftSeason || !player.currentLeague) {
      return SMJHL_ROOKIE_CAP;
    } else {
      if (player.currentLeague === 'SHL') {
        return Infinity;
      } else {
        if (season <= player.draftSeason) {
          return SMJHL_ROOKIE_CAP;
        } else {
          return SMJHL_SOPHOMORE_CAP;
        }
      }
    }
  }, [player, season]);

  const totalTPE = useMemo(() => {
    if (!player) {
      return 0;
    }

    if (!player?.draftSeason || !player.currentLeague) {
      if (player.totalTPE < SMJHL_ROOKIE_CAP) {
        return player.totalTPE;
      } else {
        return SMJHL_ROOKIE_CAP;
      }
    } else {
      if (player.currentLeague === 'SHL') {
        return player.totalTPE;
      } else {
        if (season <= player.draftSeason) {
          if (player.totalTPE < SMJHL_ROOKIE_CAP) {
            return player.totalTPE;
          } else {
            return SMJHL_ROOKIE_CAP;
          }
        } else {
          if (player.totalTPE < SMJHL_SOPHOMORE_CAP) {
            return player.totalTPE;
          } else {
            return SMJHL_SOPHOMORE_CAP;
          }
        }
      }
    }
  }, [player, season]);

  const isCappedTPE = useMemo(
    () =>
      player?.currentLeague !== 'SHL' && player?.appliedTPE === currentTPECap,
    [player?.appliedTPE, player?.currentLeague, currentTPECap],
  );

  return { totalTPE, isCappedTPE };
};
