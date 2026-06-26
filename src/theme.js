import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0f6fb8",
      dark: "#084a7e",
      light: "#d9eefb",
    },
    secondary: {
      main: "#0f9f8f",
      dark: "#087568",
      light: "#dff7f4",
    },
    success: {
      main: "#3a9b62",
    },
    background: {
      default: "#f7fbfd",
      paper: "#ffffff",
    },
    text: {
      primary: "#14324a",
      secondary: "#52697a",
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: 0,
      lineHeight: 1.08,
    },
    h2: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h3: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 46,
          boxShadow: "none",
        },
        contained: {
          boxShadow: "0 10px 24px rgba(15, 111, 184, 0.18)",
          "&:hover": {
            boxShadow: "0 12px 28px rgba(15, 111, 184, 0.22)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
  },
});
