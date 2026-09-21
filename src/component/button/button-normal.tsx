import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { observer } from 'mobx-react-lite';

export type ButtonNormalProps = ButtonProps & {
  children: React.ReactNode;
  to?: string;
  replaceClassName?: boolean;
};

export const ButtonNormal = observer(
  ({
    children,
    className,
    replaceClassName,
    loading,
    loadingPosition,
    ...props
  }: ButtonNormalProps) => {
    const mergedClass = !replaceClassName
      ? `button-normal ${className ?? ''}`.trim()
      : className;
    const resolvedLoadingPosition =
      loading && loadingPosition == null ? 'start' : loadingPosition;

    return (
      <Button
        className={mergedClass}
        loading={loading}
        loadingPosition={resolvedLoadingPosition}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
