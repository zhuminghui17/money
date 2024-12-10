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
    ArrowNarrowRightIcon,
} from "@heroicons/react/solid";
import { RootState } from "@/store";

const TransactionsByCategory = () => {
    const {
        chartDataByMonth,
        filterDate,
        selectedAccounts,
    } = useSelector((state: RootState) => state.user);

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
            <BarList
                data={chartDataByMonth.slice(0, 10)}
                className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full"
                showAnimation={true}
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
