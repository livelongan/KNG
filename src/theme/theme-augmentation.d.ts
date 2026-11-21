import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      barBackground: string;
      cardBackground: string;
      pageBackground: string;
    };
  }

  interface ThemeOptions {
    custom?: Partial<Theme["custom"]>;
  }
}
