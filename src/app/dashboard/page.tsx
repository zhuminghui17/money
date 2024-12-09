"use client";

import { useCallback, useEffect, useState, useRef, useMemo, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import {
  ArrowNarrowRightIcon,
  CreditCardIcon,
  ChatAlt2Icon,
  CashIcon,
  PhoneIncomingIcon,
  CheckCircleIcon
} from "@heroicons/react/solid";
import { getDashboardData, setUserDashboardAISummary } from "@/store/actions/useUser";
import { CurrencyDollarIcon } from "@heroicons/react/outline";
import {
  Button,
  CategoryBar,
  Divider,
  Grid,
  Flex,
  Icon,
  List,
  ListItem,
  Metric,
  Text,
  Title,
  AccordionList,
  BarList,
} from "@tremor/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Link from "next/link";
import { getAIResponse } from "@/hooks/actions";
import { agbalumo } from "@/lib/fonts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ConnectButtonModal from "@/components/FullConnectButton";

interface KPI {
  title: string;
  metric: number;
  metricPrev: number;
}

interface Balances {
  available: number | null;
  current: number;
  iso_currency_code: string;
  limit: number | null;
  unofficial_currency_code: string | null;
}

interface Account {
  account_id: string;
  balances: Balances;
  official_name: string;
  subtype: string;
  type: string;
}

interface Institution {
  name: string;
}

interface Item {
  institution: Institution;
  accounts: Account[];
}

interface Transaction {
  name: string;
  value: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface AccountsInfo {
  [account_id: string]: {
    recentTransactions: Transaction[];
    topCategories: CategoryData[];
  };
}

interface ConvertedAccount extends Omit<Account, "balances"> {
  institutionName: string;
  available: number | null;
  current: number;
  iso_currency_code: string;
  limit: number | null;
  unofficial_currency_code: string | null;
  recentTransactions?: Transaction[];
  topSpendCategories?: CategoryData[];
}

interface RootState {
  user: {
    kpis: KPI[];
    items: Item[];
    accounts_info: AccountsInfo;
    dashboardSummary: string;
  };
  plaid: {
    isTransactionsLoaded: boolean;
  };
}

const usNumberformatter = (number: number, decimals = 0): string =>
  Intl.NumberFormat("us", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(Number(number))
    .toString();

const valueFormatter = (number: number): string => {
  const roundedNumber = Math.round(number);
  return `$${Intl.NumberFormat("us").format(roundedNumber).toString()}`;
};

const convertItemsToAccounts = (items: Item[], accounts_info: AccountsInfo): ConvertedAccount[] => {
  return items.reduce((acc: ConvertedAccount[], item) => {
    const institutionName = item.institution.name;
    const accountsWithInstitutionName = item.accounts.map((account) => {
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
        topSpendCategories: accounts_info[account.account_id]?.topCategories,
      };
    });

    return acc.concat(accountsWithInstitutionName);
  }, []);
};
export default function Dashboard() {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { kpis, items, accounts_info, dashboardSummary } = useSelector((state: RootState) => state.user);
  const { isTransactionsLoaded } = useSelector((state: RootState) => state.plaid);

  const [isDataReady, setIsDataReady] = useState(false);
  const hasMadeApiCall = useRef(false);

  const fetchData = useCallback(() => {
    if (isTransactionsLoaded) {
      dispatch<any>(getDashboardData());
      setIsDataReady(true);
    }
  }, [dispatch, isTransactionsLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchAiSummary = async () => {
      if (isDataReady && kpis.length > 1 && !hasMadeApiCall.current && dashboardSummary?.length < 10) {
        hasMadeApiCall.current = true;
        const response = await getAIResponse(
          `data:{${JSON.stringify([kpis, convertItemsToAccounts(items, accounts_info)])}}`
        );
        if (response && response.data) {
          dispatch(setUserDashboardAISummary(response.data.message));
        }
      }
    };
    fetchAiSummary();
  }, [isDataReady, kpis, items, accounts_info, dispatch, dashboardSummary]);

  const categories = [
    {
      title: "Create Your Own Custom GPT",
      text: `Leverage Qashboard APIs to bring the power of your personal finance AI assistant to ChatGPT. We provide you prompt & action to interface with Plaid through ChatGPT.`,
      linkText: `Coming Soon`,
      icon: ChatAlt2Icon,
    },
    {
      title: "SMS & Phone Support",
      text: `Buy a phone number to call and text to get personal finance help on the go. This phone number will be dedicated just for you and should never be shared.`,
      linkText: `Go to Settings`,
      icon: PhoneIncomingIcon,
    }
  ];

  const convertedItems = useMemo(() => convertItemsToAccounts(items, accounts_info), [items, accounts_info]);

  const AccountCards: FC<{ items: ConvertedAccount[] }> = ({ items }) => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
        <Card key={item.account_id || index} className="w-full">
          <div className="p-4">
          <div className="justify-between md:flex">
            <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
              <Icon
                variant="light"
                icon={item.type === "credit" ? CreditCardIcon : CurrencyDollarIcon}
                size="sm"
                className="mr-2"
              />
              <Title className="font-semibold">{item.institutionName} • {item.subtype}</Title>
            </Flex>
          </div>
          <Text className="mt-2">
            {item.official_name}
          </Text>
          <div className="w-full">
            {item.type === "credit" ? (
              <>
                {item.limit ? (
                  <>
                    <Text className="mt-4">
                      Credit Utilization
                      <Metric>{Math.round((item.current / item.limit) * 100)} %</Metric>
                    </Text>
                    <CategoryBar
                      values={[
                        Math.round((item.current / item.limit) * 100),
                        100 - Math.round((item.current / item.limit) * 100),
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
            <Flex className="">
              <Link href={`/dashboard/transaction?account=${item.account_id}`}>
                <Button
                  size="xs"
                  variant="light"
                  icon={ArrowNarrowRightIcon}
                  iconPosition="right"
                >
                  View in Explorer
                </Button>
              </Link>
            </Flex>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="top-spend-categories">
                <AccordionTrigger>
                  <Flex justifyContent="start">
                    {/* <Icon
                      variant="light"
                      icon={CurrencyDollarIcon}
                      size="sm"
                      color="slate"
                      className="mr-4"
                    /> */}
                    <p>Top Spend Categories</p>
                  </Flex>
                </AccordionTrigger>
                <AccordionContent className="w-full">
                  <BarList
                    data={item.topSpendCategories || []}
                    showAnimation={false}
                    valueFormatter={valueFormatter}
                    className="mt-2 !w-full"
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="recent-transactions">
                <AccordionTrigger>
                  <Flex justifyContent="start">
                    {/* <Icon
                      variant="light"
                      icon={CreditCardIcon}
                      size="sm"
                      color="slate"
                      className="mr-4"
                    /> */}
                    <p>Recent Transactions</p>
                  </Flex>
                </AccordionTrigger>
                <AccordionContent>
                  <List className="mt-4">
                    {item.recentTransactions?.map((stock, idx) => (
                      <ListItem key={`stock_${idx}`}>
                        <Text>{stock.name}</Text>
                        <Flex justifyContent="end" className="space-x-2">
                          <Text>
                            ${Intl.NumberFormat("us").format(stock.value).toString()}
                          </Text>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Card>
      ))}
      </div>
      </>
    );
  };

  return (
    <main className="min-h-screen p-4 m-auto max-w-7xl">
      {convertedItems && convertedItems.length > 0 ? (
        <>
          <Grid numItemsSm={3} numItemsLg={3} className="gap-6">
            {kpis?.map((item, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {item.title}
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Metric className={agbalumo.className}>${usNumberformatter(item.metric)}</Metric>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </>
      ) : null}
      <div className="mt-4">
        <Flex justifyContent="start">
          <Title>Synced Accounts ({items.length})</Title>
        </Flex>
      </div>
      {convertedItems && convertedItems.length > 0 ? (
        <>
          <div className="mt-4 w-full">
            <AccountCards items={convertedItems} />
          </div>
          <Flex className="pt-4 mt-6 border-t">
            <Button size="xs" variant="light" icon={ArrowNarrowRightIcon} iconPosition="right" color="slate">
              Refresh data (balance & transactions)
            </Button>
          </Flex>
          <div className="mt-4">
            {dashboardSummary?.length > 10 ? (
              convertedItems.length >= 2 ? (
                <Accordion type="single" collapsible className="w-full mt-2" defaultValue="account-summary">
                  <AccordionItem value="account-summary">
                    <AccordionTrigger>
                      <Text>View account summary</Text>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Flex justifyContent="start">
                        <Icon variant="light" icon={CashIcon} size="sm" className="mr-4" />
                        <Title>Check-in summary:</Title>
                      </Flex>
                      <div className="mt-4">
                        <pre className="max-w-full overflow-x-auto font-sans whitespace-pre-wrap">
                          <Text>{dashboardSummary}</Text>
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : null
            ) : (
              <Text>Analyzing recent activity... </Text>
            )}
          </div>
        </>
      ) : null}
      <Card className="p-4 mt-6">
        <Title>
          <Icon
            tooltip={`Connect multiple bank accounts and credit cards to get a consolidated view of all your finances. To connect an account, click "Connect" in the dropdown menu located in the top right icon of Navigation menu.`}
            variant="light"
            icon={CheckCircleIcon}
            size="sm"
            className="mr-4"
          />
          Connect An Account
        </Title>
        <Text className="mt-2">
          Get a bird&apos;s eye view of your finances by connecting your bank accounts and credit cards.
        </Text>
        <div className="mt-4">
          <ConnectButtonModal />
        </div>
      </Card>
      <Grid numItemsSm={2} className="w-full gap-6 mt-6">
        {categories.map((item, index) => (
          <Card key={`category_${index}`} className="p-4">
            <Icon variant="light" icon={item.icon} size="sm" />
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
    </main>
  );
}
