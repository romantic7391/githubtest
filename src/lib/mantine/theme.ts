import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

const themeOverride = createTheme({
  fontSmoothing: true,
  white: '#FFFFFF',
  black: '#000000',
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
