import { useState, Fragment } from "react";
import { useSelector } from "react-redux";
import {
    Button,
    Card,
    Flex,
    Title,
    Text,
    Bold,
    BarList,
    TextInput,
} from "@tremor/react";
import {
    SearchIcon,
    ArrowsExpandIcon,
} from "@heroicons/react/solid";
import { Dialog, Transition } from "@headlessui/react";
import RecurringSpend from "./RecurringSpend";

const RecurringTransaction = () => {
    const {
        barListData
    } = useSelector(state => state.user);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const closeModal = () => {
        setSearchQuery("");
        setIsOpen(false);
    };
    const openModal = () => setIsOpen(true);

    return (
        <>
            <Card>
                <Title>Recurring Transactions</Title>
                <Flex className="mt-4">
                    <Text>
                        <Bold>Merchant</Bold>
                    </Text>
                    <Text>
                        <Bold>Total Spend</Bold>
                    </Text>
                </Flex>
                <BarList
                    data={barListData.slice(0, 10)}
                    className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full"
                    showtooltip={true}
                    showAnimation={true}
                />
                <Button
                    icon={ArrowsExpandIcon}
                    className="w-full mt-4"
                    onClick={openModal}
                    color="slate"
                >
                    Show more
                </Button>
            </Card>
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
                                        <Text className="text-base font-medium text-gray-700">
                                            Recurring Transactions
                                        </Text>
                                        <Text>Spend</Text>
                                    </Flex>
                                    <TextInput
                                        icon={SearchIcon}
                                        placeholder="Search..."
                                        className="mt-6"
                                        value={searchQuery}
                                        onChange={event => setSearchQuery(event.target.value)}
                                    />
                                    <RecurringSpend searchQuery={searchQuery} />
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
    )
}

export default RecurringTransaction;
