import { observer } from "mobx-react-lite";
import { TextNormal, type TextNormalProps } from "./text-normal";

type TextSecondaryProps = TextNormalProps & { children: React.ReactNode };
export const TextSecondary = observer(
  ({ children, className, sx, ...props }: TextSecondaryProps) => {
    return (
      <TextNormal
        variant={"body1"}
        color="textSecondary"
        {...props}
        className={`text-secondary ${className ?? ""}`.trim()}
        replaceClassName
        sx={{ ...sx }}
      >
        {children}
      </TextNormal>
    );
  },
);
