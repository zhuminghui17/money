import { NextResponse } from "next/server";
import {
  getUserInfo,
  updateUserAccount
} from "../../../../server/user";

export async function GET(req) {
  try {
    const data = await getUserInfo();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const { userInfo } = req.body;
    await updateUserAccount(userInfo);
    return NextResponse.json({
      message: "User account updated successfully",
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}

