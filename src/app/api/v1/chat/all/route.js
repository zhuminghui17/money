import { NextResponse } from "next/server";
import {
  clearChats
} from "../../../../../server/chat";

export async function DELETE(req) {
  try {
    const data = await clearChats();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}