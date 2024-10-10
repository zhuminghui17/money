"use client";

import {
    Card,
    Text,
    Tab,
    TabList,
    TabGroup,
    TabPanels,
    TabPanel,
    Select, 
    SelectItem,
    MultiSelect,
    MultiSelectItem
} from "@tremor/react";
import { CalculatorIcon, BookOpenIcon } from "@heroicons/react/outline";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { handleError } from "@/utils/util";
import {
    getChartsData,
    setAnalyzeFilterDate,
    setAnalyzeSelectedAccounts,
    setUserAnalyzeAISummary
} from "@/store/actions/useUser";
import { getDashboardData } from "@/store/actions/useUser";
import { getAIResponse } from "@/hooks/actions";
import AccountDetailSkeleton from "@/components/stocks/account-detail-skeleton";
import MonthlySpend from "./spendOverTime/MonthlySpend";
import SumSpend from './spendOverTime/SumSpend';
import TransactionsByCategory from "./spendByCategory/TransactionsByCategory";
import TopPurchaseCategory from "./spendByCategory/TopPurchaseCategory";
import SpendByChannel from "./recurringSpend/SpendByChannel";
import RecurringTransaction from "./recurringSpend/RecurringTransaction";
import Summary from "./Summary";

const Kpis = {
    Spend: "spend",
    Transactions: "count"
};

const kpiList = [Kpis.Spend, Kpis.Transactions];

