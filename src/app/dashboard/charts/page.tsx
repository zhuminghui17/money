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
import MonthlySpend from "./spendOverTime/MonthlySpend";
import SumSpend from './spendOverTime/SumSpend';
import TransactionsByCategory from "./spendByCategory/TransactionsByCategory";
import TopPurchaseCategory from "./spendByCategory/TopPurchaseCategory";
import SpendByChannel from "./recurringSpend/SpendByChannel";
import RecurringTransaction from "./recurringSpend/RecurringTransaction";
import Summary from "./Summary";
import { AppDispatch, RootState } from "@/store";
import { Item } from "@/lib/types";

const Kpis = {
    Spend: "spend",
    Transactions: "count"
};

const kpiList = [Kpis.Spend, Kpis.Transactions];

export default function Charts() {
    const dispatch = useDispatch<AppDispatch>();
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
    } = useSelector((state: RootState) => state.user);
    const { isTransactionsLoaded } = useSelector((state: RootState) => state.plaid);
    const [filterCreditCards, setFilterCreditCards] = useState('true');
    const [isDataReady, setIsDataReady] = useState(false);
    const hasMadeApiCall = useRef(false);
    const [insightsVisible, setInsightsVisible] = useState(true);
    const [aiSummary, setAiSummary] = useState("Summarizing insights from transactions data... ");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedKpi = kpiList[selectedIndex];
    const setFilterDate = (date: any) => dispatch(setAnalyzeFilterDate(date));
    const setSelectedAccounts = (accounts: any[]) => dispatch(setAnalyzeSelectedAccounts(accounts));

    const initAISummary = useCallback(() => {
        dispatch(setUserAnalyzeAISummary(""));
    }, [dispatch, filterDate, selectedAccounts]);

    const fetchData = useCallback(async () => {
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
                const response = await getAIResponse(
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

                if (response) {  // Check if response is not undefined
                    const { data } = response;
                    // Use data safely here
                    dispatch(setUserAnalyzeAISummary(data?.message));
                } else {
                    // Handle the undefined case gracefully
                    console.error('Response was undefined');
                }
            } catch (error) {
                handleError(error);
            }
        }
    };

    function calculateAveragesMonthly() {
        let totalSpend = 0;
        let totalMoneyIn = 0;
        let totalTransactions = 0;
        let numberOfMonths = filterCreditCards === 'true' ? monthlySpendNoCards?.length : monthlySpend?.length;

        for (let i = 0; i < numberOfMonths; i++) {
            if(filterCreditCards === 'true') {
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

    const handleSetSelectedAccounts = (e: any) => {
        dispatch(setUserAnalyzeAISummary(""));
        setSelectedAccounts(e);
    };

    const handleSetFilterDate = (e: any) => {
        setFilterDate(e);
        dispatch(setUserAnalyzeAISummary(""));
    };

    return (
        <main className="min-h-screen p-2 m-auto max-w-7xl">
            <div className="items-center block sm:flex">
                <Datepicker
                    containerClassName="relative min-w-[12rem] md:mr-1"
                    inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-6 py-1 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
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
                                    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                                    end: new Date()
                                }
                            },
                            yearToDate: {
                                text: "Year-to-date",
                                period: {
                                    start: new Date(new Date().getFullYear(), 0, 1),
                                    end: new Date()
                                }
                            }
                        }
                    }}
                />
                <MultiSelect
                    className="max-w-sm mt-1 md:mt-0 multiselect"
                    onValueChange={handleSetSelectedAccounts}
                    value={selectedAccounts}
                    placeholder="Select Accounts..."
                >
                    {items?.map((item: Item) => {
                        return item?.accounts?.map(account => (
                            <MultiSelectItem key={account.account_id} value={account.account_id}>
                                {account.name}
                            </MultiSelectItem>
                        ));
                    })}
                </MultiSelect>
                <Select className="max-w-sm mt-1 md:mt-0 ml-1" value={filterCreditCards} onValueChange={setFilterCreditCards}>
                    <SelectItem value={'true'} icon={CalculatorIcon}>
                        Yes, filter credit payments out of spend
                    </SelectItem>
                    <SelectItem value={'false'} icon={BookOpenIcon}>
                        No, include card payments in spend
                    </SelectItem>
                </Select>
            </div>
            <br />
            <Card className="px-2 border border-gray-300">
                <TabGroup className="">
                    <TabList
                        color="slate"
                        className="justify-center align-items-center w-[calc(100vw_-_theme(spacing.16))] sm:w-full"
                    >
                        <Tab className="w-full px-0 sm:p-4 justify-center text-center">
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces ">Spend over time</p>
                        </Tab>
                        <Tab className="w-full px-0 sm:p-4 justify-center text-center">
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces text-center">Spend by category</p>
                        </Tab>
                        <Tab className="w-full px-0 sm:p-4 justify-center text-center">
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces text-center">
                                Recurring spend
                            </p>
                        </Tab>
                        <Tab className="w-full justify-center px-0 sm:p-4" onClick={fetchAiSummary}>
                            <p className="text-sm break-word sm:text-base whitespace-break-spaces text-center">Summary</p>
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel className="px-0 py-4 sm:px-4">
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
                        </TabPanel>
                        <TabPanel className="px-0 py-4 sm:px-4">
                            <TopPurchaseCategory />
                            <br />
                            <TransactionsByCategory />
                        </TabPanel>
                        <TabPanel className="px-0 py-4 sm:px-4">
                            <SpendByChannel />
                            <br />
                            <RecurringTransaction />
                        </TabPanel>
                        <TabPanel>
                            <br />
                            <Text className="mt-1">AI generated summary</Text>
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
