import { Position } from 'components/playerForms/constants';
import SQL from 'sql-template-strings';
import { InternalSkaterAttributes } from 'typings/portal-db';

export const getSkaterChangeQuery = (
  newPosition: Position,
  oldPosition: Position,
  playerUpdateID: string | number,
  attributes: InternalSkaterAttributes,
) => {
  const FORWARD_POSITIONS = ['Center', 'Right Wing', 'Left Wing'];
  const DEFENSE_POSITIONS = ['Right Defense', 'Left Defense'];

  if (newPosition === 'Goalie' || oldPosition === 'Goalie') {
    return SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${playerUpdateID};`;
  }

  if (
    FORWARD_POSITIONS.includes(oldPosition) &&
    DEFENSE_POSITIONS.includes(newPosition)
  ) {
    if (attributes.shootingAccuracy > 12 || attributes.faceoffs > 12) {
      return SQL`UPDATE skaterAttributes SET `
        .append(
          attributes.shootingAccuracy > 12
            ? attributes.faceoffs > 12
              ? SQL`shootingAccuracy=12, `
              : SQL`shootingAccuracy=12 `
            : '',
        )
        .append(attributes.faceoffs > 12 ? SQL`faceoffs=12 ` : '')
        .append(SQL`WHERE playerUpdateID=${playerUpdateID}`);
    }
  } else if (
    DEFENSE_POSITIONS.includes(oldPosition) &&
    FORWARD_POSITIONS.includes(newPosition)
  ) {
    if (attributes.shotBlocking > 12 || attributes.shootingRange > 12) {
      return SQL`UPDATE skaterAttributes SET `
        .append(
          attributes.shotBlocking > 12
            ? attributes.shootingRange > 12
              ? SQL`shotBlocking=12, `
              : SQL`shotBlocking=12 `
            : '',
        )
        .append(attributes.shootingRange > 12 ? SQL`shootingRange=12 ` : '')
        .append(SQL` WHERE playerUpdateID=${playerUpdateID}`);
    }
  }
  return SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${playerUpdateID};`;
};
