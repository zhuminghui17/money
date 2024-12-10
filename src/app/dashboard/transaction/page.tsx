"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentTransaction } from "@/store/actions/useTransaction";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Text,
    MultiSelect,
    MultiSelectItem,
    NumberInput,
    Divider
} from "@tremor/react";
import { dateFormat, handleError, isEmpty } from "@/utils/util";
import { getAllCategories } from "@/store/actions/usePlaid";
import { useSearchParams } from "next/navigation";
import { valueFormatter } from "@/utils/util";
import TransactionChart from "./Browse";
import { AppDispatch, RootState } from "@/store";
import { Account, Item, Transaction } from "@/lib/types";
import ModernTable from "./Table";

type AccountMap = { [key: string]: string };

function formatCurrencyValue(value: number) {
    if (typeof value === "string") {
        value = parseFloat(value);
        if (isNaN(value)) {
            return "Invalid input";
        }
    }

    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + "K";
    } else {
        return value.toFixed(2);
    }
}

interface FilterSectionProps {
    categories: string[];
    personalFinanceCategories: string[];
    items: Item[];
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    selectedFinCategories: string[];
    setSelectedFinCategories: (categories: string[]) => void;
    selectedAccounts: string[];
    setSelectedAccounts: (accounts: string[]) => void;
    selectedPaymentChannel: string | null;
    setSelectedPaymentChannel: (channel: string) => void;
    filterDate: { startDate: string | null; endDate: string | null };
    setFilterDate: (date: { startDate: string | null; endDate: string | null }) => void;
    merchantName: string;
    setMerchantName: (name: string) => void;
    priceRange: { minPrice: string; maxPrice: string };
    setPriceRange: (range: { minPrice: string; maxPrice: string }) => void;
    fetchData: (page: number) => void;
}

function FilterSection({
    categories,
    personalFinanceCategories,
    items,
    selectedCategories,
    setSelectedCategories,
    selectedFinCategories,
    setSelectedFinCategories,
    selectedAccounts,
    setSelectedAccounts,
    selectedPaymentChannel,
    setSelectedPaymentChannel,
    filterDate,
    setFilterDate,
    merchantName,
    setMerchantName,
    priceRange,
    setPriceRange,
    fetchData
}: FilterSectionProps) {
    return (
        <div className="flex flex-col justify-end space-y-2 md:space-y-0 md:flex-row md:space-x-2">
            <MultiSelect
                className="w-full text-primary"
                onValueChange={setSelectedAccounts}
                value={selectedAccounts}
                placeholder="Select Accounts..."
            >
                {items?.map((item: Item) => {
                    return item?.accounts?.map((account: Account) => (
                        <MultiSelectItem key={account.account_id} value={account.account_id} className="text-primary">
                            {account.name}
                        </MultiSelectItem>
                    ));
                })}
            </MultiSelect>
            
            <MultiSelect
                className="w-full text-primary"
                defaultValue={["all"]}
                onValueChange={(value) => setSelectedPaymentChannel(value[1])}
                value={selectedPaymentChannel ? [selectedPaymentChannel] : ["all"]}
            >
                    {[
                        { value: "all", label: "All Payment Channel" },
                        { value: "online", label: "Online Channel" },
                        { value: "in store", label: "In Store Channel" }, 
                        { value: "investment", label: "Investment" },
                        { value: "other", label: "Other Channel" }
                    ].map((item) => (
                        <MultiSelectItem key={item.value} value={item.value}>
                            {item.label}
                        </MultiSelectItem>
                    ))}
            </MultiSelect>

            <Datepicker
                containerClassName="relative w-full"
                inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
                useRange={true}
                showShortcuts={true}
                value={{
                    startDate: filterDate.startDate ? new Date(filterDate.startDate) : null,
                    endDate: filterDate.endDate ? new Date(filterDate.endDate) : null,
                }}
                onChange={(value: DateValueType, e?: HTMLInputElement | null) => {
                    const newFilterDate = {
                        startDate: value?.startDate ? value.startDate.toISOString() : null,
                        endDate: value?.endDate ? value.endDate.toISOString() : null,
                    };
                    setFilterDate(newFilterDate);
                }}
                configs={{
                    shortcuts: {
                        past: period => `Last ${period} days`,
                        currentMonth: "This month",
                        pastMonth: "Last month",
                        yearFromToday: {
                            text: "Year from today",
                            period: {
                                start: new Date(
                                    new Date().setFullYear(new Date().getFullYear() - 1)
                                ),
                                end: new Date()
                            }
                        },
                        yearToDate: {
                            text: "Year to date",
                            period: {
                                start: new Date(new Date().getFullYear(), 0, 1),
                                end: new Date()
                            }
                        }
                    }
                }}
            />
        </div>
    );
}

