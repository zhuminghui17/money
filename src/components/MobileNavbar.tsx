import * as React from "react";
import Link from "next/link";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import usePlaidInit from "@/hooks/usePlaidInit";
import useGetTransactionsSync from "@/hooks/useGetTransactionsSync";
import useGetAccounts from "@/hooks/useGetAccounts";
import { getUserInfo } from "@/store/actions/useUser";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const { isTransactionsLoaded } = useSelector((state: { plaid: { isTransactionsLoaded: boolean } }) => state.plaid);

    const pathname = usePathname();

    const navItems = [
        {
            label: "Home",
            href: "/dashboard"
        },
        {
            label: "Chat",
            href: "/dashboard/chat"
        },
        {
            label: "Explore",
            href: "/dashboard/transaction"
        },
        {
            label: "Analyze",
            href: "/dashboard/charts"
        }
    ];

    return (
        <nav
            className={`fixed bottom-0 flex flex-row items-center justify-around w-full border-t sm:hidden bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl ${
                pathname.includes("/dashboard/chat") ? "pl-12" : ""
            }`}
        >
            {navItems.map((item, index) => {
                return (
                    <li
                        key={index}
                        className={`${
                            pathname == item.href
                                ? "border-slate-500 text-gray-900 dark:text-gray-100"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
                        } inline-flex items-center border-b-2 py-5 text-xs font-medium md:mx-2 md:px-1 md:text-sm`}
                    >
                        <Link href={item.href}>{item.label}</Link>
                    </li>
                );
            })}
        </nav>
    );
};

export default Navbar;
