import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

import {
  Button, ButtonGroup, Checkbox, FormControlLabel,
  makeStyles, TextField, Typography, Container, Paper,
  Grid, AppBar, Toolbar, IconButton, SwipeableDrawer, List, ListItem, ListItemText 
} from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';
// import {Save as SaveIcon} from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';

import MenuIcon from '@material-ui/icons/Menu';

import { mixStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { orange } from '@material-ui/core/colors';

import 'fontsource-roboto';
import Payment from './components/Payment';
import theme from './theme';
import GlobalStyles from './components/GlobalStyles';

function App() {
  
  return (
   
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Container disableGutters maxWidth={false}>
        <Payment />
      </Container>
    </ThemeProvider>
  );
}

export default App;
