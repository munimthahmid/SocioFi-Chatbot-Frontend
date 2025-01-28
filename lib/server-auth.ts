import { cookies } from "next/headers"
import type { User } from "@/types/user"

export function setAuthCookie(token: string) {
  cookies().set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

export function removeAuthCookie() {
  cookies().delete("authToken")
}

export function getAuthToken(): string | null {
  return cookies().get("authToken")?.value || null
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) return null

  // Here you would typically validate the token and fetch user data from your backend
  // For now, we'll return a dummy user
  return {
    id: "1",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
  }
}

