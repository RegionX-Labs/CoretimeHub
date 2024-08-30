import { ParaDisplay } from "@/components"
import { useNetwork } from "@/contexts/network"
import { RenewableParachain } from "@/hooks"
import theme from "@/utils/muiTheme"
import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material"

interface SelectParachainProps {
  parachains: RenewableParachain[],
  activeIdx: number,
  setActiveIdx: (_: number) => void,
}

export const SelectParachain = ({ parachains, activeIdx, setActiveIdx }: SelectParachainProps) => {
  const { network } = useNetwork();

  return (
    <Stack direction='column' gap={1} margin='1rem 0' width='75%' sx={{ mx: 'auto' }}>
      <Typography
        variant='h1'
        textAlign='center'
        sx={{ color: theme.palette.common.black, mb: '1rem' }}
      >
        Select a parachain to renew
      </Typography>
      <FormControl fullWidth sx={{ mt: '1rem' }}>
        <InputLabel id='label-parachain-select'>Parachain</InputLabel>
        <Select
          sx={{ borderRadius: '1rem' }}
          labelId='label-parachain-select'
          label='Parachain'
          value={activeIdx}
          onChange={(e) => setActiveIdx(Number(e.target.value))}
        >
          {parachains.map(({ paraId }, index) => (
            <MenuItem key={index} value={index}>
              <ParaDisplay {...{ network, paraId }} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack >
  )
}
