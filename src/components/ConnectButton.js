"use client";

import { useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useDispatch, useSelector } from "react-redux";
import { setPlaidState } from "@/store/actions/usePlaid";
import apiCall from "@/utils/apiCall";
import { setUserInfoState } from "@/store/actions/useUser";
import { isEmpty } from "@/utils/util";

const ConnectButton = ({ children, type, setShowConnectModal }) => {
    const { linkToken } = useSelector(state => state.plaid);
    const { items: linkInfo } = useSelector(state => state.user);

    const dispatch = useDispatch();

    const onSuccess = useCallback(
        (public_token, metadata) => {
            const exchangePublicTokenForAccessToken = async () => {
                const response = await apiCall.post("/api/v1/plaid/set_access_token", { public_token, metadata, type });
                if (response.status !== 200) {
                    dispatch(
                        setPlaidState({
                            isItemAccess: false
                        })
                    );
                    return;
                }
                const { isItemAccess, item_id, accounts } = await response.data;
                dispatch(setPlaidState({ isItemAccess: isItemAccess }));
                if (!isEmpty(item_id)) {
                    dispatch(
                        setUserInfoState({
                            items: [...linkInfo, { ...metadata, accounts }]
                        })
                    );
                }
                setShowConnectModal(false);
            };
            exchangePublicTokenForAccessToken();
        },
        [dispatch, linkInfo, setShowConnectModal, type]
    );

    const config = {
        token: !isEmpty(linkToken) ? linkToken[type].link_token : null,
        onSuccess
    };

    const { open, ready } = usePlaidLink(config);

    const handleOpenPlaidLink = () => {
        dispatch(setPlaidState({ isItemAccess: false, linkSuccess: false }));
        open();
    };

    return (
        <button
            className="inline-flex items-center justify-center h-8 px-4 py-2 text-sm font-medium transition-colors rounded-md shadow-md cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/90"
            onClick={handleOpenPlaidLink}
            disabled={!ready || isEmpty(linkToken)}
        >
            {children}
        </button>
    );
};

export default ConnectButton;
