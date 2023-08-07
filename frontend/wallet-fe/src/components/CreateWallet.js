import React, { useEffect, useState } from "react";
import { apiCall } from "../services/httpService";
import Loader from "./loader";
import SnackbarPopUp from "./Snackbar";

const CreateWallet = ({onWalletCreateCb}) => {
    const [form, setForm] = useState({ name: "", balance: "" });
    const [formErrors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const setFormErrors = (name, value) => {
        let errorMsg;
        if (name === "name") {
            errorMsg = !value.trim() ? "Wallet name is mandatory" : null;
        } else if (name === "balance") {
            if (value.trim() && !/^(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/.test(value.trim())) {
                errorMsg = "Please enter a valid amount greater than 0.";
            }
        }
        console.log(name, errorMsg);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMsg
        }));
    }

    const onIpChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
        setFormErrors(name, value);
    };

    const validateForm = () => {
        for(let key in formErrors){
            if(formErrors[key]) return false;
        }
        if(!form?.name?.trim()) {
            setFormErrors('name', form?.name);
            return false
        }
        return true;
    }

    const submitForm = async (e) => {
        e.preventDefault();
        // perform validation.
        if(!validateForm() || loading){
            return;
        }
        setLoading(true);
        try {
            const response = await apiCall({
                endpoint: '/api/v1/wallet/setup',
                method: 'POST',
                body: { name: form.name.trim(), balance: form.balance ? form.balance.trim() : '' }
            })
            console.log('Create Wallet Response: ', response);
            onWalletCreateCb(response);
        } catch (e) {
            console.error('Error while creating wallet', e);
            setLoading(false);
        } finally {

        }
    };

    if (loading) {
        return (
            <Loader />
        );
    }

    return (
        <>
            <form>
                <div className="input-group">
                    <label htmlFor="name">Wallet Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form?.name}
                        onChange={(e) => onIpChange(e)}
                    />
                    {formErrors?.name && (
                        <span className="error">{formErrors?.name}</span>
                    )}
                </div>
                <div className="input-group">
                    <label htmlFor="balance">Wallet Balance:</label>
                    <input
                        type="text"
                        id="balance"
                        name="balance"
                        value={form?.balance}
                        onChange={(e) => onIpChange(e)}
                    />
                    {formErrors?.balance && (
                        <span className="error">{formErrors?.balance}</span>
                    )}
                </div>
                <button onClick={submitForm} type="button">
                    Create Wallet
                </button>
            </form>
        </>
    );
};

export default CreateWallet;