export default function Charts() {
    const dispatch = useDispatch();
    const {
        chartData,
        chartDataByMonth,
        barListData,
        donutChartData,
        donutAsBarData,
        paymentChannelData,
        cumulativeSpend,
        cumulativeSpendNoCards,
        monthlySpend,
        monthlySpendNoCards,
        items,
        kpis,
        analyzeSummary,
        filterDate,
        selectedAccounts
    } = useSelector(state => state.user);
    const { isTransactionsLoaded } = useSelector(state => state.plaid);
    const [filterCreditCards, setFilterCreditCards] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);
    const hasMadeApiCall = useRef(false);
    const [insightsVisible, setInsightsVisible] = useState(true);
    const [aiSummary, setAiSummary] = useState("Summarizing insights from transactions data... ");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedKpi = kpiList[selectedIndex];
    const setFilterDate = date => dispatch(setAnalyzeFilterDate(date));
    const setSelectedAccounts = accounts => dispatch(setAnalyzeSelectedAccounts(accounts));

    const initAISummary = useCallback(() => {
        dispatch(setUserAnalyzeAISummary(""));
    }, [dispatch, filterDate, selectedAccounts]);

    const fetchData = useCallback(async () => {
        // Notice the async keyword here
        if (isTransactionsLoaded) {
            dispatch(getDashboardData());
            dispatch(getChartsData({ filterDate, selectedAccounts }));
            setIsDataReady(true);
        }
    }, [
        dispatch,
        filterDate,
        isTransactionsLoaded,
        cumulativeSpend,
        monthlySpend,
        monthlySpendNoCards,
        cumulativeSpendNoCards,
        barListData,
        donutAsBarData,
        paymentChannelData,
        kpis,
        selectedAccounts
    ]);

    useEffect(() => {
        fetchData();
    }, [filterDate, items, isTransactionsLoaded, selectedAccounts]);

    const fetchAiSummary = async () => {
        if (isDataReady && !hasMadeApiCall.current && analyzeSummary?.length < 50) {
            try {
                hasMadeApiCall.current = true;
                const { data } = await getAIResponse(
                    `data:{${JSON.stringify([
                        barListData,
                        donutChartData,
                        paymentChannelData,
                        monthlySpendNoCards,
                        chartDataByMonth,
                        averageMonthlyMoneyIn,
                        averageMonthlySpend
                    ])}}`
                );
                dispatch(setUserAnalyzeAISummary(data?.message));
            } catch (error) {
                handleError(error);
            }
        }
    };

    function calculateAveragesMonthly() {
        // Initialize sums to 0
        let totalSpend = 0;
        let totalMoneyIn = 0;
        let totalTransactions = 0;
        // Count the number of months
        let numberOfMonths = filterCreditCards === true ? monthlySpendNoCards?.length : monthlySpend?.length;

        // Iterate through each month's data to sum up the spend and moneyIn values
        for (let i = 0; i < numberOfMonths; i++) {
            if(filterCreditCards === true) {
                totalSpend += monthlySpendNoCards[i]?.spend;
                totalMoneyIn += monthlySpendNoCards[i]?.moneyIn;
                totalTransactions += monthlySpendNoCards[i]?.count;
            }
            else{
                totalSpend += monthlySpend[i]?.spend;
                totalMoneyIn += monthlySpend[i]?.moneyIn;
                totalTransactions += monthlySpend[i]?.count;
            }
        }

        // Calculate the average monthly spend and average monthly moneyIn
        let averageMonthlySpend = totalSpend / numberOfMonths;
        let averageMonthlyMoneyIn = totalMoneyIn / numberOfMonths;
        let avgTransaction = totalTransactions / numberOfMonths;

        return {
            averageMonthlySpend,
            averageMonthlyMoneyIn,
            avgTransaction
        };
    }

    const { averageMonthlySpend, averageMonthlyMoneyIn , avgTransaction} = calculateAveragesMonthly();

    const handleSetSelectedAccounts = e => {
        dispatch(setUserAnalyzeAISummary(""));
        setSelectedAccounts(e);
    };

    const handleSetFilterDate = e => {
        setFilterDate(e);
        dispatch(setUserAnalyzeAISummary(""));
    };

    return (
        <main className="min-h-screen p-4 m-auto max-w-7xl">
            <div className="items-center block sm:flex">
                <Datepicker
                    containerClassName="relative min-w-[15rem] md:mr-2"
                    inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
                    useRange={true}
                    showShortcuts={true}
                    value={filterDate}
                    onChange={handleSetFilterDate}
                    configs={{
                        shortcuts: {
                            past: period => `Last ${period} days`,
                            currentMonth: "This month",
                            pastMonth: "Last month",
                            yearFromToday: {
                                text: "1 year back",
                                period: {
                                    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
                                    end: new Date().toISOString()
                                }
                            },
                            yearToDate: {
                                text: "Year-to-date",
                                period: {
                                    start: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                                    end: new Date().toISOString()
                                }
                            }
                        }
                    }}
                />
                <MultiSelect
                    className="max-w-sm mt-2 md:mt-0 multiselect"
                    onValueChange={handleSetSelectedAccounts}
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
                <Select className="max-w-sm mt-2 md:mt-0 ml-2" value={filterCreditCards} onValueChange={setFilterCreditCards}>
                    <SelectItem value={true} icon={CalculatorIcon}>
                        Yes, filter credit payments out of spend
                    </SelectItem>
                    <SelectItem value={false} icon={BookOpenIcon}>
                        No, include card payments in spend
                    </SelectItem>
                </Select>
            </div>
            <br />
            <Card className="px-4">
                <TabGroup className="">
                    <TabList
                        color="slate"
                        className="justify-center align-items-center w-[calc(100vw_-_theme(spacing.16))] sm:w-full"
                    >
                        <Tab className="w-full px-0 sm:p-6 justify-center text-center">
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces ">Spend over time</p>
                        </Tab>
                        <Tab className="w-full px-0 sm:p-6 justify-center text-center">
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces text-center">Spend by category</p>
                        </Tab>
                        <Tab className="w-full px-0 sm:p-6 justify-center text-center">
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces text-center">
                                Recurring spend
                            </p>
                        </Tab>
                        <Tab className="w-full justify-center px-0 sm:p-6" onClick={fetchAiSummary}>
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces text-center">Summary</p>
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel className="px-0 py-6 sm:px-6">
                            <MonthlySpend
                                selectedKpi={selectedKpi}
                                selectedIndex={selectedIndex}
                                setSelectedIndex={setSelectedIndex}
                                filterCreditCards={filterCreditCards}
                            />
                            <br />
                            <SumSpend
                                selectedKpi={selectedKpi}
                                selectedIndex={selectedIndex}
                                setSelectedIndex={setSelectedIndex}
                                filterCreditCards={filterCreditCards}
                            />
                            {/* <AccountDetailSkeleton /> */}
                        </TabPanel>
                        <TabPanel className="px-0 py-6 sm:px-6">
                            <TopPurchaseCategory />
                            <br />
                            <TransactionsByCategory />
                        </TabPanel>
                        <TabPanel className="px-0 py-6 sm:px-6">
                            <SpendByChannel />
                            <br />
                            <RecurringTransaction />
                        </TabPanel>
                        <TabPanel>
                            <br />
                            <Text className="mt-2">AI generated summary</Text>
                            <br />
                            <Summary />
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
            <br />
        </main>
    );
}
