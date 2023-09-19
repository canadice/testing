import { SMJHL_ROOKIE_CAP, SMJHL_SOPHOMORE_CAP } from 'lib/constants';
import { useMemo, useState } from 'react';
import { Player } from 'typings';

export const useGetCappedTPE = (player: Player | undefined, season: number) => {
  const [currentTPECap, setCurrentTPECap] = useState(Infinity);

  const totalTPE = useMemo(() => {
    if (!player) {
      return 0;
    }

    if (!player || !player?.draftSeason || !player.currentLeague) {
      if (player.totalTPE < SMJHL_ROOKIE_CAP) {
        return player.totalTPE;
      } else {
        setCurrentTPECap(SMJHL_ROOKIE_CAP);
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
            setCurrentTPECap(SMJHL_ROOKIE_CAP);
            return SMJHL_ROOKIE_CAP;
          }
        } else {
          if (player.totalTPE < SMJHL_SOPHOMORE_CAP) {
            return player.totalTPE;
          } else {
            setCurrentTPECap(SMJHL_SOPHOMORE_CAP);
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
