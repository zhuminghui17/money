import { useSelector } from "react-redux";
import {
    BarList
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

const SpendCategory = ({
    searchQuery
}) => {
    const {
        donutAsBarData,
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
        <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
            {/* <ChartContainer className={`mr-4 sm:min-w-full h-80`} config={barListChartConfig}>
                <BarChart
                    accessibilityLayer
                    data={donutAsBarData.filter(item => 
                        item.name !== null && 
                        item.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    )}
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
                    <LabelList
                        dataKey="value"
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                    />
                    </Bar>
                </BarChart>
            </ChartContainer> */}
            <BarList
                data={donutAsBarData.filter(item => 
                    item.name !== null && 
                    item.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )}
                className="mr-4 sm:min-w-full"
                showAnimation={true}
                showtooltip={true}
            />
        </div>
    )
}

export default SpendCategory;
