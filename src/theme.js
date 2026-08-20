import { createTheme } from '@mui/material/styles'

// Light palette
const lightPalette = {
  mode: 'light',
  primary: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#ffffff', 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
  secondary: { main: '#f59e0b', light: '#fbbf24', dark: '#eab308', contrastText: '#1e293b', 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
  neutral: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
  background: { default: '#f8fafc', paper: '#ffffff', elevated: '#ffffff' },
  text: { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
  divider: '#e2e8f0',
  success: { main: '#059669', light: '#d1fae5', dark: '#047857', contrastText: '#ffffff' },
  error: { main: '#dc2626', light: '#fee2e2', dark: '#b91c1c', contrastText: '#ffffff' },
  warning: { main: '#d97706', light: '#fef3c7', dark: '#b45309', contrastText: '#ffffff' },
  info: { main: '#0284c7', light: '#e0f2fe', dark: '#0369a1', contrastText: '#ffffff' },
  action: { active: '#475569', hover: 'rgba(15, 23, 42, 0.04)', selected: 'rgba(59, 130, 246, 0.12)', disabled: 'rgba(15, 23, 42, 0.26)', disabledBackground: 'rgba(15, 23, 42, 0.12)' },
}

// Dark palette
const darkPalette = {
  mode: 'dark',
  primary: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6', contrastText: '#0f172a', 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
  secondary: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b', contrastText: '#0f172a', 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
  neutral: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
  background: { default: '#0b0f1a', paper: '#111827', elevated: '#1e293b' },
  text: { primary: '#f1f5f9', secondary: '#94a3b8', disabled: '#64748b' },
  divider: '#1e293b',
  success: { main: '#34d399', light: '#064e3b', dark: '#10b981', contrastText: '#0f172a' },
  error: { main: '#f87171', light: '#7f1d1d', dark: '#ef4444', contrastText: '#0f172a' },
  warning: { main: '#fbbf24', light: '#78350f', dark: '#f59e0b', contrastText: '#0f172a' },
  info: { main: '#38bdf8', light: '#075985', dark: '#0ea5e9', contrastText: '#0f172a' },
  action: { active: '#94a3b8', hover: 'rgba(241, 245, 249, 0.08)', selected: 'rgba(96, 165, 250, 0.16)', disabled: 'rgba(241, 245, 249, 0.3)', disabledBackground: 'rgba(241, 245, 249, 0.12)' },
}

// Shared shape and typography
const shape = { borderRadius: 12 }
const typography = {
  fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  h1: { fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 },
  h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
  h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
  h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  h5: { fontWeight: 600, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500, letterSpacing: '0em' },
  subtitle2: { fontWeight: 500, letterSpacing: '0.01em' },
  body1: { fontWeight: 400, letterSpacing: '0.01em' },
  body2: { fontWeight: 400, letterSpacing: '0.01em' },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  caption: { fontWeight: 400, fontSize: '0.875rem', letterSpacing: '0.01em' },
  overline: { fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' },
}

const shadows = [
  'none',
  '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 1px rgba(15, 23, 42, 0.04)',
  '0 4px 8px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
  '0 8px 16px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)',
  '0 12px 24px rgba(15, 23, 42, 0.12), 0 6px 12px rgba(15, 23, 42, 0.08)',
  '0 16px 32px rgba(15, 23, 42, 0.14), 0 8px 16px rgba(15, 23, 42, 0.1)',
  '0 20px 40px rgba(15, 23, 42, 0.16), 0 10px 20px rgba(15, 23, 42, 0.12)',
  '0 24px 48px rgba(15, 23, 42, 0.18), 0 12px 24px rgba(15, 23, 42, 0.14)',
  '0 28px 56px rgba(15, 23, 42, 0.2), 0 14px 28px rgba(15, 23, 42, 0.16)',
  '0 32px 64px rgba(15, 23, 42, 0.22), 0 16px 32px rgba(15, 23, 42, 0.18)',
  '0 36px 72px rgba(15, 23, 42, 0.24), 0 18px 36px rgba(15, 23, 42, 0.2)',
  '0 40px 80px rgba(15, 23, 42, 0.26), 0 20px 40px rgba(15, 23, 42, 0.22)',
  '0 44px 88px rgba(15, 23, 42, 0.28), 0 22px 44px rgba(15, 23, 42, 0.24)',
  '0 48px 96px rgba(15, 23, 42, 0.3), 0 24px 48px rgba(15, 23, 42, 0.26)',
  '0 52px 104px rgba(15, 23, 42, 0.32), 0 26px 52px rgba(15, 23, 42, 0.28)',
  '0 56px 112px rgba(15, 23, 42, 0.34), 0 28px 56px rgba(15, 23, 42, 0.3)',
  '0 60px 120px rgba(15, 23, 42, 0.36), 0 30px 60px rgba(15, 23, 42, 0.32)',
  '0 64px 128px rgba(15, 23, 42, 0.38), 0 32px 64px rgba(15, 23, 42, 0.34)',
  '0 68px 136px rgba(15, 23, 42, 0.4), 0 34px 68px rgba(15, 23, 42, 0.36)',
  '0 72px 144px rgba(15, 23, 42, 0.42), 0 36px 72px rgba(15, 23, 42, 0.38)',
  '0 76px 152px rgba(15, 23, 42, 0.44), 0 38px 76px rgba(15, 23, 42, 0.4)',
  '0 80px 160px rgba(15, 23, 42, 0.46), 0 40px 80px rgba(15, 23, 42, 0.42)',
  '0 84px 168px rgba(15, 23, 42, 0.48), 0 42px 84px rgba(15, 23, 42, 0.44)',
  '0 88px 176px rgba(15, 23, 42, 0.5), 0 44px 88px rgba(15, 23, 42, 0.46)',
  '0 92px 184px rgba(15, 23, 42, 0.52), 0 46px 92px rgba(15, 23, 42, 0.48)',
]

export { lightPalette, darkPalette, shape, typography, shadows }

const componentOverrides = (palette) => ({
  MuiCssBaseline: {
    styleOverrides: {
      '*': { boxSizing: 'border-box' },
      html: { height: '100%', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
      body: { height: '100%', margin: 0, backgroundColor: palette.background.default, color: palette.text.primary, transition: 'background-color 0.2s ease, color 0.2s ease' },
      '#root': { height: '100%' },
      '::-webkit-scrollbar': { width: 10, height: 10 },
      '::-webkit-scrollbar-track': { background: 'transparent' },
      '::-webkit-scrollbar-thumb': { background: palette.mode === 'light' ? 'rgba(100, 116, 139, 0.35)' : 'rgba(148, 163, 184, 0.35)', borderRadius: 8, border: '2px solid transparent', backgroundClip: 'content-box' },
      '::-webkit-scrollbar-thumb:hover': { background: palette.mode === 'light' ? 'rgba(100, 116, 139, 0.55)' : 'rgba(148, 163, 184, 0.55)', backgroundClip: 'content-box' },
    },
  },
  MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, padding: '8px 16px', fontWeight: 600 }, contained: { boxShadow: palette.mode === 'light' ? '0 1px 2px rgba(15, 23, 42, 0.05)' : '0 1px 2px rgba(0, 0, 0, 0.3)', '&:hover': { boxShadow: palette.mode === 'light' ? '0 4px 12px rgba(15, 23, 42, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.4)' } }, containedPrimary: { backgroundColor: palette.primary.main, '&:hover': { backgroundColor: palette.primary.dark } }, containedSecondary: { backgroundColor: palette.secondary.main, color: palette.secondary.contrastText, '&:hover': { backgroundColor: palette.secondary.dark } }, outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }, outlinedPrimary: { borderColor: palette.primary.main, '&:hover': { borderColor: palette.primary.dark, backgroundColor: palette.primary[50] || 'rgba(59, 130, 246, 0.08)' } }, outlinedSecondary: { borderColor: palette.secondary.main, '&:hover': { borderColor: palette.secondary.dark, backgroundColor: palette.secondary[50] || 'rgba(245, 158, 11, 0.08)' } }, sizeSmall: { padding: '6px 14px', fontSize: '0.875rem' }, sizeMedium: { padding: '8px 16px', fontSize: '0.875rem' }, sizeLarge: { padding: '12px 24px', fontSize: '1rem' } } },
  MuiCard: { styleOverrides: { root: { border: `1px solid ${palette.divider}`, boxShadow: palette.mode === 'light' ? '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)' : '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)', borderRadius: 16, backgroundColor: palette.background.paper, backgroundImage: 'none', transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, border-color 0.2s ease', '&:hover': { boxShadow: palette.mode === 'light' ? '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)' : '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)', borderColor: palette.mode === 'light' ? palette.neutral[300] : palette.neutral[700] } } } },
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' }, elevation1: { boxShadow: shadows[1] }, elevation2: { boxShadow: shadows[2] }, elevation3: { boxShadow: shadows[3] } } },
  MuiTableCell: { styleOverrides: { root: { padding: '12px 16px', borderBottom: `1px solid ${palette.divider}` }, head: { fontWeight: 600, color: palette.text.secondary, backgroundColor: palette.mode === 'light' ? palette.neutral[50] : palette.neutral[900] } } },
  MuiChip: { styleOverrides: { root: { borderRadius: 20, padding: '4px 10px', fontWeight: 500, height: 'auto' }, outlined: { borderWidth: 1.5, borderColor: palette.divider }, colorPrimary: { backgroundColor: palette.primary[100], color: palette.primary[700] }, colorSecondary: { backgroundColor: palette.secondary[100], color: palette.secondary[700] }, colorSuccess: { backgroundColor: palette.success.light, color: palette.success.dark }, colorError: { backgroundColor: palette.error.light, color: palette.error.dark }, colorWarning: { backgroundColor: palette.warning.light, color: palette.warning.dark }, colorInfo: { backgroundColor: palette.info.light, color: palette.info.dark } } },
  MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
  MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.neutral[400] } }, input: { padding: '10px 12px' }, notchedOutline: { borderColor: palette.divider, borderWidth: 1.5 } } },
  MuiInputLabel: { styleOverrides: { root: { color: palette.text.secondary, '&.Mui-focused': { color: palette.primary.main } } } },
  MuiFormHelperText: { styleOverrides: { root: { marginTop: 4, marginLeft: 0 } } },
  MuiDialog: { styleOverrides: { paper: { borderRadius: 16, boxShadow: shadows[8] } } },
  MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, paddingBottom: '8px' } } },
  MuiDialogContent: { styleOverrides: { root: { padding: '24px 24px 16px' } } },
  MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },
  MuiAppBar: { styleOverrides: { root: { borderBottom: `1px solid ${palette.divider}`, backgroundColor: palette.background.paper }, colorPrimary: { color: palette.text.primary } } },
  MuiToolbar: { styleOverrides: { root: { padding: '8px 24px', backgroundImage: 'none', minHeight: 64 } } },
  MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none', width: 260, borderRight: `1px solid ${palette.divider}`, backgroundColor: palette.background.paper } } },
  MuiListItemButton: { styleOverrides: { root: { borderRadius: 10, marginBottom: 4 } } },
  MuiListItemIcon: { styleOverrides: { root: { minWidth: 40, color: 'inherit' } } },
  MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontSize: '0.75rem', padding: '6px 10px', backgroundColor: palette.neutral[800] }, arrow: { color: palette.neutral[800] } } },
  MuiAvatar: { styleOverrides: { root: { fontWeight: 600 } } },
  MuiAlert: { styleOverrides: { root: { borderRadius: 12, padding: '12px 16px' }, standardSuccess: { backgroundColor: palette.success.light, color: palette.success.dark }, standardError: { backgroundColor: palette.error.light, color: palette.error.dark }, standardWarning: { backgroundColor: palette.warning.light, color: palette.warning.dark }, standardInfo: { backgroundColor: palette.info.light, color: palette.info.dark }, outlinedSuccess: { borderColor: palette.success.main, color: palette.success.main }, outlinedError: { borderColor: palette.error.main, color: palette.error.main }, outlinedWarning: { borderColor: palette.warning.main, color: palette.warning.main }, outlinedInfo: { borderColor: palette.info.main, color: palette.info.main } } },
  MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 12, boxShadow: shadows[8] } } },
  MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', minHeight: 40 } } },
  MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: '3px 3px 0 0' } } },
  MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
  MuiAvatarGroup: { styleOverrides: { root: { '& .MuiAvatar-root': { border: `2px solid ${palette.background.paper}`, boxShadow: shadows[1] } } } },
  MuiAccordion: { styleOverrides: { root: { borderRadius: 12, border: `1px solid ${palette.divider}`, backgroundColor: palette.background.paper, '&:before': { display: 'none' }, '&:first-of-type': { borderTopLeftRadius: 12, borderTopRightRadius: 12 }, '&:last-of-type': { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 } } } },
  MuiAccordionSummary: { styleOverrides: { root: { borderRadius: 12, '& .MuiAccordionSummary-expandIconWrapper': { color: palette.text.secondary } } } },
  MuiAccordionDetails: { styleOverrides: { root: { padding: '16px 24px 24px' } } },
})

export function createAppTheme(mode = 'light') {
  const palette = mode === 'dark' ? darkPalette : lightPalette
  return createTheme({ palette, shape, typography, shadows, components: componentOverrides(palette) })
}

export default createAppTheme()