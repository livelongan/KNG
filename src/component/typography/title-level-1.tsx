import { observer } from 'mobx-react-lite';
import { TextNormal, type TextNormalProps } from './text-normal';

type TitleLevel1Props = TextNormalProps & { children: React.ReactNode };

export const TitleLevel1 = observer(
  ({ children, className, ...props }: TitleLevel1Props) => {
    return (
      <TextNormal
        variant="h1"
        {...props}
        className={`title-level-1 ${className ?? ''}`.trim()}
        replaceClassName
      >
        {children}
      </TextNormal>
    );
  },
);
