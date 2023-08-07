import React, { useState } from 'react'
import { Box, Snackbar, Button } from '@material-ui/core'


const SnackbarPopUp = ({ message, onCloseCb }) => {
    const [open, setOpen] = React.useState(!!message);

    const handleClose = () => {
        setOpen(false);
        onCloseCb?.();
    }

    return (
        <Box sx={{ width: 400 }}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                onClose={handleClose}
                message={message}
                autoHideDuration={6000}
                action={
                    <Button color="secondary" size="small" onClick={handleClose}>
                        Ok
                    </Button>
                }
            />
        </Box>
    );

}

export default SnackbarPopUp
