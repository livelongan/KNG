import { Box } from '@mui/material'
import { observer } from 'mobx-react-lite'

type IProps = { children?: React.ReactNode }

export const RootWrapper = observer(({ children }: IProps) => {
  return (
    <Box
      className={'root-wrapper'}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 260ms ease',
        background: (theme) => theme.custom.pageBackground,
      }}
    >
      {children}
    </Box>
  )
})
