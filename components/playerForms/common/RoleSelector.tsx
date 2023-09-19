import {
  Collapse,
  Alert,
  AlertIcon,
  AlertDescription,
  Select,
  FormLabel,
} from '@chakra-ui/react';
import { useMemo } from 'react';

import {
  PlayerRole,
  Position,
  DEFENDER_ROLES,
  FORWARD_ROLES,
} from '../constants';

export const RoleSelector = ({
  role,
  setRole,
  position,
}: {
  role: PlayerRole | undefined;
  setRole: (newRole: PlayerRole) => void;
  position: Position;
}) => {
  const selectOptions = useMemo(() => {
    if (position === 'Left Defense' || position === 'Right Defense') {
      return DEFENDER_ROLES;
    }
    return FORWARD_ROLES;
  }, [position]);

  return (
    <Collapse in={position !== 'Goalie'} animateOpacity>
      <div className="pb-2">
        <div className="my-2">
          <FormLabel>
            Select a role to see highlight important attributes
          </FormLabel>
          <Select
            onChange={(e) => setRole(e.currentTarget.value as PlayerRole)}
            value={role}
            placeholder="Select a Role"
          >
            {selectOptions.map((role, index) => (
              <option value={role} key={`role-defender-${index}`}>
                {role}
              </option>
            ))}
          </Select>
        </div>
        <Alert variant="subtle" status="info">
          <AlertIcon />
          <AlertDescription fontSize="md">
            Please note, the role you play will be determined by your GM. If you
            want to play a specific role, make sure to speak with your GM.
          </AlertDescription>
        </Alert>
      </div>
    </Collapse>
  );
};