export default function Transactions() {
    const dispatch = useDispatch<AppDispatch>();
    const searchParams = useSearchParams();
    const { isItemAccess, isTransactionsLoaded, categories, personalFinanceCategories } = useSelector(
        (state: RootState) => state.plaid
    );
    const { data: transactions, size: total } = useSelector((state: RootState) => state.transactions);
    const { items, annualTransactionData } = useSelector((state: RootState) => state.user);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedFinCategories, setSelectedFinCategories] = useState<string[]>(
        isEmpty(searchParams.get("financeCategory")) 
            ? [] 
            : searchParams.get("financeCategory")?.split(",") || []
    );
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
        isEmpty(searchParams.get("accounts")) 
            ? [] 
            : searchParams.get("accounts")?.split(",") || []
    );
    const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string | null>(
        isEmpty(searchParams.get("channel")) ? "all" : searchParams.get("channel") || null
    );
    const currentDate = new Date();
    const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

    const [filterDate, setFilterDate] = useState({
        startDate: isEmpty(searchParams.get("startDate"))
            ? dateFormat(threeMonthsAgo)
            : searchParams.get("startDate"),
        endDate: isEmpty(searchParams.get("endDate")) ? dateFormat(new Date()) : searchParams.get("endDate")
    });

    const [priceRange, setPriceRange] = useState({
        minPrice: "",
        maxPrice: ""
    });
    const [pageSize, setPageSize] = useState(total);
    const [currentPage, setCurrentPage] = useState(1);
    // State to manage the visibility of the content
    const [showFilters, setShowFilters] = useState(true);
    // Initialize merchantName before using it in fetchData
    const [merchantName, setMerchantName] = useState("");

    // Function to toggle the visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };
  
    // fetch data
    const fetchData = useCallback(
        (newCurPage: number) => {
            try {
                setCurrentPage(newCurPage);
                dispatch(
                    getPaymentTransaction(
                        {
                            filter: {
                                selectedCategories,
                                selectedAccounts,
                                selectedPaymentChannel,
                                filterDate,
                                pageSize,
                                currentPage: newCurPage,
                                priceRange,
                                merchantName,
                                selectedFinCategories
                            }
                        },
                        isEmpty(annualTransactionData)
                    )
                );
            } catch (err) {
                handleError(err);
            }
        },
        [
            dispatch,
            selectedCategories,
            selectedAccounts,
            selectedPaymentChannel,
            filterDate,
            pageSize,
            priceRange,
            merchantName,
            selectedFinCategories
        ]
    );

    useEffect(() => {
        fetchData(1);
    }, [
        dispatch,
        selectedCategories,
        selectedAccounts,
        selectedPaymentChannel,
        filterDate,
        pageSize,
        merchantName,
        selectedFinCategories
    ]);

    useEffect(() => {
        if (isEmpty(categories)) dispatch(getAllCategories());
        if (isTransactionsLoaded) fetchData(1);
    }, [isItemAccess, items, isTransactionsLoaded, dispatch, getAllCategories]);

    // Create a mapping of account IDs to account names
    const accountIdToName: AccountMap = {};
    const depositories: AccountMap = {};
    items?.forEach((item: Item) => {
        item?.accounts?.forEach((account: Account) => {
            accountIdToName[account.account_id] = account.name ?? "unknown";
            if (account.type == "depository") {
                depositories[account.account_id] = account.name ?? "unknown";
            }
        });
    });

    // console.log(accountIdToName, depositories);

    const moneyIn = transactions.reduce((acc: number, item: Transaction) => {
        if (
            item.amount < 0 &&
            !item.category?.includes("Payment") &&
            !item.category?.includes("Credit") &&
            !item.category?.includes("Overdraft") &&
            !item.category?.includes("Transfer") &&
            depositories[item.account_id]
        ) {
            return acc + -1 * item.amount;
        }
        return acc;
    }, 0);

    const moneyOut = transactions.reduce((acc: number, item: Transaction) => {
        if (
            item.amount > 0 &&
            // !item.category?.includes("Payment") &&
            // !item.category?.includes("Credit") &&
            // !item.category?.includes("Overdraft") &&
            !item.category?.includes("Transfer")
        ) {
            return acc + item.amount;
        }
        return acc;
    }, 0);

    const kpis = [
        {
            title: "Transactions",
            metric: total
        },
        {
            title: "Money In",
            metric: valueFormatter(moneyIn)
        },
        {
            title: "Money Out",
            metric: valueFormatter(moneyOut)
        }
    ];

    return (
        <main className="min-h-screen p-2 sm:p-4 m-auto max-w-7xl">
             {showFilters && (
                <FilterSection
                    categories={categories}
                    personalFinanceCategories={personalFinanceCategories}
                    items={items}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    selectedFinCategories={selectedFinCategories}
                    setSelectedFinCategories={setSelectedFinCategories}
                    selectedAccounts={selectedAccounts}
                    setSelectedAccounts={setSelectedAccounts}
                    selectedPaymentChannel={selectedPaymentChannel}
                    setSelectedPaymentChannel={setSelectedPaymentChannel}
                    filterDate={filterDate}
                    setFilterDate={setFilterDate}
                    merchantName={merchantName}
                    setMerchantName={setMerchantName}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    fetchData={fetchData}
                />
            )}
            <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                {kpis?.map((item, index) => (
                    <Card key={"kpis" + index} className="w-full mx-auto border rounded-lg p-4">
                        <div className="space-y-2">
                            <p className="text-md">{item.title}</p>
                            <div className="text-lg font-medium">{item.metric}</div>
                        </div>
                    </Card>
                ))}
            </div>
            {/* Graph */}
            {showFilters && <TransactionChart />}
            <Divider>
                <button onClick={toggleFilters}>{showFilters ? "Hide chart" : "Show chart"}</button>
            </Divider>
            {/* Table */}
            <ModernTable transactions={transactions} />
            <br />
        </main>
    );
}
