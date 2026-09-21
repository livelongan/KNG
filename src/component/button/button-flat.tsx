import { observer } from 'mobx-react-lite';
import { ButtonNormal } from './button-normal';
import type { ButtonNormalProps } from './button-normal';

type ButtonFlatProps = ButtonNormalProps & { children: React.ReactNode };

export const ButtonFlat = observer(
  ({ children, className, ...props }: ButtonFlatProps) => (
    <ButtonNormal
      variant="text"
      {...props}
      className={`button-flat ${className ?? ''}`.trim()}
    >
      {children}
    </ButtonNormal>
  ),
);
