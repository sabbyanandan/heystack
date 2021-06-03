import React, { memo, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { Box, BoxProps, color, Fade, Flex, Stack } from '@stacks/ui';
import { userAtom } from '@store/auth';
import { Link } from '@components/link';
import { useHover } from '@common/hooks/use-hover';
import { Caption, Text } from '@components/typography';
import { border } from '@common/utils';
import { useUser } from '@hooks/use-user';
import { truncateMiddle } from '@stacks/ui-utils';
import { useUserSession } from '@hooks/use-usersession';
import { ConnectWalletButton } from '@components/connect-wallet-button';
import { useHeyBalance } from '@hooks/use-hey-balance';
import { useCurrentAddress } from '@hooks/use-current-address';
import { UserAvatar } from '@components/user-avatar';
import { useAccountNames } from '@common/hooks/use-account-names';

const Dropdown: React.FC<BoxProps & { onSignOut?: () => void; show?: boolean }> = memo(
  ({ onSignOut, show }) => {
    return (
      <Fade in={show}>
        {styles => (
          <Flex top="100%" right={0} position="absolute" style={styles}>
            <Stack
              isInline
              _hover={{ bg: color('bg-alt') }}
              alignItems="center"
              border={border()}
              overflow="hidden"
              boxShadow="mid"
              minHeight="60px"
              minWidth="212px"
              bg={color('bg')}
              borderRadius="12px"
              p="base"
            >
              <FiLogOut color="#D4001A" />
              <Link
                _hover={{ textDecoration: 'none !important' }}
                display="inline-block"
                mb={1}
                ml={2}
                textStyle="caption.medium"
                color="red"
                onClick={() => {
                  onSignOut?.();
                }}
              >
                Disconnect
              </Link>
            </Stack>
          </Flex>
        )}
      </Fade>
    );
  }
);

const AccountNameComponent = memo(() => {
  const { user } = useUser();
  const address = useCurrentAddress();
  const names = useAccountNames(address);
  const name = names?.[0];
  return <Text mb="tight">{name || user?.username || truncateMiddle(address)}</Text>;
});

const BalanceComponent = memo(() => {
  const balance = useHeyBalance();
  return <Caption pr="tight">{balance || 0} HEY</Caption>;
});

const Menu: React.FC = memo(() => {
  const { setUser } = useUser();
  const address = useCurrentAddress();
  const userSession = useUserSession();
  const [isHovered, setIsHovered] = useState(false);
  const bind = useHover(setIsHovered);
  const handleRemoveHover = useCallback(() => setIsHovered(false), [setIsHovered]);

  const handleSignOut = useCallback(() => {
    handleRemoveHover();
    userSession.signUserOut();
    void setUser(undefined);
  }, [userSession, setUser, handleRemoveHover]);

  return (
    <Stack
      minWidth="212px"
      _hover={{
        cursor: 'pointer',
      }}
      {...bind}
    >
      <Stack alignItems="center" flexGrow={1} spacing="loose" p="base" isInline>
        <UserAvatar />
        <Stack spacing="base-tight">
          <React.Suspense fallback={<></>}>
            <AccountNameComponent />
            <Stack isInline alignItems="center">
              <BalanceComponent />
              <FiChevronDown />
            </Stack>
          </React.Suspense>
        </Stack>
      </Stack>
      <Dropdown onSignOut={handleSignOut} show={isHovered} />
    </Stack>
  );
});

export const Auth: React.FC = memo(() => {
  const [user] = useAtom(userAtom);

  return user ? (
    <Menu />
  ) : (
    <Box p="loose">
      <ConnectWalletButton />
    </Box>
  );
});
