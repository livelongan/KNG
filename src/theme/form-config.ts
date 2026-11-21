export const formThemeConfig = {
  input: {
    size: "small",
    variant: "outlined",
    width: 450,
    maxWidth: "100%",
    notched: false,
    borderRadius: 0,
    outlineBorderWidth: 1,
  },
  label: {
    fontSize: "0.9375rem",
    fontWeight: 500,
    focusFontWeight: 600,
    color: "var(--text-primary)",
    shrink: true,
    disableAnimation: true,
    position: "static",
    transform: "none",
    maxWidth: "100%",
    pointerEvents: "auto",
  },
} as const;
