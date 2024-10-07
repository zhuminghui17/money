"use client";

import {
    Button,
    Card,
    CategoryBar,
    Text,
    TextInput,
    BarChart,
    BarList,
    Divider,
    Grid,
    Title,
    Tab,
    TabList,
    TabGroup,
    TabPanels,
    TabPanel,
    Flex,
    Metric,
    Legend,
    AreaChart,
    Icon,
    Callout,
    Bold,
    Select, 
    SelectItem,
    DonutChart,
    MultiSelect,
    MultiSelectItem
} from "@tremor/react";
import { Accordion, AccordionHeader, AccordionBody, AccordionList } from "@tremor/react";
import { CalculatorIcon, BookOpenIcon } from "@heroicons/react/outline";
import { useCallback, useEffect, useState, Fragment, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowNarrowRightIcon,
    CurrencyDollarIcon,
    InformationCircleIcon,
    NewspaperIcon,
    SearchIcon,
    TrendingDownIcon,
    TrendingUpIcon
} from "@heroicons/react/solid";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowsExpandIcon } from "@heroicons/react/outline";
import Datepicker from "react-tailwindcss-datepicker";
import { dateFormat, handleError, isEmpty } from "@/utils/util";
import {
    getChartsData,
    setAnalyzeFilterDate,
    setAnalyzeSelectedAccounts,
    setUserAnalyzeAISummary
} from "@/store/actions/useUser";
import { getDashboardData } from "@/store/actions/useUser";
import Link from "next/link";
import { getAIResponse } from "@/hooks/actions";
import AccountDetailSkeleton from "@/components/stocks/account-detail-skeleton";

const usNumberformatter = (number, decimals = 0) =>
    Intl.NumberFormat("us", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
        .format(Number(number))
        .toString();

const Kpis = {
    Spend: "spend",
    Transactions: "count"
};

const kpiList = [Kpis.Spend, Kpis.Transactions];

const numberFormatter = value => Intl.NumberFormat("us").format(value).toString();
const dollarFormatter = value =>
    Intl.NumberFormat("us", { style: "currency", currency: "USD" }).format(value).toString();

const formatters = {
    Spend: number => `$ ${dollarFormatter(usNumberformatter(number))}`,
    Debt: number => `$ ${usNumberformatter(number)}`,
    Transactions: number => `${numberFormatter(usNumberformatter(number))}`,
    Category: number => `${usNumberformatter(number, 2)}%`
};
const percentageFormatter = value =>
    `${Intl.NumberFormat("us")
        .format(value * 100)
        .toString()}%`;

function sumArray(array, metric) {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue[metric], 0);
}

