import { observer } from 'mobx-react-lite';
import { TextNormal, type TextNormalProps } from './text-normal';

type TextSmallProps = TextNormalProps & { children: React.ReactNode };

export const TextSmall = observer(
  ({ children, className, sx, ...props }: TextSmallProps) => {
    return (
      <TextNormal
        variant="body2"
        {...props}
        className={`text-small ${className ?? ''}`.trim()}
        replaceClassName
        sx={{ fontFamily: 'var(--small-font-family)', ...sx }}
      >
        {children}
      </TextNormal>
    );
  },
);
