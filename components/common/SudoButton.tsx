import { LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { IconButton, Tooltip } from '@chakra-ui/react';
import classnames from 'classnames';
import { useCookie } from 'hooks/useCookie';

export const SudoButton = () => {
  const [sudo, setSudo] = useCookie<'true' | 'false'>('sudo', 'false');
  const sudoIsTrue = sudo === 'true';

  return (
    <Tooltip label={`Toggle sudo mode ${sudoIsTrue ? 'off' : 'on'}`}>
      <IconButton
        aria-label={`Toggle sudo mode ${sudoIsTrue ? 'off' : 'on'}`}
        icon={sudoIsTrue ? <LockIcon /> : <UnlockIcon />}
        onClick={() => {
          setSudo(sudoIsTrue ? 'false' : 'true');
          if (window) {
            // We need to reload in case any queries need to be rerun with new data
            window.location.reload();
          }
        }}
        size="sm"
        className={classnames(
          'hover:!text-grey100',
          sudoIsTrue
            ? '!bg-grey600 !text-grey100'
            : '!bg-grey900 !text-grey900',
        )}
      />
    </Tooltip>
  );
};
