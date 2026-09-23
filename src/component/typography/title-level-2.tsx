import { observer } from 'mobx-react-lite';
import { TextNormal, type TextNormalProps } from './text-normal';

type TitleLevel2Props = TextNormalProps & { children: React.ReactNode };

export const TitleLevel2 = observer(
  ({ children, className, ...props }: TitleLevel2Props) => {
    return (
      <TextNormal
        variant="h2"
        {...props}
        className={`title-level-2 ${className ?? ''}`.trim()}
        replaceClassName
      >
        {children}
      </TextNormal>
    );
  },
);
