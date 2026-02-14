import { createTheme } from '@mui/material/styles';

export const colors = {
    primary: {
        main: '#1B1464', // Navy Blue
        light: '#2d1f7a',
        dark: '#0f0b3d',
    },
    accent: {
        main: '#786D3C', // New Gold Color
        light: '#8a7d44',
        dark: '#5a512d',
    },
    text: {
        primary: '#333333',
        secondary: '#666666',
        light: '#ffffff',
    },
    background: {
        default: '#ffffff',
        paper: '#f8f9fa',
    }
};

// Create proper MUI theme
export const theme = createTheme({
    palette: {
        primary: {
            main: colors.primary.main,
            light: colors.primary.light,
            dark: colors.primary.dark,
        },
        secondary: {
            main: colors.accent.main,
            light: colors.accent.light,
            dark: colors.accent.dark,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
        },
        background: {
            default: colors.background.default,
            paper: colors.background.paper,
        },
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        h1: {
            fontWeight: 800,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
});
