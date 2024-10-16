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
    },
    include: {
      messages: true,
    }
  });
  return chatHistory;
}

export const getChatInfoById = async (id) => {
  const user = await getUserInfo();
  const chatHistory = await db.chat.findFirst({
    where: {
      userId: user.id,
      chatId: id,
    },
    include: {
      messages: true,
    }
  });
  return chatHistory;
}

export const deleteChatChannel = async (id) => {
  const user = await getUserInfo();
  await db.chat.delete({
    where: {
      userId: user.id,
      id
    }
  });
  // await db.message.deleteMany({
  //   where: {
  //     chatId: id
  //   }
  // });
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

export const clearChatHistory = async () => {
  const user = await getUserInfo();
  const chats = await db.chat.findMany({
    where: {
      userId: user.id
    },
    include: {
      messages: true,
    }
  });
  await db.chat.deleteMany({
    where: {
      userId: user.id
    }
  });
  // await db.message.deleteMany({
  //   where: {
  //     chatId: { in: chats.map((chat) => chat.id) }
  //   }
  // });
  return "success";
}

export const saveChatMessage = async (req) => {
  const { id, title, createdAt, path, messages } = req;
  const user = await getUserInfo();
  let chat = await db.chat.findFirst({
    where: {
      userId: user.id,
      chatId: id,
    }
  });

  if (!chat) {
    chat = await db.chat.create({
      data: {
        userId: user.id,
        chatId: id,
        title,
        createdAt,
        path,
      }
    })
  }
  const msgCount = await db.message.count({
    where: {
      chatId: chat.id,
    }
  });
  
  const newMsgs = messages.slice(msgCount, messages.length);
  await db.message.createMany({
    data: newMsgs.map((message) => ({
      role: message.role,
      name: message.name,
      content: message.content,
      chatId: chat.id,
    }))
  });
}
