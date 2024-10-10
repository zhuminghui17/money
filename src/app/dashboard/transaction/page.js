"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentTransaction } from "@/store/actions/useTransaction";
import SearchInput from "@/components/Basic/SearchInput";
import { InformationCircleIcon } from "@heroicons/react/solid";
import Datepicker from "react-tailwindcss-datepicker";
import {
    Card,
    Title,
    Text,
    Flex,
    Icon,
    MultiSelect,
    MultiSelectItem,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Badge,
    NumberInput,
    Divider
} from "@tremor/react";
import { Metric, Grid } from "@tremor/react";
import { dateFormat, handleError, isEmpty } from "@/utils/util";
import { getAllCategories } from "@/store/actions/usePlaid";
import { useSearchParams } from "next/navigation";
import { valueFormatter } from "@/utils/util";
import Browse from "./Browe";

function formatCurrencyValue(value) {
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

export default function Transactions() {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const { isItemAccess, isTransactionsLoaded, categories, personalFinanceCategories } = useSelector(
        state => state.plaid
    );
    const { data: transactions, size: total } = useSelector(state => state.transactions);
    const { items, annualTransactionData } = useSelector(state => state.user);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedFinCategories, setSelectedFinCategories] = useState(
        isEmpty(searchParams.get("financeCategory")) ? [] : searchParams.get("financeCategory")?.split(",")
    );
    const [selectedAccounts, setSelectedAccounts] = useState(
        isEmpty(searchParams.get("accounts")) ? [] : searchParams.get("accounts")?.split(",")
    );
    const [selectedPaymentChannel, setSelectedPaymentChannel] = useState(
        isEmpty(searchParams.get("channel")) ? "all" : searchParams.get("channel")
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
    const [isOpen, setIsOpen] = useState(false);

    // Function to toggle the visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false); //add code to export to downloads (pdf, csv, json)
    // fetch data
    const fetchData = useCallback(
        newCurPage => {
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
    const accountIdToName = {};
    const depositories = {};
    items?.forEach(item => {
        item?.accounts?.forEach(account => {
            accountIdToName[account.account_id] = account.name;
            if (account.type == "depository") {
                depositories[account.account_id] = account.name;
            }
        });
    });

    // console.log(accountIdToName, depositories);

    const moneyIn = transactions.reduce((acc, item) => {
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

    const moneyOut = transactions.reduce((acc, item) => {
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
        <main className="min-h-screen p-4 m-auto max-w-7xl">
            {showFilters && (
                <Grid numItemsSm={3} className="gap-6">
                    {kpis?.map((item, index) => (
                        <Card key={"kpis" + index} className="max-w-md mx-auto">
                            <Flex className="space-x-8">
                                <Text>{item.title}</Text>
                            </Flex>
                            <Flex className="space-x-3" justifyContent="start" alignItems="baseline">
                                <Metric>{item.metric}</Metric>
                            </Flex>
                        </Card>
                    ))}
                </Grid>
            )}
            <br />
            <Divider>
                <button onClick={toggleFilters}>{showFilters ? "Hide filters" : "Show filters"}</button>
            </Divider>
            <br />
            {showFilters && (<Card className="relative w-full p-3 mt-6 md:p-6">
                        <div>
                            <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                                <Title>Filters</Title>
                                <Icon
                                    icon={InformationCircleIcon}
                                    variant="simple"
                                    color="gray"
                                    tooltip="Browse all your transactions. Data fetched from Plaid, look up to 2 years back."
                                />
                            </Flex>
                        </div>
                        <div className="md:space-x-2 md:flex">
                            <SearchInput
                                className="max-w-full mb-2 sm:max-w-xs md:mb-0"
                                placeholder="Search transactions..."
                                value={merchantName}
                                onChange={e => setMerchantName(e.target.value)}
                                onSearch={fetchData}
                            />
                             {categories && <MultiSelect
                                className="max-w-full mb-2 sm:max-w-xs md:mb-0"
                                onValueChange={setSelectedCategories}
                                placeholder="Select Category..."
                            >
                                {categories?.map(item => (
                                    <MultiSelectItem key={item} value={item}>
                                        {item !== null ? item : "Uncategorized"}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelect> }
                            <Select
                                className="flex-1 mb-2 md:mb-0"
                                defaultValue="all"
                                onValueChange={setSelectedPaymentChannel}
                                value={selectedPaymentChannel}
                            >
                                <SelectItem value="all">All Payment Channel</SelectItem>
                                <SelectItem value="online">Online Channel</SelectItem>
                                <SelectItem value="in store">In Store Channel</SelectItem>
                                <SelectItem value="investment">Investment</SelectItem>
                                <SelectItem value="other">Other Channel</SelectItem>
                            </Select>

                            <Datepicker
                                containerClassName="relative flex-2 text-gray-700 min-w-[15rem]"
                                inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
                                useRange={true}
                                showShortcuts={true}
                                value={filterDate}
                                onChange={setFilterDate}
                                configs={{
                                    shortcuts: {
                                        // today: "Today",
                                        // yesterday: "Yesterday",
                                        past: period => `Last ${period} days`,
                                        currentMonth: "This month",
                                        pastMonth: "Last month",
                                        yearFromToday: {
                                            text: "Year from today",
                                            period: {
                                                start: new Date(
                                                    new Date().setFullYear(new Date().getFullYear() - 1)
                                                ).toISOString(),
                                                end: new Date().toISOString()
                                            }
                                        },
                                        yearToDate: {
                                            text: "Year to date",
                                            period: {
                                                start: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                                                end: new Date().toISOString()
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="items-center mt-2 md:flex">
                            <MultiSelect
                                className="max-w-full mb-2 mr-2 sm:max-w-xs md:mb-0"
                                onValueChange={setSelectedAccounts}
                                value={selectedAccounts}
                                placeholder="Select Accounts..."
                            >
                                {items?.map(item => {
                                    return item?.accounts?.map(account => (
                                        <MultiSelectItem key={account.account_id} value={account.account_id}>
                                            {account.name}
                                        </MultiSelectItem>
                                    ));
                                })}
                            </MultiSelect>
                            <MultiSelect
                                className="max-w-full mr-2 sm:max-w-xs md:mb-0"
                                onValueChange={setSelectedFinCategories}
                                value={selectedFinCategories}
                                placeholder="Select Financial Category..."
                            >
                                {personalFinanceCategories?.map(item => (
                                    <MultiSelectItem key={item} value={item}>
                                        {item}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelect>
                            <div className="flex w-full mt-2 md:mt-0">
                                <NumberInput
                                    className="min-w-[2rem] md:min-w-[5rem] md:w-[10rem] mr-2"
                                    enableStepper={false}
                                    placeholder="Min Price"
                                    value={priceRange?.minPrice}
                                    onChange={e =>
                                        setPriceRange({
                                            ...priceRange,
                                            minPrice: e.target.value
                                        })
                                    }
                                    onSubmit={fetchData}
                                />
                                <NumberInput
                                    className="min-w-[2rem] md:min-w-[5rem] md:w-[10rem]"
                                    enableStepper={false}
                                    placeholder="Max Price"
                                    value={priceRange?.maxPrice}
                                    onChange={e =>
                                        setPriceRange({
                                            ...priceRange,
                                            maxPrice: e.target.value
                                        })
                                    }
                                    onSubmit={fetchData}
                                />
                            </div>
                        </div>
                        </Card>
                )}
                
                <br />
                { showFilters && <Browse />}
                <br />
                <Card className="relative w-full p-3 mt-6 md:p-6">
                <>
                    <Table className="w-[calc(100vw_-_theme(spacing.16))] sm:w-full mt-6 overflow-auto">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell className="">Date</TableHeaderCell>
                                <TableHeaderCell className="text-left ">Name</TableHeaderCell>
                                <TableHeaderCell className="text-left ">Amount</TableHeaderCell>
                                <TableHeaderCell className="text-left ">Category</TableHeaderCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {transactions?.map((item, index) => (
                                <TableRow key={"transaction_" + index}>
                                    <TableCell>{dateFormat(item.date)}</TableCell>
                                    <TableCell className="max-w-[10rem] overflow-hidden text-left text-ellipsis">
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="text-left">
                                        {valueFormatter(item.amount)}
                                        {/* ({item.iso_currency_code}) */}
                                    </TableCell>
                                    <TableCell className="flex flex-wrap justify-start max-w-[5rem] text-left">
                                        {item.category?.map(categoryItem => (
                                            <Badge
                                                color="slate"
                                                key={"categoryItem_" + categoryItem}
                                                tooltip={item.personal_finance_category?.detailed || categoryItem}
                                            >
                                                {categoryItem}
                                            </Badge>
                                        ))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
                <br />
            </Card>
            <br />
        </main>
    );
}
