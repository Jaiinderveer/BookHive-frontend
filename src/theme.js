import { createTheme } from '@mui/material/styles'

/*
 * BookHive design system.
 *
 * Visual identity: a deep indigo/ink primary with a warm brass accent — the
 * palette of a serious reference library rather than a generic SaaS blue.
 * Surfaces are near-neutral with a faint warm cast so the accent never fights
 * the background, borders carry the structure instead of large shadows, and
 * radii stay moderate (10–14px) so the UI reads as a tool, not a toy.
 */

// Ink: the structural neutral. Very slightly warm so paper feels like paper.
const ink = {
  50: '#f7f7f9',
  100: '#eeeef3',
  200: '#e0e0e8',
  300: '#c7c7d4',
  400: '#9797ab',
  500: '#6f6f85',
  600: '#54546a',
  700: '#3f3f52',
  800: '#2a2a38',
  900: '#1a1a24',
  950: '#111118',
}

// Indigo: the brand primary.
const indigo = {
  50: '#eef1fd',
  100: '#dfe4fb',
  200: '#c2caf7',
  300: '#9aa6f0',
  400: '#7079e4',
  500: '#5250d4',
  600: '#4239bb',
  700: '#372f96',
  800: '#2f2b78',
  900: '#242155',
  950: '#171533',
}

// Brass: the accent. Warm, low-chroma gold — used sparingly for emphasis.
const brass = {
  50: '#fdf8ed',
  100: '#f8ecd0',
  200: '#f0d79d',
  300: '#e6bc66',
  400: '#dda33f',
  500: '#c9862a',
  600: '#ab6722',
  700: '#8a4d20',
  800: '#723e21',
  900: '#61341f',
}

const lightPalette = {
  mode: 'light',
  primary: {
    main: indigo[600],
    light: indigo[100],
    dark: indigo[700],
    contrastText: '#ffffff',
    ...indigo,
  },
  secondary: {
    main: brass[500],
    light: brass[100],
    dark: brass[700],
    contrastText: '#ffffff',
    ...brass,
  },
  neutral: { ...ink },
  background: {
    // A tinted canvas behind white cards gives depth without shadows.
    default: '#f6f6f9',
    paper: '#ffffff',
    elevated: '#ffffff',
    // Extra surfaces used by the app chrome and subtle panels.
    sunken: ink[100],
    subtle: ink[50],
    sidebar: '#ffffff',
  },
  text: { primary: ink[900], secondary: ink[600], disabled: ink[400] },
  divider: ink[200],
  success: { main: '#0f7a55', light: '#dcf5ea', dark: '#0a5a3e', contrastText: '#ffffff' },
  error: { main: '#c0362c', light: '#fce8e6', dark: '#932720', contrastText: '#ffffff' },
  warning: { main: '#a76a10', light: '#fdf1dc', dark: '#7f4f0a', contrastText: '#ffffff' },
  info: { main: '#1668a8', light: '#e2f0fa', dark: '#0f4d7d', contrastText: '#ffffff' },
  action: {
    active: ink[600],
    hover: 'rgba(26, 26, 36, 0.04)',
    selected: 'rgba(66, 57, 187, 0.09)',
    disabled: 'rgba(26, 26, 36, 0.26)',
    disabledBackground: 'rgba(26, 26, 36, 0.09)',
    focus: 'rgba(66, 57, 187, 0.14)',
  },
}

const darkPalette = {
  mode: 'dark',
  primary: {
    main: indigo[300],
    light: indigo[900],
    dark: indigo[200],
    contrastText: ink[950],
    ...indigo,
  },
  secondary: {
    main: brass[300],
    light: '#3a2c13',
    dark: brass[200],
    contrastText: ink[950],
    ...brass,
  },
  neutral: { ...ink },
  background: {
    default: '#0e0e15',
    paper: '#17171f',
    elevated: '#1e1e29',
    sunken: '#0b0b11',
    subtle: '#1c1c26',
    sidebar: '#131319',
  },
  text: { primary: '#eeeef3', secondary: '#a2a2b5', disabled: '#6f6f85' },
  divider: 'rgba(199, 199, 212, 0.14)',
  success: { main: '#4fc48f', light: '#0d3527', dark: '#7ad9ae', contrastText: ink[950] },
  error: { main: '#f08379', light: '#3d1613', dark: '#f6a9a2', contrastText: ink[950] },
  warning: { main: '#e0ab55', light: '#3a2a0f', dark: '#eec27f', contrastText: ink[950] },
  info: { main: '#6bb6e8', light: '#0f2b3d', dark: '#9ad0f2', contrastText: ink[950] },
  action: {
    active: '#a2a2b5',
    hover: 'rgba(238, 238, 243, 0.06)',
    selected: 'rgba(154, 166, 240, 0.14)',
    disabled: 'rgba(238, 238, 243, 0.3)',
    disabledBackground: 'rgba(238, 238, 243, 0.1)',
    focus: 'rgba(154, 166, 240, 0.2)',
  },
}

