import { observer } from "mobx-react-lite";
import { ButtonNormal } from "./button-normal";
import type { ButtonNormalProps } from "./button-normal";

type ButtonTextProps = ButtonNormalProps & { children: React.ReactNode };

export const ButtonText = observer(
  ({ children, className, ...props }: ButtonTextProps) => (
    <ButtonNormal
      variant="text"
      {...props}
      className={`button-flat ${className ?? ""}`.trim()}
    >
      {children}
    </ButtonNormal>
  ),
);
