import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * The app's design system, ported wholesale onto Chakra v3.
 *
 * The palette is unchanged from the Tailwind version and stays deliberate:
 * brown Italian tourist-heritage road signage for the surfaces and headers,
 * Montelupo majolica glaze colours (cobalt / antimony / manganese / tin) for
 * everything that carries meaning. Explicitly NOT cream+serif+terracotta.
 *
 * Two layers, same as before:
 *   `tokens.colors.*`         — raw brand colours. Fixed pairings only (a chip
 *                               fill and its text colour), never theme-reactive.
 *   `semanticTokens.colors.*` — the ones components actually use. Every one has
 *                               a `_dark` value, so no component ever branches
 *                               on colour mode.
 *
 * Chakra's own core semantic tokens (`bg`, `fg`, `border`) are overridden here
 * rather than shadowed, so stock Chakra components (Dialog, Checkbox, Tabs…)
 * inherit the signage palette without per-component styling.
 */
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        signBrown: { value: '#4a3728' },
        cobalt: { value: '#1f4e8c' },
        antimony: { value: '#e3a32b' },
        manganese: { value: '#6b4f70' },
        tin: { value: '#e8eae7' },
        ink: { value: '#1a1614' },
      },

      fonts: {
        // Oswald: the condensed grotesque of Italian road signage — display
        // type and every numeral. Public Sans: humanist body face, picked for
        // how well it holds up at small sizes in direct sun.
        heading: { value: "'Oswald', 'Arial Narrow', 'Helvetica Neue Condensed', sans-serif" },
        body: { value: "'Public Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" },
      },
    },

    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: { base: '{colors.tin}', _dark: '#14100d' } },
          subtle: { value: { base: '#f5f6f3', _dark: '#211a15' } },
          muted: { value: { base: '#f5f6f3', _dark: '#211a15' } },
          panel: { value: { base: '#ffffff', _dark: '#1a1512' } },
        },
        fg: {
          DEFAULT: { value: { base: '{colors.ink}', _dark: '#f1ede6' } },
          muted: { value: { base: '#5b534c', _dark: '#b8ada0' } },
          subtle: { value: { base: '#5b534c', _dark: '#b8ada0' } },
        },
        border: {
          DEFAULT: { value: { base: '#c9cdc8', _dark: '#3a342e' } },
          muted: { value: { base: '#c9cdc8', _dark: '#3a342e' } },
          emphasized: { value: { base: '#a8ada7', _dark: '#4d463e' } },
        },

        /** The brown signage plate: page headers and anything that reads as enamel. */
        plate: {
          DEFAULT: { value: { base: '{colors.signBrown}', _dark: '#5c4632' } },
          fg: { value: { base: '#f3e9dd', _dark: '#f6efe5' } },
        },

        /** Cobalt. Every interactive affordance in the app. */
        accent: {
          DEFAULT: { value: { base: '{colors.cobalt}', _dark: '#6c9bd8' } },
          fg: { value: { base: '#ffffff', _dark: '#12233a' } },
        },
        /** Antimony gold. Stars, highlights, "the plan recommends this". */
        accentAlt: {
          DEFAULT: { value: { base: '{colors.antimony}', _dark: '#f0b750' } },
          subtle: { value: { base: 'rgb(227 163 43 / 0.2)', _dark: 'rgb(240 183 80 / 0.22)' } },
        },
        /** Manganese purple. Non-interactive measurement — the tempo meter. */
        secondary: { value: { base: '{colors.manganese}', _dark: '#9b7ca3' } },

        warn: {
          bg: { value: { base: '#fbeec9', _dark: '#3a2c10' } },
          border: { value: { base: '{colors.antimony}', _dark: '#f0b750' } },
          fg: { value: { base: '#6b4a12', _dark: '#f0c978' } },
        },
        danger: {
          DEFAULT: { value: { base: '#b3261e', _dark: '#e5645a' } },
          bg: { value: { base: '#f7e3e1', _dark: '#3a1815' } },
        },
        safe: { value: { base: '#3f6b3e', _dark: '#7cb889' } },
        /** Beach days get their own theme colour so they read as a different kind of day. */
        plaj: {
          DEFAULT: { value: { base: '#1f8a8c', _dark: '#4fc3c7' } },
          subtle: { value: { base: 'rgb(31 138 140 / 0.12)', _dark: 'rgb(79 195 199 / 0.16)' } },
        },
      },

      radii: {
        // Signage is a rectangular plate, not a soft app bubble. Overriding the
        // three layer radii squares off every stock Chakra component at once.
        l1: { value: '0.125rem' },
        l2: { value: '0.125rem' },
        l3: { value: '0.125rem' },
      },
    },

    textStyles: {
      displayXl: {
        value: { fontFamily: 'heading', fontSize: '2rem', lineHeight: 1.1, fontWeight: 600 },
      },
      displayLg: {
        value: { fontFamily: 'heading', fontSize: '1.5rem', lineHeight: 1.15, fontWeight: 600 },
      },
      displayMd: {
        value: { fontFamily: 'heading', fontSize: '1.0625rem', lineHeight: 1.25, fontWeight: 600 },
      },
      /** The small uppercase run-in label used above every section and card. */
      eyebrow: {
        value: {
          fontFamily: 'heading',
          fontSize: 'xs',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 'wide',
          lineHeight: 1.3,
        },
      },
    },

    layerStyles: {
      /** The default bordered plate every list, card and disclosure sits on. */
      card: {
        value: { borderWidth: '1px', borderColor: 'border', bg: 'bg.panel' },
      },
      /** Same, but selected — the 2px cobalt rule, inset so nothing reflows. */
      cardSelected: {
        value: { borderWidth: '2px', borderColor: 'accent', bg: 'bg.panel' },
      },
      plate: {
        value: { bg: 'plate', color: 'plate.fg' },
      },
    },

    keyframes: {
      // The one deliberate motion in the app: a price reacting when the mode
      // switch changes what it is worth. Reduced-motion zeroes the duration
      // globally below, so it degrades to an instant swap with no code path.
      pricePulse: {
        '0%': { color: 'var(--chakra-colors-accent)', transform: 'scale(1.1)' },
        '100%': { color: 'inherit', transform: 'scale(1)' },
      },
    },
  },

  globalCss: {
    html: {
      colorScheme: 'light',
      // next-themes writes the class; keeping `color-scheme` in step is what
      // makes native UI (scrollbars, form controls, the URL bar) follow.
      '&.dark': { colorScheme: 'dark' },
    },
    body: {
      bg: 'bg',
      color: 'fg',
      fontFamily: 'body',
      // The bottom bar is fixed; every screen reserves room for it instead.
      overscrollBehaviorY: 'none',
      // Print: the whole trip as a linear paper document (see PrintView). The
      // app shell is `_print={{ display: 'none' }}`; this is the safety net
      // that keeps the page itself black-on-white regardless.
      _print: { bg: 'white', color: 'black' },
    },
    '@page': { margin: '1.5cm' },
    'h1, h2, h3, h4': {
      fontFamily: 'heading',
      textWrap: 'balance',
    },
    ':focus-visible': {
      outline: '2px solid',
      outlineColor: 'accent',
      outlineOffset: '2px',
    },

    '*, *::before, *::after': {
      _motionReduce: {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
