import type { User } from "@/types/user"

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:3000/api"

// Helper function to check if we're on the client side
const isClient = typeof window !== 'undefined'

export async function signIn(email: string, password: string): Promise<{ access_token: string; user: User }> {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${BACKEND_ENDPOINT}/auth/signin`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to sign in")
  }

  const data = await response.json()
  // Only store in localStorage if we're on the client side
  if (isClient) {
    localStorage.setItem('authToken', data.access_token)
    localStorage.setItem('currentUser', JSON.stringify(data.user))
  }
  return { access_token: data.access_token, user: data.user }
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ access_token: string; user: User }> {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);

  const response = await fetch(`${BACKEND_ENDPOINT}/auth/signup`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 400 && errorData.detail === "Email not authorized for registration.") {
      throw new Error("Email not authorized for registration.")
    }
    throw new Error("Failed to sign up")
  }

  const data = await response.json()
  // Only store in localStorage if we're on the client side
  if (isClient) {
    localStorage.setItem('authToken', data.access_token)
    localStorage.setItem('currentUser', JSON.stringify(data.user))
  }
  return { access_token: data.access_token, user: data.user }
}

export function signOut(): void {
  if (isClient) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  }
}

export function getCurrentUser(): User | null {
  if (!isClient) {
    return null
  }
  const userStr = localStorage.getItem('currentUser')
  return userStr ? JSON.parse(userStr) : null
}

export function getAuthToken(): string | null {
  if (!isClient) {
    return null
  }
  return localStorage.getItem('authToken')
}
