import React from 'react';
import { useState } from 'react';
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import Loader from './loader';
import { apiCall } from '../services/httpService';

function WalletTransaction({ onSuccessTransactionCb, walletId, onFailureCb}) {
    const [form, setForm] = useState({ description: "", amount: "", type: 'CREDIT' });
    const [formErrors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setForm({ description: "", amount: "", type: 'CREDIT'});
    }

    const setFormErrors = (name, value) => {
        let errorMsg;
        if (name === "amount") {
            if(!value.trim()){
                errorMsg = "Amount is mandatory";
            }
            else if (value.trim() && !/^(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/.test(value.trim())) {
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
    }

    const validateForm = () => {
        for(let key in formErrors){
            if(formErrors[key]) return false;
        }
        if(!form?.amount?.trim()) {
            setFormErrors('amount', form?.amount);
            return false;
        }
        return true;
    }

    const submitForm = async(e) => {
        e.preventDefault();
        if(!validateForm() || loading){
            return;
        }
        setLoading(true);
        const payload = {
            description: form?.description?.trim(),
            amount: form?.type === 'CREDIT' ? form?.amount?.trim() : `-${form?.amount.trim() }`
        }
        try{   
            const response = await apiCall({
                endpoint: `/api/v1/wallet/transact/${walletId}`,
                method: 'POST',
                body: payload
            });
            resetForm();
            onSuccessTransactionCb?.(response?.balance, response?.transactionId, payload?.amount);
        }catch(e){
            const errorMsg = e?.message ?? 'Something went wrong please try again';
            console.error('Error in while performing transaction: ', e , {});
            onFailureCb(errorMsg);
        }finally{
            setLoading(false);
        }
    }

    if(loading){
        return <Loader />
    }

    return (
        <>
            <form>
                <div className="input-group">
                    <RadioGroup
                        row
                        aria-labelledby="demo-error-radios"
                        name="type"
                        value={form?.type}
                        onChange={onIpChange}
                    >
                        <FormControlLabel labelPlacement="start"
                            value="CREDIT"
                            control={<Radio />}
                            label="Credit" />
                        <FormControlLabel
                            labelPlacement="start"
                            value="DEBIT"
                            control={<Radio />}
                            label="Debit"
                        />
                    </RadioGroup>
                </div>


                <div className="input-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={form?.amount}
                        onChange={(e) => onIpChange(e)}
                    />
                    {formErrors?.amount && (
                        <span className="error">{formErrors?.amount}</span>
                    )}
                </div>
                <div className="input-group">
                    <label htmlFor="description">Description(optional):</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={form?.description}
                        onChange={(e) => onIpChange(e)}
                    />
                    {formErrors?.description && (
                        <span className="error">{formErrors?.description}</span>
                    )}
                </div>
                <button onClick={submitForm} type="button">
                    {form?.type === 'CREDIT' ? 'Add to Wallet' : 'Pay from Wallet'}
                </button>
            </form>
        </>
    );
}

export default WalletTransaction