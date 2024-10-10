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
    ArrowsExpandIcon,
} from "@heroicons/react/solid";

function filterAndSortBarListData(barListData, searchQuery) {
    const filteredData = barListData.filter(item => item.name !== null && item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const sortedFilteredData = filteredData.sort((a, b) => a.value > b.value);

    return sortedFilteredData;
}

const RecurringSpend = ({
    searchQuery
}) => {
    const {
        barListData
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

    const filteredpages = filterAndSortBarListData(barListData, searchQuery);

    return (
        <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
            {/* <ChartContainer className="mt-2 h-96 overflow-visible whitespace-nowrap text-overflow sm:w-full" config={barListChartConfig}>
                <BarChart
                    accessibilityLayer
                    data={filteredpages}
                    layout="vertical"
                    margin={{
                        right: 16,
                    }}
                    className="overflow-visible whitespace-nowrap text-overflow"
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
                data={filteredpages}
                className="mr-4 sm:min-w-full"
                showAnimation={true}
                showTooltip={true}
            />
        </div>
    )
}

export default RecurringSpend;
