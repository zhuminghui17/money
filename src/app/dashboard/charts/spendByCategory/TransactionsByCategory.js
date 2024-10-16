import Link from "next/link";
import { useSelector } from "react-redux";
import {
    Button,
    Card,
    Flex,
    Title,
    Text,
    Bold,
    BarList,
} from "@tremor/react";
import { 
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    LabelList,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart";
import {
    ArrowNarrowRightIcon,
} from "@heroicons/react/solid";

const TransactionsByCategory = () => {
    const {
        chartDataByMonth,
        filterDate,
        selectedAccounts,
    } = useSelector(state => state.user);

    const barListChartConfig = {
        value: {
            label: "Value",
            color: "hsl(var(--chart-2))",
        },
        name: {
            label: "Name",
            color: "hsl(var(--chart-2))",
        },
        label: {
            color: "hsl(var(--background))",
        },
    }

    return (
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
            {/* <ChartContainer className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full" config={barListChartConfig}>
                <BarChart
                    accessibilityLayer
                    data={chartDataByMonth.slice(0, 10)}
                    layout="vertical"
                    margin={{
                        right: 16,
                    }}
                >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        hide
                    />
                    <XAxis dataKey="value" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar
                        dataKey="value"
                        layout="vertical"
                        fill="var(--color-value)"
                        radius={4}
                    >
                    <LabelList
                        dataKey="name"
                        position="insideLeft"
                        offset={8}
                        className="fill-gray-900 dark:fill-white"
                        fontSize={12}
                    />
                    </Bar>
                    </BarChart>
            </ChartContainer> */}
            <BarList
                data={chartDataByMonth.slice(0, 10)}
                className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full"
                showAnimation={true}
                showtooltip={true}
            />
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
    )
}

export default TransactionsByCategory;
