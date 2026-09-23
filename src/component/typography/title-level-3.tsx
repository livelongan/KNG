import { observer } from 'mobx-react-lite';
import { TextNormal, type TextNormalProps } from './text-normal';

type TitleLevel3Props = TextNormalProps & { children: React.ReactNode };

export const TitleLevel3 = observer(
  ({ children, className, ...props }: TitleLevel3Props) => {
    return (
      <TextNormal
        variant="h3"
        {...props}
        className={`title-level-3 ${className ?? ''}`.trim()}
        replaceClassName
      >
        {children}
      </TextNormal>
    );
  },
);
