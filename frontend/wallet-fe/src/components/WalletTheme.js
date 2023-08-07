import React from 'react'
import { Card, CardContent } from '@material-ui/core'

function WalletTheme({ wallet }) {
    return (
        <div className='card' >
             <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <div className='cardContent'>
                    <h3>Name: </h3>
                    {wallet.name}
                </div>
                <div className='cardContent'>
                    <h3>Balance: </h3>
                    {wallet.balance}
                </div>

                <div className='cardContent'>
                    <h3>WalletId: </h3>
                    {wallet.id}
                </div>
            </CardContent>
        </Card>
        </div>  
       
    )
}

export default WalletTheme