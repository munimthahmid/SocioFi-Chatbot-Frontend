"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { signIn } from "@/lib/auth"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { access_token, user } = await signIn(email, password)
      
      // Store the access_token in a cookie instead of localStorage
      document.cookie = `authToken=${access_token}; path=/`
      
      // Store user info in localStorage (this is fine for user data)
      localStorage.setItem("user", JSON.stringify(user))

      router.push("/")
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <Image
              src="https://sjc.microlink.io/BwRF7siRNv9STezrfVv-aueNb-l3uhtP-Vh39IfNfiR6AOGshtkKGBdGOaOd2MpVX0YMaupAOySBKron0h_SMg.jpeg"
              alt="SocioFi Technology Logo"
              width={150}
              height={40}
              className="mb-8"
            />
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#f97316]">Sign in to your account</h2>
            <p className="mt-2 text-sm text-[#fb923c]">
              Or{" "}
              <Link href="/sign-up" className="font-medium text-[#f97316] hover:text-[#fb923c]">
                create a new account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-[#f97316]">
                    Email address
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1e293b]/80 border-[#f97316]/20 text-[#f97316] placeholder:text-[#fb923c]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-[#f97316]">
                    Password
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#1e293b]/80 border-[#f97316]/20 text-[#f97316]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link href="#" className="font-medium text-[#f97316] hover:text-[#fb923c]">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f97316] text-white hover:bg-[#fb923c]"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-[#0f172a]">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#f97316] mb-4">
                Revolutionizing Bangladesh's Industries with AI
              </h1>
              <p className="text-xl text-[#fb923c]">Introducing closedBagh: AI Tailored for Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
