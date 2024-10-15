"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "../lib/db";

export const signIn = async (info) => {
  const {
    email,
    name,
    picture: image,
    given_name,
    family_name,
    locale,
  } = info;

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  let userInfo = await db.user.upsert({
    where: { email },
    create: {
      email,
      name,
      image,
      given_name,
      family_name: family_name || "",
      locale,
    },
    update: {
      name,
      image,
      given_name,
      family_name: family_name || "",
      locale,
    },
  });

  let user = userInfo;
  let isAdmin = userInfo.email === process.env.ADMIN_EMAIL;
  let isNewUser = existingUser ? true : false;
  let isPro = userInfo.isPro;
  if (!isPro) {
    const createdAtDate = new Date(user.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (createdAtDate > sevenDaysAgo) {
      isPro = true;
    }
  }

  await db.user.update({
    where: { email },
    data: {
      kpis_prev: userInfo.kpis,
    },
  });
  
  return {
    isNewUser,
    isPro,
    isAdmin
  };
}

export const getUserInfo = async () => {
  const session = await getServerSession(authOptions);
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  return user;
}