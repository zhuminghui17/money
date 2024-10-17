"use client";

import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/store/actions/useUser";
import { Flex, TextInput, Text, Button } from "@tremor/react";
import { isEmpty } from "@/utils/util";
import toast from "react-hot-toast";

const WelcomeModal = () => {
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(0);
    const [moving, setMoving] = useState("right");
    const { data: session, update: sessionUpdate } = useSession();
    // set userInfo object and default database URL. Replace with your own database URL
    const [userInfo, setUserInfo] = useState({
        openAiKey:"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",
        mongoDBURL: "mongodb+srv://db:SrZJK2asnUlmiE7y@qashboard.ftpcnz0.mongodb.net/?retryWrites=true&w=majority",
        isNewUser: false,
    });
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const [steps, setSteps] = useState([
        { name: "Step 1", status: "current" },
        { name: "Step 2", status: "upcoming" },
        { name: "Step 3", status: "upcoming" }
    ]);

    const handleCloseModal = async () => {
        if (isEmpty(userInfo.openAiKey) || isEmpty(userInfo.mongoDBURL)) {
            toast.error("Please Input keys");
            return;
        }
        if (!isEmpty(userInfo.openAiKey) && !isEmpty(userInfo.mongoDBURL)){
            dispatch(updateUserInfo(userInfo));
            await sessionUpdate({ isNewUser: false });
        }
    };

    const prevStep = () => {
        setMoving("left");
        setSteps(old =>
            old.map((v, i) => {
                if (i === currentStep) {
                    v.status = "upcoming";
                } else if (i === currentStep - 1) {
                    v.status = "current";
                }
                return v;
            })
        );
        setCurrentStep(currentStep - 1);
        return false;
    };

    const nextStep = async () => {
        setMoving("right");

        if (true) {
            setSteps(old =>
                old.map((v, i) => {
                    if (i === currentStep) {
                        v.status = "complete";
                    } else if (i === currentStep + 1) {
                        v.status = "current";
                    }
                    return v;
                })
            );
            setCurrentStep(currentStep + 1);
        }
        return false;
    };

    return (
        <>
            {session?.user?.isNewUser && (
                <div className="absolute inset-0 z-50">
                    <div
                        className="fixed inset-0 w-screen h-screen bg-gray-200-muted"
                        // onClick={() => setShowModal(false)}
                    />
                    <div className="flex items-center w-screen h-screen px-4 py-8 ">
                        <div className="relative mx-auto min-w-[45vw] px-8 py-8 max-w-lg rounded-md bg-white p-10 shadow-lg">
                            <img
                                width="100%"
                                height={10}
                                className="text-center"
                                src="https://assets-global.website-files.com/652f138fe3158780149d6e3e/652f8425f07d0af704f1bd52_Minimalist%20Orange%20Online%20Link%20Store%20Market%20Logo%20(1)-p-500.png"
                                alt="Logo"
                            />
                            <div className="relative mt-2 flex h-[60vh] flex-nowrap py-4">
                                <Transition
                                    appear={false}
                                    unmount={false}
                                    show={currentStep === 0}
                                    enter="transform transition ease-in-out duration-500"
                                    enterFrom={`${
                                        moving === "right"
                                            ? "translate-x-96"
                                            : "-translate-x-96"
                                    } opacity-0`}
                                    enterTo="translate-x-0 opacity-100"
                                    leave="transform transition ease-in-out duration-500 "
                                    leaveFrom="translate-x-0 opacity-100"
                                    leaveTo={`${
                                        moving === "right"
                                            ? "-translate-x-96"
                                            : "translate-x-96"
                                    } opacity-0`}
                                    className="w-0"
                                    as="div"
                                >
                                    <div className="w-[40vw] pr-4 text-black">
                                        <strong><p>{"Start your 14-day free trial to Qashboard, the Q&A dashboard to unlock a bird's eye view of your finances. No card down today!"}</p></strong>
                                        <br/><p>Start connecting your bank, credit cards, and investment accounts using <a href="https://plaid.com/" target="blank">Plaid</a>{" & "} store the financial data to your own database!</p>
                                        <div className="mt-4" height={35}> 
                                            <img src="https://assets-global.website-files.com/652f138fe3158780149d6e3e/652f7c38ebb43a66288f0bdd_image%20(5).png" width={"100%"} alt="promo_screen" />
                                        </div>
                                    </div>
                                </Transition>

                                <Transition
                                    appear={false}
                                    unmount={false}
                                    show={currentStep === 1}
                                    enter="transform transition ease-in-out duration-500"
                                    enterFrom={`${
                                        moving === "right"
                                            ? "translate-x-96"
                                            : "-translate-x-96"
                                    } opacity-0`}
                                    enterTo="translate-x-0 opacity-100"
                                    leave="transform transition ease-in-out duration-500 "
                                    leaveFrom="translate-x-0 opacity-100"
                                    leaveTo={`${
                                        moving === "right"
                                            ? "-translate-x-96"
                                            : "translate-x-96"
                                    } opacity-0`}
                                    className="w-0"
                                    as="div"
                                >
                                    <div className="w-[40vw]">
                                        <strong><p>Completely own your financial data!</p></strong>
                                        <p>Keep your information safe by replacing the default datastore with your own database to ensure no one sees anything but you.</p>
                                        <a className="underline" href="https://scribehow.com/shared/How_to_Create_an_Organization_and_Project_in_MongoDB__GbBG4vJGR1eto20dmlfchA" target="blank">Learn More</a>
                                        <br/>
                                        <iframe className="w-full" src="https://scribehow.com/embed/How_to_Create_an_Organization_and_Project_in_MongoDB__GbBG4vJGR1eto20dmlfchA" height="360" frameborder="0"></iframe>
                                    </div>
                                </Transition>
                                <Transition
                                    appear={false}
                                    unmount={false}
                                    show={currentStep === 2}
                                    enter="transform transition ease-in-out duration-500"
                                    enterFrom={`${
                                        moving === "right"
                                            ? "translate-x-96"
                                            : "-translate-x-96"
                                    } opacity-0`}
                                    enterTo="translate-x-0 opacity-100"
                                    leave="transform transition ease-in-out duration-500 "
                                    leaveFrom="translate-x-0 opacity-100"
                                    leaveTo={`${
                                        moving === "right"
                                            ? "-translate-x-96"
                                            : "translate-x-96"
                                    } opacity-0`}
                                    className="w-0"
                                    as="div"
                                >
                                    <div className="w-[40vw]">
                                        <Text className="my-2 truncate">
                                           <strong>Replace with your own OpenAI API Key</strong>
                                        </Text>
                                        <TextInput
                                            className="my-2"
                                            value={userInfo?.openAiKey ?? "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"}
                                            onChange={e =>
                                                setUserInfo({
                                                    ...userInfo,
                                                    openAiKey: e.target.value
                                                })
                                            }
                                        />
                                        <Text>
                                        If you have not obtained your OpenAI API key, you can do so by creating one {"@ "} 
                                        <a
                                            href="https://platform.openai.com/signup/"
                                            target="blank"
                                            className="underline"
                                        > OpenAI Playground</a>.
                                        </Text>
                                        <br/>
                                        <Text>
                                       <strong>Optional: Connect to your own database</strong>
                                        </Text>
                                        <Text className="mt-2">
                                            Replace the default datasource with a MongoDB connection URL to store your data directly to a custom cluster. You can create one for free <a className="underline" href="https://docs.mongodb.com/manual/reference/connection-string/">here</a> to completely store and own your data.
                                        </Text>
                                        <TextInput
                                            className="my-2"
                                            value={userInfo?.mongoDBURL}
                                            placeholder={userInfo?.mongoDBURL}
                                            onChange={e =>
                                                setUserInfo({
                                                    ...userInfo,
                                                    mongoDBURL: e.target.value
                                                })
                                            }
                                        />
                                        <br/>
                                        <Text className="text-sm text-gray-600">
                                            {"If you replace the default MongoDB URL, ensure it's correctly formatted with database server's address, port, and credentials. Format: mongodb://username:password@server:port/dbname"}
                                        </Text>
                                        <br/>
                                        <Flex justifyContent="center">
                                            <Button onClick={handleCloseModal}>
                                                Submit
                                            </Button>
                                        </Flex>
                                        <br/>
                                    </div>
                                </Transition>
                            </div>
                            <div className="w-full gap-2 mt-3">
                                <nav
                                    className="flex items-center justify-between"
                                    aria-label="Progress"
                                >
                                    { currentStep > 0 && <button
                                        className="text-black"
                                        type="button"
                                        disabled={currentStep === 0}
                                        onClick={() => prevStep()}
                                    >
                                        Prev
                                    </button>}
                                    <ol className="flex items-center mx-8 space-x-5">
                                        {steps.map((step, i) => (
                                            <li key={`step_${i}`}>
                                                {step.status === "complete" ? (
                                                    <div className="block h-2.5 w-2.5 cursor-pointer rounded-full bg-indigo-600 hover:bg-indigo-900">
                                                        <span className="sr-only"></span>
                                                    </div>
                                                ) : step.status ===
                                                  "current" ? (
                                                    <div
                                                        className="relative flex items-center justify-center cursor-pointer"
                                                        aria-current="step"
                                                    >
                                                        <span
                                                            className="absolute flex w-5 h-5 p-px"
                                                            aria-hidden="true"
                                                        >
                                                            <span className="w-full h-full bg-indigo-200 rounded-full" />
                                                        </span>
                                                        <span
                                                            className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="sr-only"></span>
                                                    </div>
                                                ) : (
                                                    <div className="block h-2.5 w-2.5 cursor-pointer rounded-full bg-gray-200 hover:bg-gray-400">
                                                        <span className="sr-only"></span>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                   {currentStep < 2 && <button
                                        className="text-black"
                                        type="button"
                                        disabled={currentStep === 2}
                                        onClick={() => nextStep()}
                                    >
                                        Next
                                    </button>}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WelcomeModal;
