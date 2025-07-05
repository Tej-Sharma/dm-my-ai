'use client';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme/theme';
import { ReactNode } from 'react';

export default function AppWrappers({ children }: { children: ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
