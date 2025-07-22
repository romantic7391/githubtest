import { Loader, LoadingOverlay, Stack, Text } from '@mantine/core';

export default function AuthLoadingOverlay({ isLoading, message }: { isLoading: boolean; message: string }) {
  return (
    <LoadingOverlay
      visible={isLoading}
      zIndex={1000}
      overlayProps={{
        blur: 2,
        radius: 'sm',
      }}
      loaderProps={{
        children: (
          <Stack align="center">
            <Loader />
            <Text>{message}</Text>
          </Stack>
        ),
      }}
    />
  );
}
