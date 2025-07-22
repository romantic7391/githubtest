'use client';

import useIsMobile from '@/app/_hooks/useIsMobile';
import { Carousel } from '@mantine/carousel';
import { Box, Container, Flex, Paper, Stack } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <Container fluid w="100vw" h="100vh" bg="blue.1" p={0} m={0}>
      <Paper shadow="md" h="100%">
        <Flex h="100%">
          <Flex h="100%" flex={1} justify="center">
            <Stack w="100%" h="100%" px="xl" pb={80} maw={450} justify="center" gap={60}>
              {children}
            </Stack>
          </Flex>

          {!isMobile && (
            <Box bg="blue.6" flex={2}>
              <Carousel
                h="100%"
                withControls={false}
                emblaOptions={{
                  loop: true,
                }}
                plugins={[Autoplay({ delay: 5000 })]}></Carousel>
            </Box>
          )}
        </Flex>
      </Paper>
    </Container>
  );
}
