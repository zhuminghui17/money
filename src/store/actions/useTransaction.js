import apiCall from "@/utils/apiCall";
import { SET_TRANSACTION } from "../constants/transactionConstants";
import { SET_ANNUAL_TRANSACTION } from "../constants/userConstants";
import { handleError } from "@/utils/util";
import { setTransactions } from "@/store/actions/usePlaid";
import { useSelector } from "react-redux";

export const getPaymentTransaction = (data, isSaveKPI) => async dispatch => {
    try {
        const res = await apiCall.post("/api/v1/transaction/getData", data);
        dispatch({
            type: SET_TRANSACTION,
            payload: res.data
        });
        if (isSaveKPI) {
            dispatch({ type: SET_ANNUAL_TRANSACTION, payload: res.data.data });
        }
    } catch (err) {
        handleError(err);
    }
};

export const allTransactionSync = data => async dispatch => {
    try {
        dispatch(setTransactions({ isTransactionsLoaded: false }));

        await apiCall.get("/api/v1/plaid/transactions/all");

        dispatch(setTransactions({ isTransactionsLoaded: true }));
    } catch (err) {
        handleError(err);
    }
};
