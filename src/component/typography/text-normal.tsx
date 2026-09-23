import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import { observer } from 'mobx-react-lite';

export type TextNormalProps = TypographyProps & {
  children: React.ReactNode;
  replaceClassName?: boolean;
};

export const TextNormal = observer(
  ({ children, className, replaceClassName, ...props }: TextNormalProps) => {
    const mergedClass = !replaceClassName
      ? `text-normal ${className ?? ''}`.trim()
      : className;

    return (
      <Typography variant="body1" className={mergedClass} {...props}>
        {children}
      </Typography>
    );
  },
);
