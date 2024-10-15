import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import apiCall from "@/utils/apiCall";

export async function getFullUserInfo() {
    const { accessToken } = await getServerSession(authOptions);
    const res = await apiCall.get(`/api/auth`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return res.data;
}

export async function updateUserInfoServerSide(data) {
    const { accessToken } = await getServerSession(authOptions);
    await apiCall.post("/api/user", data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`
        }
    });
}