function filterAndSortBarListData(barListData, searchQuery) {
    const filteredData = barListData.filter(item => item.name !== null && item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const sortedFilteredData = filteredData.sort((a, b) => a.value > b.value);

    return sortedFilteredData;
}

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
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const filteredpages = filterAndSortBarListData(barListData, searchQuery);
    const closeModal = () => {
        setSearchQuery("");
        setIsOpen(false);
    };
    const openModal = () => setIsOpen(true);
    const closeModal2 = () => {
        setSearchQuery("");
        setIsOpen2(false);
    };
    const openModal2 = () => setIsOpen2(true);
    const [filterCreditCards, setFilterCreditCards] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);
    const hasMadeApiCall = useRef(false);
    const [insightsVisible, setInsightsVisible] = useState(true);
    const [aiSummary, setAiSummary] = useState("Summarizing insights from transactions data... ");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedKpi = kpiList[selectedIndex];
    const setFilterDate = date => dispatch(setAnalyzeFilterDate(date));
    const setSelectedAccounts = accounts => dispatch(setAnalyzeSelectedAccounts(accounts));
    const [showModal, setShowModal] = useState(false);

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

    const cumulativeSpendArgs = {
        className: "mt-5 h-72",
        data: filterCreditCards === true ? cumulativeSpendNoCards : cumulativeSpend,
        index: "date",
        categories: [selectedKpi, selectedKpi === "spend" ? "moneyIn" : "moneyInCount"],
        showLegend: true,
        showAnimation: true,
        yAxisWidth: 45
    };

    const monthlySpendBarChartArgs = {
        className: "mt-5 h-72",
        data: filterCreditCards === true ? monthlySpendNoCards : monthlySpend,
        index: "date",
        categories: [selectedKpi, selectedKpi === "spend" ? "moneyIn" : "moneyInCount"],
        showLegend: true,
        showAnimation: true,
        yAxisWidth: 45
    };

    const barlistArgs = {
        className: "mt-2 overflow-visible whitespace-normal text-overflow  sm:w-full",
        data: chartDataByMonth.slice(0, 10),
        showAnimation: true,
        showLegend: true,
    };

    const finalSum = cumulativeSpend?.length > 0 ? cumulativeSpend[cumulativeSpend.length - 1].spend : 0;
    const finalSumNoCards = cumulativeSpendNoCards?.length > 0 ? cumulativeSpendNoCards[cumulativeSpendNoCards.length - 1].spend : 0;
    const finalTransactions = cumulativeSpend?.length > 0 ? cumulativeSpend[cumulativeSpend.length - 1].count : 0;
    const finalTransactionsNoCards = cumulativeSpendNoCards?.length > 0 ? cumulativeSpendNoCards[cumulativeSpendNoCards.length - 1].count : 0;

    console.log("finalSum", finalSum, "finalSumNoCards", finalSumNoCards, "finalTransactions", finalTransactions, "finalTransactionsNoCards", finalTransactionsNoCards);

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

    function getKPI(desiredValue) {
        for (let i = 0; i < kpis.length; i++) {
            if (kpis[i].title === desiredValue) {
                return kpis[i].metric;
            }
        }
        return null;
    }

    // const avgSpend = numberFormatter(
    //     sumArray(monthlySpend, "spend") / monthlySpend.length
    // );

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
                            <Card>
                                <div className="justify-between md:flex">
                                    <div>
                                        <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                                            <Title>Monthly Spend</Title>
                                            <Icon
                                                icon={InformationCircleIcon}
                                                variant="simple"
                                                tooltip="Shows total spend for each month"
                                                color="gray"
                                            />
                                        </Flex>
                                        <Text>Spend calculated for each month</Text>
                                        <Metric className="mt-2">
                                            {selectedKpi === "spend"
                                                ? dollarFormatter(averageMonthlySpend)
                                                : numberFormatter(avgTransaction)}
                                        </Metric>
                                    </div>
                                    <div className="flex">
                                        <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                                            <TabList variant="solid">
                                                <Tab>Dollars</Tab>
                                                <Tab>Transactions</Tab>
                                            </TabList>
                                        </TabGroup>
                                    </div>
                                </div>
                                <div className="mt-8 overflow-auto">
                                    <BarChart {...monthlySpendBarChartArgs} />
                                </div>
                                <br />
                            </Card>
                            <br />
                            <Card>
                                <div className="justify-between md:flex">
                                    <div>
                                        <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                                            <Title>Sum Spend over time</Title>
                                            <Icon
                                                icon={InformationCircleIcon}
                                                variant="simple"
                                                tooltip="Shows daily increase of spend from debit accounts or credit cards"
                                                color="gray"
                                            />
                                        </Flex>
                                        <Text> Total of spend summed cummulatively over time</Text>
                                        <Metric className="mt-2">
                                            {selectedKpi === "spend"
                                                ? dollarFormatter(filterCreditCards === true ? finalSumNoCards : finalSum)
                                                : numberFormatter(filterCreditCards === true ? finalTransactionsNoCards : finalTransactions)}
                                        </Metric>
                                    </div>
                                    <div className="flex items-center">
                                        <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                                            <TabList variant="solid">
                                                <Tab>Dollars</Tab>
                                                <Tab>Transactions</Tab>
                                            </TabList>
                                        </TabGroup>
                                    </div>
                                </div>
                                <div className="mt-8 overflow-auto">
                                    <AreaChart {...cumulativeSpendArgs} />
                                </div>
                            </Card>
                            <AccountDetailSkeleton />
                        </TabPanel>
                        <TabPanel className="px-0 py-6 sm:px-6">
                            <Card className="w-full">
                                <>
                                    <div className="w-full">
                                        <Title>Top Purchase Categories</Title>
                                        <Text>Your breakdown of purchases by merchant category</Text>
                                        <DonutChart
                                            className="mt-2 overflow-visible whitespace-normal text-overflow"
                                            data={donutChartData.filter(item => 
                                                item && 
                                                item.name !== null
                                            )}
                                            category="percent"
                                            index="name"
                                            showTooltip={true}
                                            showAnimation={true}
                                            showLegend={true}
                                            valueFormatter={formatters.Category}
                                        />
                                        <Legend
                                            categories={donutChartData.map((item, index) => (
                                                <span
                                                    className="block w-32 overflow-hidden md:inline text-ellipsis"
                                                    key={index}
                                                >
                                                    {item.name ? item.name : null}
                                                </span>
                                            ))}
                                            className="mt-6"
                                        />
                                        <br />
                                        <Button
                                            color="slate"
                                            icon={ArrowsExpandIcon}
                                            className="w-full mt-2"
                                            onClick={openModal2}
                                        >
                                            Show more
                                        </Button>
                                    </div>
                                    <Transition appear show={isOpen2} as={Fragment}>
                                        <Dialog as="div" className="relative z-50 px-30" onClose={closeModal2}>
                                            <Transition.Child
                                                as={Fragment}
                                                enter="ease-out duration-300"
                                                enterFrom="opacity-0"
                                                enterTo="opacity-100"
                                                leave="ease-in duration-200"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <div className="fixed inset-0 bg-opacity-25 bg-background" />
                                            </Transition.Child>
                                            <div className="fixed inset-0 overflow-y-auto">
                                                <div className="flex items-center justify-center min-h-full p-4 text-center">
                                                    <Transition.Child
                                                        as={Fragment}
                                                        enter="ease-out duration-300"
                                                        enterFrom="opacity-0 scale-95"
                                                        enterTo="opacity-100 scale-100"
                                                        leave="ease-in duration-200"
                                                        leaveFrom="opacity-100 scale-100"
                                                        leaveTo="opacity-0 scale-95"
                                                    >
                                                        <Dialog.Panel className="w-full max-w-full p-6 overflow-hidden text-left align-middle transition-all transform ring-tremor shadow-tremor rounded-xl">
                                                            <Flex alignItems="center" justifyContent="between">
                                                                <Text className="text-base font-medium">
                                                                    Spend Categories
                                                                </Text>
                                                                <Text>%</Text>
                                                            </Flex>
                                                            <TextInput
                                                                icon={SearchIcon}
                                                                placeholder="Search..."
                                                                className="mt-6"
                                                                value={searchQuery}
                                                                onChange={event => setSearchQuery(event.target.value)}
                                                            />
                                                            <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
                                                                <BarList
                                                                    data={donutAsBarData.filter(item => 
                                                                        item.name !== null && 
                                                                        item.name
                                                                            .toLowerCase()
                                                                            .includes(searchQuery.toLowerCase())
                                                                    )}
                                                                    className="mr-4 sm:min-w-full"
                                                                    showAnimation={true}
                                                                    showTooltip={true}
                                                                    color="slate"
                                                                />
                                                                <div className="sticky inset-x-0 bottom-0 h-20 p-6 bg-gradient-to-t from-white to-transparent" />
                                                            </div>
                                                            <Button
                                                                className="w-full mt-4"
                                                                onClick={closeModal2}
                                                                color="slate"
                                                            >
                                                                Go back
                                                            </Button>
                                                        </Dialog.Panel>
                                                    </Transition.Child>
                                                </div>
                                            </div>
                                        </Dialog>
                                    </Transition>
                                </>
                            </Card>
                            <br />
                            <Card>
                                <Title>Transactions by Category</Title>
                                <Text>Types of purchases made</Text>
                                <Flex className="mt-4 ">
                                    <Text>
                                        <Bold>Merchant</Bold>
                                    </Text>
                                    <Text>
                                        <Bold>Total Spend</Bold>
                                    </Text>
                                </Flex>
                                <BarList {...barlistArgs} />
                                <Flex className="pt-4">
                                    <Link
                                        href={`/dashboard/transaction?financeCategory=${chartDataByMonth[0]?.name?.replace(
                                            /\s\(\d+\)/,
                                            ""
                                        )}&startDate=${filterDate.startDate}&endDate=${
                                            filterDate.endDate
                                        }&accounts=${selectedAccounts.join(",")}`}
                                    >
                                        <Button
                                            size="xs"
                                            variant="light"
                                            icon={ArrowNarrowRightIcon}
                                            iconPosition="right"
                                            color="slate"
                                        >
                                            View in Explorer
                                        </Button>
                                    </Link>
                                </Flex>
                                <br />
                            </Card>
                        </TabPanel>
                        <TabPanel className="px-0 py-6 sm:px-6">
                            <Card>
                                <Title>Spend by Sales Channel</Title>
                                <Flex className="mt-4">
                                    <Text className="capitalize">
                                        <Bold>Channel</Bold>
                                    </Text>
                                    <Text className="capitalize">
                                        <Bold>Total Spend</Bold>
                                    </Text>
                                </Flex>
                                <BarList className="mt-4 sm:w-full" data={paymentChannelData} />
                                <Flex className="pt-4">
                                    <Link
                                        href={`/dashboard/transaction?channel=${paymentChannelData[0]?.name?.replace(
                                            /\s\(\d+\)/,
                                            ""
                                        )}&startDate=${filterDate.startDate}&endDate=${
                                            filterDate.endDate
                                        }&accounts=${selectedAccounts.join(",")}`}
                                    >
                                        <Button
                                            size="xs"
                                            variant="light"
                                            icon={ArrowNarrowRightIcon}
                                            iconPosition="right"
                                            color="slate"
                                        >
                                            View in Explorer
                                        </Button>
                                    </Link>
                                </Flex>
                                <br />
                            </Card>
                            <br />
                            <>
                                <Card>
                                    <Title>Recurring Transactions</Title>
                                    <Flex className="mt-4">
                                        <Text>
                                            <Bold>Merchant</Bold>
                                        </Text>
                                        <Text>
                                            <Bold>Total Spend</Bold>
                                        </Text>
                                    </Flex>
                                    <BarList
                                        data={barListData.slice(0, 10)}
                                        className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full"
                                        showTooltip={true}
                                        showAnimation={true}
                                    />
                                    <Button
                                        icon={ArrowsExpandIcon}
                                        className="w-full mt-4"
                                        onClick={openModal}
                                        color="slate"
                                    >
                                        Show more
                                    </Button>
                                </Card>
                                <Transition appear show={isOpen} as={Fragment}>
                                    <Dialog as="div" className="relative z-50 px-30" onClose={closeModal}>
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <div className="fixed inset-0 bg-opacity-25 bg-background" />
                                        </Transition.Child>
                                        <div className="fixed inset-0 overflow-y-auto">
                                            <div className="flex items-center justify-center min-h-full p-4 text-center">
                                                <Transition.Child
                                                    as={Fragment}
                                                    enter="ease-out duration-300"
                                                    enterFrom="opacity-0 scale-95"
                                                    enterTo="opacity-100 scale-100"
                                                    leave="ease-in duration-200"
                                                    leaveFrom="opacity-100 scale-100"
                                                    leaveTo="opacity-0 scale-95"
                                                >
                                                    <Dialog.Panel className="w-full max-w-full p-6 overflow-hidden text-left align-middle transition-all transform ring-tremor shadow-tremor rounded-xl">
                                                        <Flex alignItems="center" justifyContent="between">
                                                            <Text className="text-base font-medium text-gray-700">
                                                                Recurring Transactions
                                                            </Text>
                                                            <Text>Spend</Text>
                                                        </Flex>
                                                        <TextInput
                                                            icon={SearchIcon}
                                                            placeholder="Search..."
                                                            className="mt-6"
                                                            value={searchQuery}
                                                            onChange={event => setSearchQuery(event.target.value)}
                                                        />
                                                        <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
                                                            <BarList
                                                                data={filteredpages}
                                                                className="w-full sm:min-w-full" // to give room for scrollbar
                                                                showAnimation={true}
                                                                color="slate"
                                                            />
                                                            <div className="sticky inset-x-0 bottom-0 h-20 p-6 bg-gradient-to-t from-white to-transparent" />
                                                        </div>
                                                        <Button
                                                            className="w-full mt-4"
                                                            onClick={closeModal}
                                                            color="slate"
                                                        >
                                                            Go back
                                                        </Button>
                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>
                            </>
                        </TabPanel>
                        <TabPanel>
                            <br />
                            <Text className="mt-2">AI generated summary</Text>
                            <br />
                            <Card>
                                <pre className="max-w-full overflow-x-auto font-sans whitespace-pre-wrap">
                                    <Text>{analyzeSummary}</Text>
                                </pre>
                                <br />
                                {analyzeSummary?.length < 50 ? ( // replace with better way to tell when response is ready to stream. Show below svg while we wait. Loading from public causes issues in deployment use svg directly.
                                    <svg
                                        width="38"
                                        height="38"
                                        viewBox="0 0 38 38"
                                        xmlns="http://www.w3.org/2000/svg"
                                        stroke="#666"
                                    >
                                        <g fill="none" fillRule="evenodd">
                                            <g transform="translate(1 1)" strokeWidth="2">
                                                <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                                                <path d="M36 18c0-9.94-8.06-18-18-18">
                                                    <animateTransform
                                                        attributeName="transform"
                                                        type="rotate"
                                                        from="0 18 18"
                                                        to="360 18 18"
                                                        dur="1s"
                                                        repeatCount="indefinite"
                                                    />
                                                </path>
                                            </g>
                                        </g>
                                    </svg>
                                ) : null}
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
            <br />
        </main>
    );
}
