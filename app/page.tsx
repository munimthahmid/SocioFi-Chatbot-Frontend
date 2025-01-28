"use client"

import { useEffect, useState } from "react"
import { HomeScreen } from "@/components/home/home-screen"
import { useRouter } from "next/navigation"

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // If no user data is found, redirect to sign-in
      router.push("/sign-in")
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return <HomeScreen user={user} />
}
