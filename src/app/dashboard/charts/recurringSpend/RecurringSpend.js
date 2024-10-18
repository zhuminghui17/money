import { useSelector } from "react-redux";
import {
    BarList,
} from "@tremor/react";

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

    const filteredpages = filterAndSortBarListData(barListData, searchQuery);

    return (
        <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
            <BarList
                data={filteredpages}
                className="mr-4 sm:min-w-full"
                showAnimation={true}
                showtooltip={true}
            />
        </div>
    )
}

export default RecurringSpend;
