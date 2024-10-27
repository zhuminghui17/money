"use client";

import Navbar from "@/components/Navbar";
import MobileNavbar from "@/components/MobileNavbar";

import { ReactNode } from "react";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            <div className={`grid min-h-screen bg-muted`}>
                <div className="relative">
                    <Navbar />
                    {children}
                    <MobileNavbar />
                </div>
            </div>
        </>
    );
}
