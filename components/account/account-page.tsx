"use client"

import { useState, useRef, useEffect } from "react"
import {
  Home,
  MessageSquare,
  Folder,
  User,
  ArrowLeft,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"

interface UserInfo {
  name: string
  email: string
  role: string
  avatar: string
}

export function AccountPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<UserInfo>({
    name: "",
    email: "",
    role: "",
    avatar: "/placeholder.svg"
  })
  const [isUploading, setIsUploading] = useState(false)

  // Load user data from localStorage
  const loadUserData = () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser({
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role,
        avatar: userData.profile_picture 
          ? `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}${userData.profile_picture}`
          : "/placeholder.svg"
      })
    }
  }

  // Initial load
  useEffect(() => {
    loadUserData()
  }, [])

  const handleLogout = () => {
    // Clear auth token cookie
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Clear user data from localStorage
    localStorage.removeItem("user")
    
    // Redirect to sign-in page
    router.push("/sign-in")
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload profile picture')
      }

      const data = await response.json()
      
      // Update local user data
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        userData.profile_picture = data.profile_picture_url
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Force immediate UI update with the new URL
        const fullImageUrl = `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}${data.profile_picture_url}?t=${Date.now()}`
        setUser(prev => ({
          ...prev,
          avatar: fullImageUrl
        }))
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md mx-auto h-[844px] relative bg-[#ffedd5] overflow-hidden rounded-[44px] border-[14px] border-[#0f172a]">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-5 py-2 bg-[#0f172a] text-[#f97316]">
          <span className="text-sm font-medium">9:41</span>
          <div className="w-40 h-6 bg-black rounded-full relative">
            <div className="absolute inset-1.5 mx-auto w-16 h-3 bg-card rounded-full" />
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-white" />
            <div className="w-4 h-4 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Header */}
        <div className="p-4 border-b border-[#f97316]/20">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="text-[#f97316]" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-[#f97316]">Account</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 flex items-center space-x-4 border-b border-[#f97316]/20">
          <div className="relative">
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
              <Image
                key={user.avatar}
                src={user.avatar}
                alt={user.name}
                fill
                priority
                className={`object-cover ${isUploading ? 'opacity-50' : ''}`}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 p-1 bg-[#f97316] rounded-full cursor-pointer hover:bg-[#fb923c] transition-colors"
            >
              <Camera className="h-4 w-4 text-white" />
            </label>
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#f97316]">{user.name}</h2>
            <p className="text-sm text-[#fdba74]">{user.email}</p>
          </div>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-[#f97316]" />
                <span className="text-[#f97316]">Notifications</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                className="bg-[#f97316]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-[#f97316]" />
                <span className="text-[#f97316]">Dark Mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="bg-[#f97316]"
              />
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#f97316] hover:text-[#fb923c] hover:bg-[#f97316]/10"
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              Help & Support
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Log Out
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  )
}
