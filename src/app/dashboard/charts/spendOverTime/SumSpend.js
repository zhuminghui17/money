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
    Area,
    AreaChart,
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

const SumSpend = ({
    selectedKpi,
    selectedIndex,
    setSelectedIndex,
    filterCreditCards,
}) => {
    const {
        cumulativeSpend,
        cumulativeSpendNoCards,
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

    const finalSum = useMemo(() => cumulativeSpend?.length > 0 ? cumulativeSpend[cumulativeSpend.length - 1].spend : 0, [cumulativeSpend]);
    const finalSumNoCards = useMemo(() => cumulativeSpendNoCards?.length > 0 ? cumulativeSpendNoCards[cumulativeSpendNoCards.length - 1].spend : 0, [cumulativeSpendNoCards]);
    const finalTransactions = useMemo(() => cumulativeSpend?.length > 0 ? cumulativeSpend[cumulativeSpend.length - 1].count : 0, [cumulativeSpend]);
    const finalTransactionsNoCards = useMemo(() => cumulativeSpendNoCards?.length > 0 ? cumulativeSpendNoCards[cumulativeSpendNoCards.length - 1].count : 0, [cumulativeSpendNoCards]);

    return (
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
                <ChartContainer className="mt-5 h-72 w-full" config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={filterCreditCards === true ? cumulativeSpendNoCards : cumulativeSpend}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey={selectedKpi === "spend" ? "spend" : "count"}
                            type="natural"
                            fill="var(--color-spend)"
                            fillOpacity={0.4}
                            stroke="var(--color-spend)"
                            stackId="a"
                        />
                        <Area
                            dataKey={selectedKpi === "spend" ? "moneyIn" : "moneyInCount"}
                            type="natural"
                            fill="var(--color-moneyIn)"
                            fillOpacity={0.4}
                            stroke="var(--color-moneyIn)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
        </Card>
    )
}

export default SumSpend;
