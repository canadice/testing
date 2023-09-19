import { Input, Box } from '@chakra-ui/react';
import fuzzysort from 'fuzzysort';
import { useUsers } from 'hooks/useUsers';
import { debounce } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { UserInfo } from 'typings';

export const UsernameSearch = ({
  handleClick,
  clearOnClick = false,
  position = 'fixed',
}: {
  handleClick: (user: UserInfo) => void;
  clearOnClick?: boolean;
  position?: 'absolute' | 'fixed';
}) => {
  const { users, loading } = useUsers();

  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | undefined>(
    undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedInputChange = debounce((inputValue: string) => {
    const fuzzyResults = fuzzysort.go(inputValue, users, { key: 'username' });
    const matchedUsers = fuzzyResults.map((result) => result.obj);
    setFilteredUsers(matchedUsers);
  }, 500);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      debouncedInputChange(inputValue);
    },
    [debouncedInputChange],
  );

  const handleUserChange = useCallback(
    (newUser: UserInfo) => {
      const selectedUser = users?.find(
        (user) => user.userID === newUser.userID,
      );
      if (selectedUser) {
        setSelectedUser(selectedUser);
        handleClick(selectedUser);
        if (clearOnClick && inputRef.current) {
          setSelectedUser(undefined);
          inputRef.current.value = '';
        }
        setFilteredUsers([]);
      }
    },
    [clearOnClick, handleClick, users],
  );

  return (
    <div>
      <Input
        ref={inputRef}
        type="text"
        value={selectedUser?.username}
        onChange={onInputChange}
        isDisabled={loading}
        onFocus={() => setSelectedUser(undefined)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            const possibleUser = filteredUsers.find(
              (user) =>
                user.username.toLowerCase() ===
                e.currentTarget.value.toLowerCase(),
            );
            if (possibleUser) {
              handleUserChange(possibleUser);
            }
          }
        }}
      />
      {filteredUsers.length > 0 && (
        <Box position="relative" mt={2}>
          <div
            className={`z-50 max-h-40 overflow-auto rounded border border-grey500 bg-grey100 shadow ${position}`}
          >
            {filteredUsers.map((user) => (
              <div
                key={user.userID}
                className="cursor-pointer p-2 hover:bg-grey100"
                onClick={() => handleUserChange(user)}
              >
                {user.username}
              </div>
            ))}
          </div>
        </Box>
      )}
    </div>
  );
};
