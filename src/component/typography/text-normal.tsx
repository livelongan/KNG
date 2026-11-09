import { Typography, type TypographyProps } from '@mui/material'
import { observer } from 'mobx-react-lite'

export type TextNormalProps = TypographyProps & {
  children: React.ReactNode
  replaceClassName?: boolean
}

export const TextNormal = observer(
  ({ children, className, replaceClassName, component, sx, ...props }: TextNormalProps) => {
    const mergedClass = !replaceClassName ? `text-normal ${className ?? ''}`.trim() : className
    const isSemanticBold = component === 'b' || component === 'strong'
    const componentProps = component ? { component } : {}
    const resolvedSx: TypographyProps['sx'] = isSemanticBold
      ? Array.isArray(sx)
        ? [{ fontWeight: 700 }, ...sx]
        : [{ fontWeight: 700 }, sx]
      : sx

    return (
      <Typography
        variant="body1"
        className={mergedClass}
        component={'span'}
        sx={resolvedSx}
        {...componentProps}
        {...props}
      >
        {children}
      </Typography>
    )
  },
)
