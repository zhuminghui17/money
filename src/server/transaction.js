"use server"

import db from "../lib/db";
import { getUserInfo } from "./auth";
import { isEmpty } from "./utils";

export const getTransaction = async (filter) => {
  const {
    currentPage,
    pageSize,
    filterDate,
    merchantName,
    priceRange,
    selectedAccounts,
    selectedCategories,
    selectedPaymentChannel,
    selectedFinCategories,
  } = filter;
  const user = await getUserInfo();
  let query = { userId: user.id };

  if (!isEmpty(filterDate?.startDate) || !user.storeAYear) {
    let start_date = new Date(filterDate.startDate);
    if (!user.storeAYear) {
      const now = new Date();
      const firstDate = new Date(now.getFullYear(), 0, 1);
      if (start_date < firstDate) start_date = firstDate;
    }
    query.date = { gte: start_date };
  }
  if (!isEmpty(filterDate?.endDate)) {
    const end_date = new Date(filterDate.endDate);
    query.date = { ...query.date, lte: end_date };
  }

  if (priceRange.minPrice !== "") {
    query.amount = { gte: Number(priceRange.minPrice) };
  }
  if (priceRange.maxPrice !== "") {
    query.amount = {...query.amount, lte: Number(priceRange.maxPrice) };
  }

  if (merchantName !== "") {
    query.name = { contains: merchantName };
  }

  if (selectedPaymentChannel != "all") {
    query.payment_channel = selectedPaymentChannel;
  }

  if (selectedAccounts.length > 0) {
    query.account_id = { in: selectedAccounts };
  }

  if (selectedCategories.length > 0) {
    query.OR = selectedCategories.map(category => ({
      category: {
        has: category,
      },
    }));
  }

  if (selectedFinCategories.length > 0) {
    query.personal_finance_category = {
      primary: {
        in: selectedFinCategories,
      }
    }
  }

  const totalFilteredData = await db.transaction.count({
    where: {
      ...query
    }
  });
  const data = await db.transaction.findMany({
    where: {
      ...query
    },
    orderBy: {
      date: "desc"
    },
    take: 10,
  });
  return { size: totalFilteredData, data };
}