"use client";

import { useCallback, useEffect, useState, useRef, useMemo, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import Link from "next/link";
import { getDashboardData, setUserDashboardAISummary } from "@/store/actions/useUser";
import { getAIResponse } from "@/hooks/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ConnectButtonModal from "@/components/FullConnectButton";
import { ArrowRightIcon, CreditCardIcon, BanknoteIcon, ChartBarIcon, CircleDollarSign } from "lucide-react";
import Charts from "./charts/page";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

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
  }).format(Number(number));

const valueFormatter = (number: number): string => {
  const roundedNumber = Math.round(number);
  return `$${Intl.NumberFormat("us").format(roundedNumber)}`;
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

const AccountCards: FC<{ items: ConvertedAccount[] }> = ({ items }) => {
  return (
    <div className={`grid grid-cols-1 ${
      items.length === 1 
        ? '' 
        : items.length % 3 === 0 
          ? 'md:grid-cols-3' 
          : 'md:grid-cols-2'
    } w-full gap-4`}>
      {items.map((item, index) => (
        <Card key={item.account_id || index}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CardTitle>{item.institutionName} • {item.subtype}</CardTitle>
            </div>
            <CardDescription>{item.official_name}</CardDescription>
          </CardHeader>
          <CardContent className="-mt-4">
            {item.type === "credit" ? (
              item.limit && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Credit Utilization</span>
                    <span>{Math.round((item.current / item.limit) * 100)}%</span>
                  </div>
                  <Progress value={Math.round((item.current / item.limit) * 100)} />
                  <div className="flex justify-between text-sm">
                    <span>Available Credit: ${item.limit - item.current}</span>
                    <span>Credit Limit: ${item.limit}</span>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-1">
                <span className="text-sm">Balance</span>
                <p className="text-2xl font-bold">${item.available}</p>
              </div>
            )}

            <Link href={`/dashboard/transaction?account=${item.account_id}`} className="mt-3 flex items-center gap-2 text-sm text-emerald-700 hover:underline">
              View in Explorer <ArrowRightIcon className="size-4" />
            </Link>
            <Accordion type="single" collapsible>
              <AccordionItem value="top-spend-categories">
                <AccordionTrigger>Top Spend Categories</AccordionTrigger>
                <AccordionContent>
                  <ul>
                    {(item.topSpendCategories || []).map((cat, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{cat.name}</span>
                        <span>{valueFormatter(cat.value)}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="recent-transactions">
                <AccordionTrigger>Recent Transactions</AccordionTrigger>
                <AccordionContent>
                  <ul>
                    {(item.recentTransactions || []).map((tx, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{tx.name}</span>
                        <span>${tx.value}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AccountCardsFlattened: FC<{ items: ConvertedAccount[] }> = ({ items }) => {
  return (
    <div className="px-6 py-2 bg-background border rounded-lg">
    <Accordion type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem key={item.account_id || index} value={`account-${index}`}>
          <AccordionTrigger>
            <div className="flex justify-between items-center">
              <div className="rounded-full bg-emerald-300 dark:bg-emerald-900 p-2 mr-6"> {item.type === "credit" ? <CreditCardIcon className="size-4" /> : <BanknoteIcon className="size-4" />}</div>
              <span className="text-lg">{item.institutionName} • {item.subtype}</span> <span className="ml-4 text-sm text-muted-foreground">{item.official_name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 ml-16 border rounded-lg p-4">
              {item.type === "credit" ? (
                item.limit && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Credit Utilization</span>
                      <span>{Math.round((item.current / item.limit) * 100)}%</span>
                    </div>
                    <Progress value={Math.round((item.current / item.limit) * 100)} />
                    <div className="flex justify-between text-sm">
                      <span>Available Credit: ${item.limit - item.current}</span>
                      <span>Credit Limit: ${item.limit}</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-1">
                  <span className="text-sm">Balance</span>
                  <p className="text-2xl font-bold">${item.available}</p>
                </div>
              )}

              <Link href={`/dashboard/transaction?account=${item.account_id}`} className="mt-3 flex items-center gap-2 text-sm text-emerald-700 hover:underline">
                View in Explorer <ArrowRightIcon className="size-4" />
              </Link>
              <Accordion type="single" collapsible className="px-6 border rounded-lg">
                <AccordionItem value="top-spend-categories">
                  <AccordionTrigger>Top Spend Categories</AccordionTrigger>
                  <AccordionContent>
                    <ul>
                      {(item.topSpendCategories || []).map((cat, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{cat.name}</span>
                          <span>{valueFormatter(cat.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="recent-transactions">
                  <AccordionTrigger>Recent Transactions</AccordionTrigger>
                  <AccordionContent>
                    <ul>
                      {(item.recentTransactions || []).map((tx, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{tx.name}</span>
                          <span>${tx.value}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
    </div>
  );
};

export default function Dashboard() {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { kpis, items, accounts_info, dashboardSummary } = useSelector((state: RootState) => state.user);
  const { isTransactionsLoaded } = useSelector((state: RootState) => state.plaid);

  const [isDataReady, setIsDataReady] = useState(false);
  const hasMadeApiCall = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const convertedItems = useMemo(() => convertItemsToAccounts(items, accounts_info), [items, accounts_info]);

  const spinner = (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 animate-spin stroke-zinc-400"
    >
      <path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"></path>
    </svg>
  );

  return (
    <>
    { convertedItems?.length > 0 ? 
    <main className="min-h-screen p-4 m-auto max-w-7xl">
      <Tabs defaultValue="accounts" className="w-full">
      <TabsList className="grid w-full max-w-full grid-cols-2">
        <TabsTrigger value="accounts"><CircleDollarSign className="h-4 mr-2" /> Accounts</TabsTrigger>
        <TabsTrigger value="summary"><ChartBarIcon className="h-4 mr-2" /> Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="accounts" className="w-full">
        {convertedItems && convertedItems.length > 0 ? (
          <>
          {/* KPI Cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
              {kpis?.map((item, index) => (
                <Card key={index} className="bg-background">
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
                      <span>${usNumberformatter(item.metric)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Account Cards */}
            <div className="my-6">
              <div className="flex justify-between items-center">
                <h1 className="my-3 text-xl font-medium">Connected Accounts ({convertedItems?.length})</h1>
                <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Collapse All" : "Expand All"}
                </Button>
              </div>
              </div>
              <ConnectButtonModal />
              <div className="my-6">
              {convertedItems?.length > 0 && (
                isExpanded 
                  ? <AccountCards items={convertedItems} />
                  : <AccountCardsFlattened items={convertedItems} />
              )}
              </div>
            </div>
          </>
        ) : null}
      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* SMS Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>SMS & Phone Support</CardTitle>
            <CardDescription>
              Buy a phone number to call and text for personal finance help on the go. This phone number will be dedicated just for you and should never be shared.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/settings">
                Go to Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* ChatGPT Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Own Custom GPT</CardTitle>
            <CardDescription>
              Leverage the Serverless APIs to bring the power of your personal finance AI assistant to ChatGPT. We provide prompts and actions to interface with Plaid through ChatGPT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
      </TabsContent>
          <TabsContent value="summary">
            <Charts />
          </TabsContent>
      </Tabs>
    </main>
    : 
    <div className="min-h-screen p-4 m-auto max-w-7xl">
      <div className="flex flex-col items-center justify-center h-full border rounded-lg p-4">
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
        <h1 className="my-6 text-xl text-center">No accounts connected</h1>
        <ConnectButtonModal />
      </div>
    </div>
    }
    </>
  );
}
