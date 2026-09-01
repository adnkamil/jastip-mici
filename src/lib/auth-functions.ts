import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  verifyPassword,
} from './auth'

const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  brandName: z.string().optional(),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export const registerUser = createServerFn({ method: 'POST' })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })
    if (existing) {
      throw new Error('Email sudah terdaftar')
    }

    const passwordHash = await hashPassword(data.password)
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        brandName: data.brandName || null,
        email: data.email,
        passwordHash,
      })
      .returning()

    await createSession(user.id)
    return { id: user.id, name: user.name, email: user.email }
  })

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const loginUser = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })
    if (!user) {
      throw new Error('Email atau password salah')
    }

    const valid = await verifyPassword(data.password, user.passwordHash)
    if (!valid) {
      throw new Error('Email atau password salah')
    }

    await createSession(user.id)
    return { id: user.id, name: user.name, email: user.email }
  })

export const logoutUser = createServerFn({ method: 'POST' }).handler(
  async () => {
    await destroySession()
  },
)

export const fetchCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getSessionUser()
    if (!user) return null
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      brandName: user.brandName,
    }
  },
)
