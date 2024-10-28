"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Basic/Button";

const LoginForm = () => {
    const { data } = useSession();

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    return (
        <div className="flex h-screen">
            {/* Left Side: Image */}
            <div
                className="w-1/2 h-full"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            ></div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center w-1/2 h-full bg-white">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="items-center px-6">
                            <img
                                width="100%"
                                className="text-center"
                                src="https://assets-global.website-files.com/652f138fe3158780149d6e3e/652f8425f07d0af704f1bd52_Minimalist%20Orange%20Online%20Link%20Store%20Market%20Logo%20(1)-p-500.png"
                                alt="Logo"
                            />
                        </div>
                        <p className="text-center text-slate-700">Unlock new financial possibilities</p>
                        <Button
                            onClick={() => signIn("google", { callbackUrl })}
                            className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-6 transition duration-150 border rounded-lg border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow"
                            type={undefined}
                            disabled={undefined}
                            name={undefined}
                            href={undefined}
                        >
                            <img
                                className={`${data?.user && "mr-2"} h-8 w-8 rounded-full`}
                                src={data?.user?.image || "https://www.svgrepo.com/show/475656/google-color.svg"}
                                loading="lazy"
                                alt="google logo"
                            />
                            <div className={data?.user ? "text-sm" : "text-md"}>
                                {data?.user && <p className="text-xs">{data?.user?.name}</p>}
                                Continue with Google
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
