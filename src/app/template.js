"use client";

import store from "../store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

export default function Template({ children }) {
    return (
        <SessionProvider>
            <Provider store={store}>
                <body className="font-sans scroll-smooth">
                    <Providers
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        {children}
                    </Providers>
                    <Toaster />
                </body>
            </Provider>
        </SessionProvider>
    );
}
