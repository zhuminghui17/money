"use client";
import {
	SET_TRANSACTION
} from "../constants/transactionConstants";

const initialState = {
	data: [],
};

interface Action {
    type: string;
    payload?: any;
}

export const transactionReducer = (state = initialState, { type, payload }: Action) => {
	switch (type) {
		case SET_TRANSACTION:
			return { ...state, ...payload };
		default:
			return { ...state };
	}
};
