"use client"

import Link from "next/link";
import { useSelector } from "react-redux";
import {
    Flex,
    Title,
    Text,
    Bold,
    BarList,
} from "@tremor/react";
import { Button } from "@/components/ui/button";
import {
    ArrowNarrowRightIcon,
} from "@heroicons/react/solid";
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { RootState } from "@/store";

const SpendByChannel = () => {
    const {
        paymentChannelData,
        filterDate,
        selectedAccounts
    } = useSelector((state: RootState) => state.user);

    return (
        <Card className="w-full p-6 bg-background">
            <Title>Spend by Sales Channel</Title>
            <Flex className="mt-4">
                <Text className="capitalize">
                    <Bold>Channel</Bold>
                </Text>
                <Text className="capitalize">
                    <Bold>Total Spend</Bold>
                </Text>
            </Flex>
            <BarList className="mt-4 sm:w-full" data={paymentChannelData} color={"emerald"} />
            
            <div className="pt-4">
                <Link
                    href={`/dashboard/transaction?channel=${paymentChannelData[0]?.name?.replace(
                        /\s\(\d+\)/,
                        ""
                    )}&startDate=${filterDate.startDate}&endDate=${
                        filterDate.endDate
                    }&accounts=${selectedAccounts.join(",")}`}
                >
                    <Button type="button" variant="outline">
                        View in Explorer
                        <ArrowNarrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>
            <br />
        </Card>
    )
}

export default SpendByChannel