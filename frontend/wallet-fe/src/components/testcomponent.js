// Creating a Custom Style
const useStyles = makeStyles({
  root: {
    background: 'linear-gradient(45deg,#FE6888,#FF8E53)',
    border: 0,
    borderRadius: 15,
    color: 'white',
    padding: '0 30px',
    margin: 5
  }
})
function StyledButton() {
  const classes = useStyles();
  return <Button className={classes.root}>Customer Styled Button</Button>
}

function CheckBoxComponent() {
  const [checked, setChecked] = useState(false);
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          color="secondary"
          // disabled
          inputProps={
            {
              "aria-label": 'secondary checkbox'
            }
          }
          icon={<SaveIcon />}
          checkedIcon={<DeleteIcon />}
        >

        </Checkbox>
      }
      label="Testing Checkbox"
    />
  )
}


<div className="App">
          <header className="App-header">
            <AppBar color="primary">
              <Toolbar>
                <IconButton 
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => setOpen(true)}
                >
                  <MenuIcon/>
                </IconButton>
                <SwipeableDrawer
                  anchor="left"
                  open={open}
                  onOpen={() => {}}
                  onClose={() => setOpen(false)}
                >
                 <List>
                   <ListItem button>
                      <ListItemText primary={'Container'} />
                   </ListItem>
                 </List>
                </SwipeableDrawer>
                <Typography variant="h6">
                   MUI THEMEING 
                </Typography>
                <Button>
                  Login
                </Button>
              </Toolbar>
            </AppBar>

            {/* By Applying Component tag in Typography, It creates that 
          mentioned element in the DOM  */}
            <Typography variant="h2" component="div">
              Welcome to Material UI
          </Typography>

            <Typography variant="subtitle1">
              Learn how to use Material UI
          </Typography>

            <Button
              // disabled
              style={{
                fontSize: 20,
                marginBottom: 10
              }}
              startIcon={<SaveIcon />}
              // endIcon={<SaveIcon/>}
              size="large"
              variant="contained"
              color="secondary">
              Material Button
        </Button>

            <ButtonGroup style={{ marginBottom: 10 }}>
              <Button
                startIcon={<SaveIcon />}
                color="primary"
                variant="contained"
              >
                Save
          </Button>

              <Button
                startIcon={<DeleteIcon />}
                color="secondary"
                variant="contained"
              >
                Discard
          </Button>

            </ButtonGroup>


            <Grid container spacing={2} justify="center">
              <Grid item xs={3} sm={6}>
                <Paper style={{ height: 75, width: '100%' }} />
              </Grid>
              <Grid item xs={3} sm={6}>
                <Paper style={{ height: 75, width: '100%' }} />
              </Grid>
              <Grid item xs={3} sm={6}>
                <Paper style={{ height: 75, width: '100%' }} />
              </Grid>
            </Grid>


            {/* <Grid container spacing={2} justify="center">
              <Grid item xs>
                <Paper style={{height: 75, width: '100%'}} />
              </Grid>
              <Grid item xs>
                <Paper style={{height: 75, width: '100%'}} />
              </Grid>
              <Grid item xs>
                <Paper style={{height: 75, width: '100%'}} />
              </Grid>
            </Grid> */}

            <CheckBoxComponent />

            <TextField
              variant="filled"
              color="secondary"
              // type="date"
              // type="time"
              type="email"
              label="Email"
              placeholder="abc@abc.com"
            />

            <StyledButton />
            <img src={logo} className="App-logo" alt="logo" />
          </header>
        </div>