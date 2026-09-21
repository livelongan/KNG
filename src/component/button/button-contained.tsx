import { observer } from 'mobx-react-lite';
import { ButtonNormal } from './button-normal';
import type { ButtonNormalProps } from './button-normal';

type ButtonContainedProps = ButtonNormalProps & { children: React.ReactNode };

export const ButtonContained = observer(
  ({ children, className, ...props }: ButtonContainedProps) => (
    <ButtonNormal
      variant="contained"
      {...props}
      className={`button-contained ${className ?? ''}`.trim()}
    >
      {children}
    </ButtonNormal>
  ),
);
