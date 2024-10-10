import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Card,
    Text,
    // LineChart,
} from "@tremor/react";
import { editDateProperty } from "../../../utils/util";

const Browe = () => {
    const chartConfig = useMemo(() => ({
        amount: {
            label: "Amount",
            color: "hsl(var(--chart-1))",
        },
        name: {
            label: "Name",
            color: "hsl(var(--chart-1))",
        },
        category: {
            label: "Category",
            color: "hsl(var(--chart-1))",
        },
    }), [])

    const { data: transactions, size: total } = useSelector(state => state.transactions);
    const reversedTransactions = useMemo(() => editDateProperty([...transactions].reverse()), [transactions]);

    return (
        <Card className="relative w-full mt-6 overflow-auto">
            <Text>Browse transactions over time </Text>
            <br />
            <ChartContainer className="h-72 w-full" config={chartConfig}>
                <LineChart
                    accessibilityLayer
                    data={reversedTransactions}
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
                        content={
                            <ChartTooltipContent
                                hideIndicator
                                className="w-fit"
                                formatter={(value, name, item, index) => (
                                <>
                                    {chartConfig[name]?.label}
                                    <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                                        {value}
                                    </div>
                                    {/* Add this after the last item */}
                                    {index === 0 && (
                                        <>
                                            <div className="flex justify-between basis-full items-center text-xs font-medium text-foreground">
                                                Name
                                                <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                                                    {item.payload.name}
                                                </div>
                                            </div>
                                            <div className="flex justify-between basis-full items-center text-xs font-medium text-foreground">
                                                Category
                                                <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                                                    {item.payload.category}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                                )}
                            />
                        }
                    />
                    <Line
                        dataKey="amount"
                        type="natural"
                        stroke="var(--color-amount)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
            {/* <LineChart
                data={reversedTransactions}
                index={"date"}
                showAnimation={true}
                startEndOnly={true}
                showTooltip={true}
                connectNulls={true}
                autoMinValue={true}
                showGradient={true}
                showLegend={false}
                showGridLines={true}
                categories={["amount", "name", "category"]}
                curveType="monotone"
                yAxisWidth={50}
            /> */}
        </Card>
    )
}

export default Browe
