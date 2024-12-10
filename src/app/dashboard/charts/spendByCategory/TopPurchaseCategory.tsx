import { useState, useMemo, Fragment } from "react";
import { useSelector } from "react-redux";
import {
    Card,
    Flex,
    Title,
    Text,
    TextInput,
} from "@tremor/react";
import { Button } from "@/components/ui/button";
import { Label, Pie, PieChart } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Dialog, Transition } from "@headlessui/react";
import {
    SearchIcon,
    ArrowsExpandIcon,
    ArrowRightIcon
} from "@heroicons/react/solid";
import { usNumberformatter } from "@/utils/util";
import SpendCategory from "./SpendCategory";

const colors = [
    "#004d00", // Darkest green
    "#006600",
    "#008000",
    "#009900",
    "#00b300",
    "#00cc00",
    "#00e600",
    "#00ff00", // Pure green
    "#33ff33",
    "#66ff66", 
    "#99ff99",
    "#ccffcc"  // Lightest green
];

const TopPurchaseCategory = () => {
    const {
        donutChartData,
    } = useSelector((state: { user: { donutChartData: any[] } }) => state.user);

    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setSearchQuery("");
        setIsOpen(false);
    };

    const chartConfig = useMemo(() => donutChartData.filter((item: { name: null; }) => item && item.name !== null).reduce((acc: { [x: string]: { label: any; color: string; }; }, item: { name: string; }, idx: number) => {
        acc[item.name.replace(/\s+/g, '')] = {
            label: item.name,
            color: colors[idx % 12],
        }
        return acc;
    }, {}), [donutChartData])

    const totalPercent = useMemo(() => donutChartData.filter((item: { name: null; }) => item && item.name !== null).reduce((sum: any, item: { percent: any; }) => sum + item.percent, 0), [donutChartData])

    const chartData = useMemo(() => donutChartData.filter((item: { name: null; }) => item && item.name !== null).map((item: { name: string; }) => ({
        ...item,
        name: item.name.replace(/\s+/g, ''),
        fill: `var(--color-${item.name.replace(/\s+/g, '')})`
    })), [donutChartData])

    return (
        <Card className="w-full">
            <>
                <div className="w-full">
                    <Title>Top Purchase Categories</Title>
                    <Text>Your breakdown of purchases by merchant category</Text>
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square h-80 w-full"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="percent"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0)}
                                                className="fill-foreground text-2xl font-bold"
                                            >
                                                {`${usNumberformatter(totalPercent, 2)}%`}
                                            </tspan>
                                        </text>
                                        )
                                    }
                                    }}
                                />
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="name" />}
                                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                    <br />
                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={openModal}
                    >
                        Show more
                        <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                </div>
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
                                            <Text className="text-base font-medium">
                                                Spend Categories
                                            </Text>
                                        </Flex>
                                        <TextInput
                                            icon={SearchIcon}
                                            placeholder="Search..."
                                            className="mt-6"
                                            value={searchQuery}
                                            onChange={event => setSearchQuery(event.target.value)}
                                        />
                                        <SpendCategory searchQuery={searchQuery} />
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
        </Card>
    )
}

export default TopPurchaseCategory
