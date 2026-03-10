/**
 * MeuIA Color System — based on Figma prototype
 * Dark navy theme with purple-to-blue gradient accents
 */
export const Colors = {
  dark: {
    // Backgrounds
    background: '#0F0F1A',
    surface: '#161625',
    surfaceElevated: '#1E1E2F',
    border: '#2A2A40',

    // Text
    text: '#EEEEF5',
    textSecondary: '#9999B0',
    textMuted: '#55556A',

    // Accent — purple/blue gradient endpoints
    primary: '#7B5EFF',
    primaryLight: '#9B7FFF',
    accent: '#4E6AFF',
    gradientStart: '#7B5EFF',
    gradientEnd: '#4E6AFF',

    // Status
    error: '#FF4466',
    warning: '#FFB833',
    success: '#4ADE80',

    // Agent colors
    agentFinancial: '#4ADE80',
    agentCalendar: '#4E6AFF',
    agentEmail: '#FFB833',
    agentGeneral: '#9999B0',

    // Chat
    chatUserBubble: '#E0E0E8',
    chatUserText: '#1A1A2E',
    chatAiBubble: '#1E1E2F',
    chatAiText: '#EEEEF5',

    // Active indicator
    activeDot: '#4ADE80',

    // Mic FAB glow
    micGlowOuter: 'rgba(123, 94, 255, 0.3)',
    micGlowInner: 'rgba(78, 106, 255, 0.5)',
    micFab: '#4E6AFF',
  },
} as const;

export type ColorScheme = typeof Colors.dark;
