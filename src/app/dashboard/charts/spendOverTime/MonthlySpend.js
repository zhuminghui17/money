import { useMemo } from 'react';
import { useSelector } from "react-redux";
import {
    Card,
    Flex,
    Title,
    Icon,
    Metric,
    TabGroup,
    TabList,
    Tab,
    Text,
} from "@tremor/react";
import { 
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart";
import {
    InformationCircleIcon,
} from "@heroicons/react/solid";
import {
    dollarFormatter,
    numberFormatter
} from "../../../../utils/util";

const MonthlySpend = ({
    selectedKpi,
    selectedIndex,
    setSelectedIndex,
    filterCreditCards,
}) => {
    const {
        monthlySpend,
        monthlySpendNoCards,
    } = useSelector(state => state.user);

    const chartConfig = useMemo(() => ({
        spend: {
          label: selectedKpi === "spend" ? "Spend" : "Count",
          color: "hsl(var(--chart-1))",
        },
        moneyIn: {
          label: selectedKpi === "spend" ? "MoneyIn" : "MoneyInCount",
          color: "hsl(var(--chart-2))",
        },
    }), [selectedKpi]);

    const calculatedAveragesMonthly = useMemo(() => {
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
    }, [monthlySpendNoCards, monthlySpend, filterCreditCards]);

    const { averageMonthlySpend, avgTransaction } = calculatedAveragesMonthly;

    return (
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
                <ChartContainer className="mt-5 h-72 w-full" config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={filterCreditCards === true ? monthlySpendNoCards : monthlySpend}
                        minWidth={0}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar
                            dataKey={selectedKpi === "spend" ? "spend" : "count"}
                            fill={`var(--color-spend)`}
                            radius={4}
                        />
                        <Bar
                            dataKey={selectedKpi === "spend" ? "moneyIn" : "moneyInCount"}
                            fill={`var(--color-moneyIn)`}
                            radius={4}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
            <br />
        </Card>
    )
}

export default MonthlySpend;