const shape = { borderRadius: 12 }

/*
 * Type scale. Sizes are explicit rather than inherited from MUI's defaults so
 * headings stay tight and the hierarchy is legible at dashboard density.
 * 'Inter' is loaded in index.html; the fallbacks match its metrics closely.
 */
const FONT_STACK =
  "'Inter', 'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO_STACK =
  "'JetBrains Mono', 'SFMono-Regular', ui-monospace, Consolas, 'Liberation Mono', Menlo, monospace"

const typography = {
  fontFamily: FONT_STACK,
  fontFamilyMonospace: MONO_STACK,
  h1: { fontSize: '2.5rem', fontWeight: 750, letterSpacing: '-0.03em', lineHeight: 1.12 },
  h2: { fontSize: '2rem', fontWeight: 720, letterSpacing: '-0.025em', lineHeight: 1.18 },
  h3: { fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.22 },
  h4: { fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
  h5: { fontSize: '1.1875rem', fontWeight: 680, letterSpacing: '-0.017em', lineHeight: 1.3 },
  h6: { fontSize: '1rem', fontWeight: 660, letterSpacing: '-0.012em', lineHeight: 1.4 },
  subtitle1: { fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.008em', lineHeight: 1.45 },
  subtitle2: { fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0em', lineHeight: 1.45 },
  body1: { fontSize: '0.9375rem', fontWeight: 400, letterSpacing: '-0.005em', lineHeight: 1.6 },
  body2: { fontSize: '0.8438rem', fontWeight: 400, letterSpacing: '0em', lineHeight: 1.55 },
  button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '-0.005em' },
  caption: { fontSize: '0.75rem', fontWeight: 450, letterSpacing: '0.005em', lineHeight: 1.45 },
  overline: {
    fontSize: '0.6875rem',
    fontWeight: 680,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    lineHeight: 1.6,
  },
}

/*
 * Shadow ramp. Deliberately shallow: elevation 1–4 covers everything the app
 * uses, and structure comes from 1px borders instead. The higher indices exist
 * only because MUI requires all 25 entries.
 */
function buildShadows(mode) {
  const rgb = mode === 'dark' ? '0, 0, 0' : '26, 26, 36'
  const s = (y, blur, a, y2, blur2, a2) =>
    `0 ${y}px ${blur}px rgba(${rgb}, ${a}), 0 ${y2}px ${blur2}px rgba(${rgb}, ${a2})`
  const scale = mode === 'dark' ? 2.1 : 1
  const k = (v) => Math.round(v * scale * 100) / 100
  const ramp = [
    'none',
    s(1, 2, k(0.04), 0, 1, k(0.03)),
    s(2, 4, k(0.05), 1, 2, k(0.04)),
    s(4, 10, k(0.06), 2, 4, k(0.04)),
    s(8, 20, k(0.08), 3, 6, k(0.05)),
    s(12, 28, k(0.1), 4, 8, k(0.06)),
    s(16, 36, k(0.11), 6, 12, k(0.07)),
    s(20, 44, k(0.12), 8, 16, k(0.08)),
    s(24, 52, k(0.14), 10, 20, k(0.09)),
  ]
  // Pad to MUI's required 25 entries, reusing the deepest defined step.
  while (ramp.length < 25) ramp.push(ramp[8])
  return ramp
}

const shadows = buildShadows('light')

export { lightPalette, darkPalette, shape, typography, shadows, FONT_STACK, MONO_STACK }

const componentOverrides = (palette, modeShadows) => {
  const isLight = palette.mode === 'light'
  // One easing for every transition in the app, so motion feels like one system.
  const ease = 'cubic-bezier(0.32, 0.72, 0, 1)'
  const focusRing = `0 0 0 3px ${palette.action.focus}`

  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: {
          height: '100%',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        body: {
          height: '100%',
          margin: 0,
          backgroundColor: palette.background.default,
          color: palette.text.primary,
          // Inter's optical sizing + tabular figures where it matters is set per
          // component; here we only enable the contextual alternates.
          fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11'",
          transition: `background-color 0.25s ${ease}, color 0.25s ${ease}`,
        },
        '#root': { height: '100%' },
        // Numeric columns and metrics should never shift width as digits change.
        '.tnum': { fontVariantNumeric: 'tabular-nums' },
        '::selection': {
          backgroundColor: isLight ? palette.primary[100] : palette.primary[900],
          color: isLight ? palette.primary[800] : palette.primary[100],
        },
        ':focus-visible': { outline: `2px solid ${palette.primary.main}`, outlineOffset: 2 },
        '::-webkit-scrollbar': { width: 11, height: 11 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          background: isLight ? 'rgba(111, 111, 133, 0.32)' : 'rgba(162, 162, 181, 0.28)',
          borderRadius: 8,
          border: '3px solid transparent',
          backgroundClip: 'content-box',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: isLight ? 'rgba(111, 111, 133, 0.5)' : 'rgba(162, 162, 181, 0.45)',
          backgroundClip: 'content-box',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          transition: `background-color 0.16s ${ease}, border-color 0.16s ${ease}, color 0.16s ${ease}, box-shadow 0.16s ${ease}, transform 0.16s ${ease}`,
          '&:active': { transform: 'translateY(0.5px)' },
          '&.Mui-focusVisible': { boxShadow: focusRing },
        },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: modeShadows[2] } },
        containedPrimary: {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          '&:hover': { backgroundColor: isLight ? palette.primary[700] : palette.primary[200] },
        },
        containedSecondary: {
          backgroundColor: palette.secondary.main,
          color: palette.secondary.contrastText,
          '&:hover': { backgroundColor: isLight ? palette.secondary[600] : palette.secondary[200] },
        },
        outlined: {
          borderColor: palette.divider,
          color: palette.text.primary,
          backgroundColor: isLight ? palette.background.paper : 'transparent',
          '&:hover': {
            borderColor: isLight ? palette.neutral[300] : 'rgba(199, 199, 212, 0.3)',
            backgroundColor: palette.action.hover,
          },
        },
        outlinedPrimary: {
          borderColor: isLight ? palette.primary[200] : 'rgba(154, 166, 240, 0.35)',
          color: palette.primary.main,
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: isLight ? palette.primary[50] : 'rgba(154, 166, 240, 0.1)',
          },
        },
        outlinedError: {
          borderColor: isLight ? 'rgba(192, 54, 44, 0.35)' : 'rgba(240, 131, 121, 0.35)',
          color: palette.error.main,
          '&:hover': { borderColor: palette.error.main, backgroundColor: palette.error.light },
        },
        text: { '&:hover': { backgroundColor: palette.action.hover } },
        sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem' },
        sizeMedium: { padding: '7px 16px' },
        sizeLarge: { padding: '10px 22px', fontSize: '0.9375rem' },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${palette.divider}`,
          boxShadow: 'none',
          borderRadius: 14,
          backgroundColor: palette.background.paper,
          backgroundImage: 'none',
          transition: `border-color 0.18s ${ease}, box-shadow 0.18s ${ease}, transform 0.18s ${ease}`,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '18px 20px 14px' },
        title: { fontSize: '0.9375rem', fontWeight: 660, letterSpacing: '-0.012em' },
        subheader: { fontSize: '0.8125rem', color: palette.text.secondary, marginTop: 2 },
        action: { margin: 0, alignSelf: 'center' },
        avatar: { marginRight: 12 },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: palette.divider },
        elevation1: { boxShadow: modeShadows[1] },
        elevation2: { boxShadow: modeShadows[2] },
        elevation3: { boxShadow: modeShadows[3] },
        elevation8: { boxShadow: modeShadows[5] },
      },
    },

    MuiTable: { styleOverrides: { root: { borderCollapse: 'separate', borderSpacing: 0 } } },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '13px 16px',
          borderBottom: `1px solid ${palette.divider}`,
          fontSize: '0.8438rem',
        },
        head: {
          fontWeight: 660,
          fontSize: '0.6875rem',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: palette.text.secondary,
          backgroundColor: isLight ? palette.background.subtle : palette.background.sunken,
          borderBottom: `1px solid ${palette.divider}`,
          whiteSpace: 'nowrap',
          padding: '11px 16px',
        },
        sizeSmall: { padding: '11px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color 0.14s ${ease}`,
          '&:last-of-type .MuiTableCell-root': { borderBottom: 'none' },
          '&.MuiTableRow-hover:hover': { backgroundColor: palette.action.hover },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          height: 24,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.005em',
        },
        label: { paddingLeft: 8, paddingRight: 8 },
        sizeSmall: { height: 22, fontSize: '0.7188rem' },
        icon: { fontSize: 14, marginLeft: 6, marginRight: -2 },
        outlined: { borderColor: palette.divider, backgroundColor: 'transparent' },
        filled: { border: '1px solid transparent' },
        colorDefault: {
          backgroundColor: isLight ? palette.background.sunken : palette.background.elevated,
          color: palette.text.secondary,
        },
        colorPrimary: {
          backgroundColor: isLight ? palette.primary[50] : 'rgba(154, 166, 240, 0.14)',
          color: isLight ? palette.primary[700] : palette.primary[200],
          borderColor: isLight ? palette.primary[100] : 'rgba(154, 166, 240, 0.22)',
        },
        colorSecondary: {
          backgroundColor: isLight ? palette.secondary[50] : 'rgba(230, 188, 102, 0.14)',
          color: isLight ? palette.secondary[700] : palette.secondary[200],
          borderColor: isLight ? palette.secondary[100] : 'rgba(230, 188, 102, 0.22)',
        },
        colorSuccess: {
          backgroundColor: palette.success.light,
          color: isLight ? palette.success.dark : palette.success.main,
          borderColor: isLight ? 'rgba(15, 122, 85, 0.18)' : 'rgba(79, 196, 143, 0.24)',
        },
        colorError: {
          backgroundColor: palette.error.light,
          color: isLight ? palette.error.dark : palette.error.main,
          borderColor: isLight ? 'rgba(192, 54, 44, 0.18)' : 'rgba(240, 131, 121, 0.24)',
        },
        colorWarning: {
          backgroundColor: palette.warning.light,
          color: isLight ? palette.warning.dark : palette.warning.main,
          borderColor: isLight ? 'rgba(167, 106, 16, 0.18)' : 'rgba(224, 171, 85, 0.24)',
        },
        colorInfo: {
          backgroundColor: palette.info.light,
          color: isLight ? palette.info.dark : palette.info.main,
          borderColor: isLight ? 'rgba(22, 104, 168, 0.18)' : 'rgba(107, 182, 232, 0.24)',
        },
      },
    },

    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: isLight ? palette.background.paper : palette.background.sunken,
          transition: `box-shadow 0.16s ${ease}, background-color 0.16s ${ease}`,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isLight ? palette.neutral[300] : 'rgba(199, 199, 212, 0.28)',
          },
          '&.Mui-focused': { boxShadow: focusRing },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: palette.primary.main,
          },
          '&.Mui-disabled': { backgroundColor: palette.action.disabledBackground },
        },
        input: {
          padding: '10px 13px',
          fontSize: '0.875rem',
          '&::placeholder': { color: palette.text.disabled, opacity: 1 },
        },
        inputSizeSmall: { padding: '9px 12px' },
        multiline: { padding: 0 },
        notchedOutline: { borderColor: palette.divider, borderWidth: 1, transition: 'border-color 0.16s' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: palette.text.secondary,
          '&.Mui-focused': { color: palette.primary.main },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginTop: 5, marginLeft: 0, fontSize: '0.75rem' } },
    },
    MuiFormLabel: { styleOverrides: { asterisk: { color: palette.error.main } } },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${palette.divider}`,
          boxShadow: modeShadows[4],
          marginTop: 6,
        },
        option: {
          borderRadius: 8,
          margin: '2px 6px',
          fontSize: '0.875rem',
          '&[aria-selected="true"]': { backgroundColor: palette.action.selected },
        },
        listbox: { padding: 6 },
        inputRoot: { paddingTop: 3, paddingBottom: 3 },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${palette.divider}`,
          boxShadow: modeShadows[8],
          backgroundImage: 'none',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: isLight ? 'rgba(26, 26, 36, 0.42)' : 'rgba(4, 4, 8, 0.65)',
          backdropFilter: 'blur(2px)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1.0625rem', fontWeight: 680, letterSpacing: '-0.015em', padding: '20px 24px 8px' },
      },
    },
    MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px 20px' } } },
    MuiDialogContentText: { styleOverrides: { root: { color: palette.text.secondary, fontSize: '0.875rem' } } },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '14px 24px 20px', gap: 8 } },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${palette.divider}`,
          backgroundColor: palette.background.paper,
          backgroundImage: 'none',
          boxShadow: 'none',
        },
        colorPrimary: { color: palette.text.primary },
      },
    },
    MuiToolbar: { styleOverrides: { root: { backgroundImage: 'none', minHeight: 60 } } },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          width: 264,
          borderRight: `1px solid ${palette.divider}`,
          backgroundColor: palette.background.sidebar,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: `background-color 0.14s ${ease}, color 0.14s ${ease}`,
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 34, color: 'inherit' } } },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: '0.875rem', fontWeight: 500 },
        secondary: { fontSize: '0.8125rem', color: palette.text.secondary },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${palette.divider}`,
          boxShadow: modeShadows[4],
          backgroundImage: 'none',
        },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          minHeight: 38,
          '&.Mui-selected': {
            backgroundColor: palette.action.selected,
            '&:hover': { backgroundColor: palette.action.selected },
          },
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 350 },
      styleOverrides: {
        tooltip: {
          borderRadius: 7,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 9px',
          backgroundColor: isLight ? palette.neutral[900] : palette.neutral[100],
          color: isLight ? '#ffffff' : palette.neutral[900],
        },
        arrow: { color: isLight ? palette.neutral[900] : palette.neutral[100] },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 620, fontSize: '0.8125rem', letterSpacing: '-0.01em' },
        rounded: { borderRadius: 10 },
      },
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: { '& .MuiAvatar-root': { border: `2px solid ${palette.background.paper}` } },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 11, padding: '10px 14px', fontSize: '0.8438rem', alignItems: 'center' },
        icon: { padding: 0, marginRight: 10, opacity: 1 },
        message: { padding: 0 },
        standardSuccess: {
          backgroundColor: palette.success.light,
          color: isLight ? palette.success.dark : palette.success.main,
          border: `1px solid ${isLight ? 'rgba(15, 122, 85, 0.18)' : 'rgba(79, 196, 143, 0.22)'}`,
        },
        standardError: {
          backgroundColor: palette.error.light,
          color: isLight ? palette.error.dark : palette.error.main,
          border: `1px solid ${isLight ? 'rgba(192, 54, 44, 0.18)' : 'rgba(240, 131, 121, 0.22)'}`,
        },
        standardWarning: {
          backgroundColor: palette.warning.light,
          color: isLight ? palette.warning.dark : palette.warning.main,
          border: `1px solid ${isLight ? 'rgba(167, 106, 16, 0.18)' : 'rgba(224, 171, 85, 0.22)'}`,
        },
        standardInfo: {
          backgroundColor: palette.info.light,
          color: isLight ? palette.info.dark : palette.info.main,
          border: `1px solid ${isLight ? 'rgba(22, 104, 168, 0.18)' : 'rgba(107, 182, 232, 0.22)'}`,
        },
        outlinedSuccess: { borderColor: palette.success.main, color: palette.success.main },
        outlinedError: { borderColor: palette.error.main, color: palette.error.main },
        outlinedWarning: { borderColor: palette.warning.main, color: palette.warning.main },
        outlinedInfo: { borderColor: palette.info.main, color: palette.info.main },
      },
    },
    MuiAlertTitle: { styleOverrides: { root: { fontWeight: 660, fontSize: '0.875rem', marginBottom: 2 } } },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 11, boxShadow: modeShadows[5] } } },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 42,
          padding: '10px 14px',
          color: palette.text.secondary,
          '&.Mui-selected': { color: palette.primary.main },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 42, borderBottom: `1px solid ${palette.divider}` },
        indicator: { height: 2, borderRadius: '2px 2px 0 0' },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: `background-color 0.14s ${ease}, color 0.14s ${ease}`,
          '&.Mui-focusVisible': { boxShadow: focusRing },
        },
        sizeSmall: { padding: 6 },
      },
    },

    MuiDivider: { styleOverrides: { root: { borderColor: palette.divider } } },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: {
        root: {
          backgroundColor: isLight ? 'rgba(26, 26, 36, 0.07)' : 'rgba(238, 238, 243, 0.08)',
          borderRadius: 7,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 6, backgroundColor: isLight ? palette.background.sunken : palette.background.elevated },
        bar: { borderRadius: 99 },
      },
    },
    MuiCircularProgress: { defaultProps: { thickness: 4 } },

    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${palette.divider}`,
          backgroundColor: palette.background.paper,
          backgroundImage: 'none',
          '&:before': { display: 'none' },
          '&:not(:last-child)': { marginBottom: 8 },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 48,
          padding: '0 16px',
          '& .MuiAccordionSummary-expandIconWrapper': { color: palette.text.secondary },
        },
        content: { margin: '10px 0' },
      },
    },
    MuiAccordionDetails: { styleOverrides: { root: { padding: '0 16px 16px' } } },
  }
}

export function createAppTheme(mode = 'light') {
  const palette = mode === 'dark' ? darkPalette : lightPalette
  const modeShadows = buildShadows(palette.mode)
  return createTheme({
    palette,
    shape,
    typography,
    shadows: modeShadows,
    components: componentOverrides(palette, modeShadows),
  })
}

export default createAppTheme()
