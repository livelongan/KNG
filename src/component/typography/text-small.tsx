import { observer } from "mobx-react-lite";
import { TextNormal, type TextNormalProps } from "./text-normal";

type TextSmallProps = TextNormalProps & { children: React.ReactNode };
export const TextSmall = observer(
  ({ children, className, sx, ...props }: TextSmallProps) => {
    return (
      <TextNormal
        variant="body2"
        color="secondary"
        {...props}
        className={`text-small ${className ?? ""}`.trim()}
        replaceClassName
        sx={{
          ...sx,
          fontFamily: "var(--font-family-small)",
          lineHeight: "1.25rem",
        }}
      >
        {children}
      </TextNormal>
    );
  },
);
