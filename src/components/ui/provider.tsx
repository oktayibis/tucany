import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { system } from '../../theme';

/**
 * Wraps the app in the signage design system plus colour-mode handling.
 *
 * `defaultTheme="system"` reproduces the old `prefers-color-scheme` behaviour
 * exactly — the family never chose a theme, the phone did — while leaving the
 * door open for an explicit toggle later without touching any component.
 */
export function Provider({ children }: { readonly children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
