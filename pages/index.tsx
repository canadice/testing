import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { PageWrapper } from '../components/common/PageWrapper';
import { useSession } from '../contexts/AuthContext';

export default () => {
  const { loggedIn } = useSession();
  // const { player, loading } = useCurrentPlayer();

  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/login');
    }

    if (loggedIn) {
      // if (player.status === 'retired' || player.status === 'denied') {
      //   router.replace('/create');
      // } else {
      //   router.replace('/player');
      // }
      router.replace('/api/hello')
    }
  }, [loggedIn, router]);

  return (
    <PageWrapper loading={loggedIn ? true : false}>
      <div />
    </PageWrapper>
  );
}

