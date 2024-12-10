"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "./ui/dialog";
import { RefreshCcw } from "lucide-react";
import ConnectButton from "./ConnectButton";

const ConnectButtonModal = () => {
    const [showConnectModal, setShowConnectModal] = useState(false);

    return (
        <div>
            <button
                className="inline-flex items-center border rounded-xl justify-center h-8 w-full px-4 py-2 text-sm font-medium shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-secondary/90 hover:text-primary disabled:bg-primary/90"
                onClick={() => {
                    setShowConnectModal(true);
                }}
            >
                <RefreshCcw className="w-[22px] mr-2" />
                Connect
            </button>
            <Dialog
            modal={false}
            open={showConnectModal}
            onOpenChange={setShowConnectModal}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="mb-4">
                            Connect Account
                        </DialogTitle>
                        <ConnectButton
                            type={0}
                            setShowConnectModal={setShowConnectModal}
                        >
                            Connect Bank Account
                        </ConnectButton>
                        <ConnectButton
                            type={1}
                            setShowConnectModal={setShowConnectModal}
                        >
                            Connect Credit Card or Loan
                        </ConnectButton>
                        <ConnectButton
                            type={2}
                            setShowConnectModal={setShowConnectModal}
                        >
                            Connect Investment
                        </ConnectButton>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ConnectButtonModal;
