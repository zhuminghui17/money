"use server"

import db from "../lib/db";
import { getUserInfo } from "./auth";

function escapeSpecialChars(str) {
  // Replace all special characters with their escaped equivalents
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export const getChatInfo = async () => {
  const user = await getUserInfo();
  const chatHistory = await db.chat.findMany({
    where: {
      userId: user.id,
    }
  });
  return chatHistory;
}

export const getChatInfoById = async (id) => {
  const user = await getUserInfo();
  const chatHistory = await db.chat.findFirst({
    where: {
      userId: user.id,
      id
    }
  });
  const messages = await db.message.findMany({
    where: {
      chatId: chatHistory.id
    }
  });
  return { ...chatHistory, messages };
}

export const deleteChatChannel = async (id) => {
  const user = await getUserInfo();
  await db.chat.delete({
    where: {
      userId: user.id,
      id
    }
  });
  await db.message.deleteMany({
    where: {
      chatId: id
    }
  });
  return "success";
}

export const updateChatChannelTitle = async (req) => {
  const { id, title } = req;
  const user = await getUserInfo();
  await db.chat.update({
    where: {
      userId: user.id,
      id
    },
    data: {
      title
    }
  });
  return "success";
}

export const clearChats = async () => {
  const user = await getUserInfo();
  const chats = await db.chat.findMany({
    where: {
      userId: user.id
    }
  });
  await db.chat.deleteMany({
    where: {
      userId: user.id
    }
  });
  await db.message.deleteMany({
    where: {
      chatId: { in: chats.map((chat) => chat.id) }
    }
  });
  return "success";
}

export const saveChat = async (req) => {
  const { id, title, createdAt, path, messages } = req;
  const user = await getUserInfo();
  const chat = await db.chat.create({
    data: {
      userId: user.id,
      id,
      title,
      createdAt,
      path,
      messages
    }
  });
  await db.message.createMany({
    data: messages.map((message) => ({
      ...message,
      chatId: chat.id,
    }))
  });
}
