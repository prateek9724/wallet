import {createMuiTheme, colors} from '@material-ui/core';
import shadow from './shadow';
import typography from './typography';

const theme = createMuiTheme({
    palette: {
        background: {
          default: '#F4F6F8',
          paper: colors.common.white
        },
        primary: {
          contrastText: '#ffffff',
          main: '#5664d2'
        },
        text: {
          primary: '#172b4d',
          secondary: '#6b778c'
        }
      },
      shadow,
      typography
})

export default theme;