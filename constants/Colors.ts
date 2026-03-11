/**
 * MeuIA Color System — based on Figma prototype
 * Dark navy theme with purple-to-blue gradient accents
 */
export const Colors = {
  dark: {
    // Backgrounds
    background: '#12121a',
    surface: 'rgba(18,18,26,0.98)', // Bottom nav
    surfaceElevated: 'rgba(40,40,55,0.9)', // Input container
    border: 'rgba(255,255,255,0.08)', // Input border
    borderNav: 'rgba(255,255,255,0.06)', // Bottom nav border
    borderHeader: 'rgba(255,255,255,0.05)',

    // Text
    text: 'rgba(240,240,255,0.92)', // AI text
    textSecondary: 'rgba(140,140,165,0.7)', // Input placeholder
    textMuted: '#5a5a6a', // inactive icon and label

    // Accent
    primary: '#a78bfa', // accent text and active icons
    primaryLight: '#a78bfa',
    gradientStart: 'rgba(88,60,180,0.35)', // AI Bubble Start
    gradientEnd: 'rgba(60,60,140,0.25)', // AI Bubble End
    bubbleBorder: 'rgba(167,139,250,0.25)',

    // Chat
    chatUserBubble: 'rgba(240, 240, 255, 0.92)',
    chatUserText: '#1a1a2e',
    chatAiText: 'rgba(240,240,255,0.92)',

    // Mic FAB
    micFabStart: '#8b5cf6',
    micFabMid: '#6366f1',
    micFabEnd: '#3b82f6',

    // Status / Agent Colors
    error: '#FF4466',
    agentFinancier: '#34d399',
    agentSecretary: '#60a5fa',

    // Legacy tokens to fix TS errors in other screens
    agentFinancial: '#4ADE80',
    agentCalendar: '#4E6AFF',
    agentEmail: '#FFB833',
    agentGeneral: '#9999B0',
    activeDot: '#4ADE80',
    micGlowOuter: 'rgba(85, 81, 254, 0.4)',
    micGlowInner: 'rgba(85, 81, 254, 0.6)',
    micFab: '#5551FE',
    success: '#4ADE80',
    warning: '#FFB833',
  },
} as const;

export type ColorScheme = typeof Colors.dark;
