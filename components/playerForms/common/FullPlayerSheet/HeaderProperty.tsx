import { VisuallyHidden } from '@chakra-ui/react';
import { ChangeIcon } from 'components/playerForms/changeForms/ChangeIcon';
import { ChangeTypes } from 'components/playerForms/constants';

export const HeaderProperty = ({
  label,
  property,
  changeType,
  readOnly = true,
  showDivider = false,
}: {
  label: string;
  property: string | number | null;
  changeType?: ChangeTypes;
  readOnly?: boolean;
  showDivider?: boolean;
}) => {
  return (
    <>
      <span aria-hidden="true" className="truncate font-mont">
        {property}
      </span>
      <VisuallyHidden>{`${label}: ${property}`}</VisuallyHidden>
      {!readOnly && changeType && <ChangeIcon type={changeType} />}
      {showDivider && <>&nbsp;&nbsp;|&nbsp;&nbsp;</>}
    </>
  );
};
