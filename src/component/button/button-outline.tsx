import { observer } from 'mobx-react-lite';
import { ButtonNormal } from './button-normal';
import type { ButtonNormalProps } from './button-normal';

type ButtonOutlineProps = ButtonNormalProps & { children: React.ReactNode };

export const ButtonOutline = observer(
  ({ children, className, ...props }: ButtonOutlineProps) => (
    <ButtonNormal
      variant="outlined"
      {...props}
      className={`button-outline ${className ?? ''}`.trim()}
    >
      {children}
    </ButtonNormal>
  ),
);
