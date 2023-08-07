import React, { useEffect, useState } from "react";
import CreateWallet from "./CreateWallet";
import { apiCall } from "../services/httpService";
import Loader from "./loader";
import WalletTheme from "./WalletTheme";
import SnackbarPopUp from "./Snackbar";
import WalletTransaction from "./WalletTransaction";
import { Tabs, Tab, Box } from '@material-ui/core';
import TransactionsList from "./TransactionsList";

const Payment = () => {
    const [loading, setLoading] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [popupMessage, setPopupMessage] = useState(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        const walletId = localStorage.getItem('walletId');
        if (walletId) {
            getWallet(walletId);
        }
    }, [])

    const getWallet = async (id) => {
        setLoading(true);
        try {
            const response = await apiCall({ endpoint: `/api/v1/wallet/${id}`, method: 'GET' });
            setWallet(response);
        } catch (e) {
            console.error('Error while fetching Wallet', e, {});
        } finally {
            setLoading(false);
        }
    }

    const onWalletCreateCb = (wallet) => {
        localStorage.setItem('walletId', wallet.id);
        setWallet(wallet);
        setPopupMessage(`Wallet with name ${wallet.name} is created with balance ${wallet.balance}`);
    }

    const onSuccessTransactionCb = (balance, transactionId, amount) => {
        setWallet(prev => ({
            ...prev,
            balance
        }));
        setPopupMessage(`Wallet got ${amount > 0 ? 'credited' : 'debited'} by ${Math.abs(amount)}. Transaction id is ${transactionId}. Updated Wallet balance is ${balance}`);
    }

    const onFailureCb = (message) => {
        setPopupMessage(message);
    }

    const onCloseCb = () => {
        setPopupMessage(null);
    }

    const onTabChange = (e, value) => {
        setTab(value);
    }

    if (loading) {
        return (
            <Loader />
        );
    }

    return <>
        {!wallet?.id &&
            <CreateWallet
                onWalletCreateCb={onWalletCreateCb}
            />
        }
        {
            wallet &&
            <div className="tabHeader">
                <Box sx={{ width: 400 }}>
                    <Tabs value={tab} onChange={onTabChange} aria-label="basic tabs example" variant="fullWidth">
                        <Tab label="Wallet" />
                        <Tab label="Transactions" />
                    </Tabs>
                </Box>

            </div>
        }
        {
            wallet && tab === 0 &&
            <>
                <WalletTheme
                    wallet={wallet}
                />
                <WalletTransaction
                    onSuccessTransactionCb={onSuccessTransactionCb}
                    walletId={wallet?.id}
                    onFailureCb={onFailureCb}
                />
            </>
        }
        {
            wallet && tab === 1 &&
            <TransactionsList
                walletId={wallet.id}
            />
        }
        {
            popupMessage &&
            <SnackbarPopUp
                message={popupMessage}
                onCloseCb={onCloseCb}
            />
        }
    </>;
};

export default Payment;
