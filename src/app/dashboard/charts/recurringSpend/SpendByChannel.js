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

const SpendByChannel = () => {
    const {
        paymentChannelData,
        filterDate,
        selectedAccounts
    } = useSelector(state => state.user);

    return (
        <Card>
            <Title>Spend by Sales Channel</Title>
            <Flex className="mt-4">
                <Text className="capitalize">
                    <Bold>Channel</Bold>
                </Text>
                <Text className="capitalize">
                    <Bold>Total Spend</Bold>
                </Text>
            </Flex>
            <BarList className="mt-4 sm:w-full" data={paymentChannelData} />
            <Flex className="pt-4">
                <Link
                    href={`/dashboard/transaction?channel=${paymentChannelData[0]?.name?.replace(
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

export default SpendByChannel
