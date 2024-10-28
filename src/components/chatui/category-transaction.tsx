import Link from 'next/link';
import {
    Card,
    Text,
    BarList,
    Title,
    Flex,
    Bold,
} from "@tremor/react";
import {
    ArrowNarrowRightIcon,
} from "@heroicons/react/solid";

interface CategoryTransaction {
    name: string;
    count: number;
    value: number;
}

const CategoryTransactions = ({
    props
} : { 
    props: {
        chartDataByMonth: CategoryTransaction[],
        filterDate: {
            startDate: string,
            endDate: string,
        }
    }
 }) => {
    const { chartDataByMonth, filterDate } = props;

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
            className='mt-2 overflow-visible whitespace-normal text-overflow  sm:w-full'
            showAnimation={true}
            data={chartDataByMonth}
        />
        <Flex className="pt-4">
            <Link
                href={`/dashboard/transaction?financeCategory=${chartDataByMonth[0]?.name?.replace(
                    /\s\(\d+\)/,
                    ""
                )}&startDate=${filterDate.startDate}&endDate=${
                    filterDate.endDate
                }&accounts=`}
            >
                <div className='flex items-center'>
                    <p className='text-sm'>View in Explorer</p>
                    <ArrowNarrowRightIcon className='w-4 ml-2' />
                </div>
            </Link>
        </Flex>
        <br />
    </Card>
  )
}

export default CategoryTransactions;