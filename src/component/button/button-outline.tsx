import { observer } from 'mobx-react-lite'
import { ButtonNormal, type ButtonNormalProps } from './button-normal'

type ButtonOutlinedProps = ButtonNormalProps & { children: React.ReactNode }

export const ButtonOutlined = observer(({ children, className, ...props }: ButtonOutlinedProps) => {
  return (
    <ButtonNormal
      variant="outlined"
      {...props}
      className={`button-outline ${className ?? ''}`.trim()}
      replaceClassName
    >
      {children}
    </ButtonNormal>
  )
})
