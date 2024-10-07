'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

// import { auth } from '@/lib/auth'
import { type Chat } from '@/lib/types'
import apiCall from './auth';
import { getFullUserInfo } from './auth'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const res = await apiCall.get(`${process.env.NEXT_APP_API_HOST}/api/chat`);
    const results = res.data;

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const res = await apiCall.get(`${process.env.NEXT_APP_API_HOST}/api/chat/${id}`);
  const chat = res.data as Chat;

  if (!chat) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await getFullUserInfo();

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  await apiCall.delete(`${process.env.NEXT_APP_API_HOST}/api/chat/${id}`);

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await getFullUserInfo();

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  await apiCall.patch(`${process.env.NEXT_APP_API_HOST}/api/chat/clear`);

  revalidatePath('/dashboard/chat')
  return redirect('/dashboard/chat')
}

// export async function getSharedChat(id: string) {
//   const chat = await kv.hgetall<Chat>(`chat:${id}`)

//   if (!chat || !chat.sharePath) {
//     return null
//   }

//   return chat
// }

// export async function shareChat(id: string) {
//   const session = await auth()

//   if (!session?.user?.id) {
//     return {
//       error: 'Unauthorized'
//     }
//   }

//   const chat = await kv.hgetall<Chat>(`chat:${id}`)

//   if (!chat || chat.userId !== session.user.id) {
//     return {
//       error: 'Something went wrong'
//     }
//   }

//   const payload = {
//     ...chat,
//     sharePath: `/share/${chat.id}`
//   }

//   await kv.hmset(`chat:${chat.id}`, payload)

//   return payload
// }

export async function saveChat(chat: Chat) {
  const session = await getFullUserInfo()

  if (session) {
    try {
      await apiCall.patch(`${process.env.NEXT_APP_API_HOST}/api/chat/save`, chat);
    } catch (error) {
      console.log(error);
    }
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
