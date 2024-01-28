import { useCookie } from 'hooks/useCookie';
import config from 'lib/config';
import { isNull } from 'lodash';
import { LoginData } from 'pages/api/v1/auth/login';
import { TokenData } from 'pages/api/v1/auth/token';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type Session = {
  token: string;
};

export const SessionContext = createContext<{
  session: Session | null;
  loggedIn: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleRefresh: () => Promise<void>;
  handleLogout: () => void;
}>({
  session: null,
  loggedIn: false,
  isLoading: true,
  setSession: () => {},
  handleLogin: () => Promise.resolve(),
  handleRefresh: () => Promise.resolve(),
  handleLogout: () => {},
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [, setUserID, deleteUserID] = useCookie(config.userIDCookieName);

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data: LoginData = await response.json();

      if (data.status === 'error') {
        // username or password is incorrect
        throw new Error(data.errorMessage);
      }

      setSession({
        token: data.payload.accessToken,
      });

      if (window) {
        window.localStorage.setItem('refreshToken', data.payload.refreshToken);
      }

      setUserID(data.payload.userid.toString());
      setIsLoading(false);
    },
    [setUserID],
  );

  const handleLogout = useCallback(() => {
    if (!window) return;
    setSession(null);
    window.localStorage.removeItem('refreshToken');
    deleteUserID();
  }, [deleteUserID]);

  const isRefreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current === true) {
      setTimeout(() => (isRefreshingRef.current = false), 1000);
      return;
    }

    isRefreshingRef.current = true;

    const response = await fetch('/api/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: window.localStorage.getItem('refreshToken'),
      }),
    });

    if (!response.ok) {
      handleLogout();
      setIsLoading(false);
      isRefreshingRef.current = false;
      return;
    }

    const data: TokenData = await response.json();

    if (data.status === 'logout') {
      handleLogout();
      setIsLoading(false);
      isRefreshingRef.current = false;
      return;
    }

    setSession({
      token: data.payload.accessToken,
    });
    setIsLoading(false);
    isRefreshingRef.current = false;

    window.localStorage.setItem('refreshToken', data.payload.refreshToken);

    setUserID(data.payload.userid.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleLogout]);

  useEffect(() => {
    if (!session) {
      if (window && window.localStorage.getItem('refreshToken')) {
        handleRefresh();
        return;
      }
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loggedIn = useMemo(() => !isNull(session), [session]);

  return (
    <SessionContext.Provider
      value={{
        session,
        loggedIn,
        isLoading,
        setSession,
        handleLogin,
        handleRefresh,
        handleLogout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
