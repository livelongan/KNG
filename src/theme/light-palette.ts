import { alpha } from "@mui/material/styles";

export const lightPaletteConfig = {
  palette: {
    mode: "light" as const,
    primary: {
      main: "#eb0249",
      light: "#ff4f86",
      dark: "#b80039",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#3d57d8",
      light: "#6f83f0",
      dark: "#2d3fa8",
      contrastText: "#ffffff",
    },
    success: {
      main: "#15803d",
      light: "#22c55e",
      dark: "#166534",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0284c7",
      light: "#38bdf8",
      dark: "#0369a1",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
      contrastText: "#1f1300",
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#991b1b",
      contrastText: "#ffffff",
    },
    background: { default: "#f5f8fc", paper: "#f3f7fc" },
    text: { primary: "#000000", secondary: "#23272f" },
    divider: alpha("#0f2945", 0.15),
    action: {
      active: alpha("#10243a", 0.72),
      hover: alpha("#0f2945", 0.08),
      selected: alpha("#0f2945", 0.14),
      disabled: alpha("#10243a", 0.38),
      disabledBackground: alpha("#10243a", 0.12),
      focus: alpha("#0f2945", 0.2),
    },
  },
  custom: {
    barBackground:
      "linear-gradient(90deg, rgba(15, 118, 110, 0.08), rgba(255, 255, 255, 0.88))",
    cardBackground:
      "linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(246, 251, 255, 0.98))",
    pageBackground:
      "radial-gradient(circle at 0% 0%, rgba(20, 184, 166, 0.16), transparent 40%), radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.14), transparent 45%), linear-gradient(180deg, #f5f8fc 0%, #edf3fb 100%)",
  },
};
