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
  return chatHistory.map(history => ({ ...history, messages: JSON.parse(history.messages) }));
}

export const getChatInfoById = async (id) => {
  const user = await getUserInfo();
  const chatHistory = await db.chat.findFirst({
    where: {
      userId: user.id,
      chatId: id,
    }
  });

  if (chatHistory) {
    return {
      ...chatHistory,
      messages: JSON.parse(chatHistory.messages)
    };
  }
  else {
    return null;
  }

}

export const deleteChatChannel = async (id) => {
  const user = await getUserInfo();
  await db.chat.delete({
    where: {
      userId: user.id,
      id
    }
  });
  return "success";
}

export const clearChatHistory = async () => {
  const user = await getUserInfo();
  await db.chat.deleteMany({
    where: {
      userId: user.id
    }
  });
  return "success";
}

export const saveChatMessage = async (req) => {
  const { id, title, createdAt, path, messages } = req;
  const user = await getUserInfo();
  const chat = await db.chat.findFirst({
    where: {
      userId: user.id,
      chatId: id,
    }
  });

  if (!chat) {
    await db.chat.create({
      data: {
        userId: user.id,
        chatId: id,
        title,
        createdAt,
        path,
        messages: JSON.stringify(messages),
      }
    })

    return "success";
  }

  await db.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      messages: JSON.stringify(messages),
    }
  });

  return "success";
}
