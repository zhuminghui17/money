"use client";

import Navbar from "@/components/Navbar";
import MobileNavbar from "@/components/MobileNavbar";

export default function RootLayout({ children }) {
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
