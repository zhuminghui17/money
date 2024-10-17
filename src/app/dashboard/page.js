"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowNarrowRightIcon,
    CreditCardIcon,
    CheckCircleIcon,
    ChatAlt2Icon,
    ShieldCheckIcon,
    CashIcon,
    LockOpenIcon,
} from "@heroicons/react/solid";
import { getDashboardData, setUserDashboardAISummary } from "@/store/actions/useUser";
import { CurrencyDollarIcon } from "@heroicons/react/outline";
import { Accordion, AccordionHeader, AccordionBody, AccordionList, BarList } from "@tremor/react";
import {
    Button,
    Card,
    CategoryBar,
    Divider,
    Grid,
    Flex,
    Icon,
    List,
    ListItem,
    Metric,
    Text,
    Title
} from "@tremor/react";
import Link from "next/link";
import { getAIResponse } from "@/hooks/actions";
import { agbalumo } from "@/lib/fonts";

const usNumberformatter = (number, decimals = 0) =>
    Intl.NumberFormat("us", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
        .format(Number(number))
        .toString();

const valueFormatter = number => {
    const roundedNumber = Math.round(number);
    return `$${Intl.NumberFormat("us").format(roundedNumber).toString()}`;
};

const convertItemsToAccounts = (items, accounts_info) => {
    return items.reduce((acc, item) => {
        const institutionName = item.institution.name;
        const accountsWithInstitutionName = item.accounts.map(account => {
            const { balances, ...restAccount } = account;
            const { available, current, iso_currency_code, limit, unofficial_currency_code } = balances;

            return {
                ...restAccount,
                institutionName,
                available,
                current,
                iso_currency_code,
                limit,
                unofficial_currency_code,
                recentTransactions: accounts_info[account.account_id]?.recentTransactions,
                topSpendCategories: accounts_info[account.account_id]?.topCategories?.categories?.map(item => ({
                    name: item.category,
                    value: item.sum
                }))
            };
        });

        return acc.concat(accountsWithInstitutionName);
    }, []);
};

export default function Dashboard() {
    const dispatch = useDispatch();
    const { kpis, items, accounts_info, dashboardSummary } = useSelector(state => state.user);
    const { isTransactionsLoaded } = useSelector(state => state.plaid);

    const [aiResponse, setAiResponse] = useState("");
    const [isDataReady, setIsDataReady] = useState(false);
    const hasMadeApiCall = useRef(false);

    const fetchData = useCallback(() => {
        if (isTransactionsLoaded) {
            dispatch(getDashboardData());
            setIsDataReady(true);
        }
    }, [dispatch, items, isTransactionsLoaded]);

    useEffect(() => {
        fetchData();
    }, [items, isTransactionsLoaded]);

    // Separate useEffect for GPT4 call
    useEffect(() => {
        const fetchAiSummary = async () => {
            if (isDataReady && kpis.length > 1 && !hasMadeApiCall.current && dashboardSummary?.length < 10) {
                // Check if the data is ready {
                hasMadeApiCall.current = true;
                const { data } = await getAIResponse(
                    `data:{${JSON.stringify([kpis, convertItemsToAccounts(items, accounts_info)])}}`
                );
                dispatch(setUserDashboardAISummary(data?.message));
            }
        };
        fetchAiSummary();
    }, [items, kpis]);

    const categories = [
        {
            title: "ChatGPT Plugin (BETA)",
            text: `Leverage Qashboard APIs to bring the power of your personal finance AI assistant to ChatGPT through GPT4 Plugins. Unavailble through Plugin Store - exclusively for Pro members.`,
            linkText: `Coming Soon`,
            icon: ChatAlt2Icon
        },
        {
            title: "Keys",
            text: `Keep your data secure and personal by using your own OpenAI key (Freemium) for insights and your own MongoDB Atlas database (Free) to store your transaction data. Visit respective platforms to view cost and replace keys.`,
            linkText: `Go to Settings`,
            icon: ShieldCheckIcon
        },

        {
            title: "Upgrade",
            text: `You are currently subscribed to Qashboard Hawk Plan monthly ($7/mo). Use the discount code "QashboardWrapped2023" to get 15% off our one-time lifetime plan and never see us in your transactions again.`,
            icon: LockOpenIcon,
            linkText: "View plans"
        }
    ];

    const stocks = [
        {
            name: "Off Running AG",
            value: 10456,
            performance: "6.1%",
            deltaType: "increase"
        },
        {
            name: "Not Normal Inc.",
            value: 5789,
            performance: "1.2%",
            deltaType: "moderateDecrease"
        },
        {
            name: "Logibling Inc.",
            value: 4367,
            performance: "2.3%",
            deltaType: "moderateIncrease"
        },
        {
            name: "Raindrop Inc.",
            value: 3421,
            performance: "0.5%",
            deltaType: "moderateDecrease"
        },
        {
            name: "Mwatch Group",
            value: 1432,
            performance: "3.4%",
            deltaType: "decrease"
        }
    ];

    const AccountCards = ({ items, accounts_info }) => {
        return convertItemsToAccounts(items, accounts_info).map((item, index) => (
            <AccordionList key={index}>
                <Accordion className="w-full">
                    <AccordionHeader>
                        <div className="justify-between md:flex">
                            <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                                <Icon
                                    variant="light"
                                    icon={item.type === "credit" ? CreditCardIcon : CurrencyDollarIcon}
                                    size="sm"
                                    className="mr-2"
                                    color="slate"
                                />
                                <Title className="mx-6">{item.official_name} </Title>
                            </Flex>
                        </div>
                        <Text className="mt-2 ml-4">
                            {item.institutionName} • {item.subtype}
                        </Text>
                        {/* <Text><Bold>Current ${item.current}   •   Available ${item.available || ' ∞'}   •   Limit ${item.limit || ' ∞'}</Bold></Text> */}
                    </AccordionHeader>
                    <AccordionBody key={index} className="w-full">
                        {item.type === "credit" ? (
                            <>
                                {item.limit ? (
                                    <>
                                        <Text className="mt-4">
                                            Credit Utilization
                                            <Metric>{Math.round((item.current / item.limit) * 100)} %</Metric>
                                        </Text>
                                        {/* <ProgressBar value={Math.round((item.current / item.limit) * 100) || 99} className="mt-4" /> */}
                                        <CategoryBar
                                            values={[
                                                Math.round((item.current / item.limit) * 100),
                                                100 - Math.round((item.current / item.limit) * 100)
                                            ]}
                                            markerValue={Math.round((item.current / item.limit) * 100)}
                                            className="mt-3"
                                            showLabels={false}
                                            showAnimation={true}
                                        />
                                        <Flex className="mt-2">
                                            <Text>Available Credit: ${item.available}</Text>
                                            <Text>Credit Limit: ${item.limit}</Text>
                                        </Flex>
                                    </>
                                ) : (
                                    <Text className="mt-2">
                                        Current Balance
                                        <Metric>${item.current}</Metric>
                                    </Text>
                                )}
                            </>
                        ) : (
                            <>
                                <Text className="mt-2">Balance</Text>
                                <Metric>${item.available}</Metric>
                            </>
                        )}
                        <Flex className="pt-4">
                            <Link href={"/dashboard/transaction?account=" + item.account_id}>
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
                        <Divider />
                        <AccordionList className="w-full mt-2">
                            <Accordion>
                                <AccordionHeader>
                                    <Flex justifyContent="start">
                                        <Icon
                                            variant="light"
                                            icon={CurrencyDollarIcon}
                                            size="sm"
                                            color="slate"
                                            className="mr-4"
                                        />
                                        <Text>Top Spend Categories</Text>
                                    </Flex>
                                </AccordionHeader>
                                <AccordionBody>
                                    <BarList
                                        data={item.topSpendCategories}
                                        showAnimation={false}
                                        valueFormatter={valueFormatter}
                                        className="mt-2"
                                    />
                                </AccordionBody>
                            </Accordion>
                            <Accordion>
                                <AccordionHeader>
                                    <Flex justifyContent="start">
                                        <Icon
                                            variant="light"
                                            icon={CreditCardIcon}
                                            size="sm"
                                            color="slate"
                                            className="mr-4"
                                        />
                                        <Text>Recent Transactions</Text>
                                    </Flex>
                                </AccordionHeader>
                                <AccordionBody>
                                    <List className="mt-4">
                                        {item.recentTransactions?.map((stock, index) => (
                                            <ListItem key={`stock_${index}`}>
                                                <Text>{stock.name}</Text>
                                                <Flex justifyContent="end" className="space-x-2">
                                                    <Text>
                                                        $ {Intl.NumberFormat("us").format(stock.value).toString()}
                                                    </Text>
                                                </Flex>
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionBody>
                            </Accordion>
                        </AccordionList>
                    </AccordionBody>
                </Accordion>
            </AccordionList>
        ));
    };

    return (
        <main className="min-h-screen p-4 m-auto max-w-7xl">
            <Grid numItemsSm={3} numItemsLg={3} className="gap-6">
                {kpis?.map((item, index) => (
                    <Card key={index}>
                        <Text>{item.title}</Text>
                        <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
                            <Metric  className={agbalumo.className}>${usNumberformatter(item.metric)}</Metric>
                            <Text>&nbsp; ${usNumberformatter(item.metricPrev)}</Text>
                        </Flex>
                    </Card>
                ))}
            </Grid>

            <br />
            {dashboardSummary?.length > 10 ? (
                <>
                    {convertItemsToAccounts(items, accounts_info).length >= 2 ? (
                        <AccordionList className="w-full mt-2">
                            <Accordion defaultOpen={true}>
                                <AccordionHeader>
                                    <Text>View account summary</Text>
                                </AccordionHeader>
                                <AccordionBody>
                                    <Flex justifyContent="start">
                                        <Icon variant="light" icon={CashIcon} size="sm" className="mr-4" />
                                        <Title>Check-in summary:</Title>
                                    </Flex>
                                    <br />
                                    <pre className="max-w-full overflow-x-auto font-sans whitespace-pre-wrap">
                                        <Text>{dashboardSummary}</Text>
                                    </pre>
                                </AccordionBody>
                            </Accordion>
                        </AccordionList>
                    ) : null}
                </>
            ) : (
                <Text>Generating GPT4 summary... </Text>
            )}
            <br />

            <div>
                <Flex className="mt-4" justifyContent="start">
                    <Icon
                        tooltip={`Connect multiple bank accounts and credit cards to get a consolidated view of all your finances. To connect an account, click "Connect" in the dropdown menu located in the top right icon of Navigation menu.`}
                        variant="light"
                        color="slate"
                        icon={CheckCircleIcon}
                        size="sm"
                        className="mr-4"
                    />
                    <Title
                        tooltip={`Connect multiple bank accounts and credit cards to get a consolidated view of all your finances. To connect an account, click "Connect" in the dropdown menu located in the top right icon of Navigation menu.`}
                    >
                        Connected Accounts ({items.length})
                    </Title>
                </Flex>
            </div>
            <br />
            <div className="w-full">
                <AccountCards items={items} accounts_info={accounts_info} />
            </div>
            <Flex className="pt-4 mt-6 border-t">
                <Button size="xs" variant="light" icon={ArrowNarrowRightIcon} iconPosition="right" color="slate">
                    Refresh data (balance & transactions)
                </Button>
            </Flex>
            {/* <Title className="mt-6 mb-2">
                {"Service information"}
            </Title> */}
            <br />
            <br />
            <Grid numItemsSm={3} className="w-full gap-6">
                {categories.map((item, index) => (
                    <Card key={`category_${index}`}>
                        <Icon variant="light" icon={item.icon} size="sm" color="slate" />
                        <Title className="mt-6">{item.title}</Title>
                        <Text className="mt-2">{item.text}</Text>
                        <Flex className="pt-4 mt-6 border-t">
                            <Button
                                size="xs"
                                variant="light"
                                icon={ArrowNarrowRightIcon}
                                iconPosition="right"
                                color="slate"
                            >
                                {item.linkText}
                            </Button>
                        </Flex>
                    </Card>
                ))}
            </Grid>
            <br />
            <br />
        </main>
    );
}
