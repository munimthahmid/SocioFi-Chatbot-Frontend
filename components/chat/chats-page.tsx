"use client"

import { useState, useEffect } from "react"
import { Home, MessageSquare, Folder, User, Search, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { getAuthToken } from "@/lib/auth"
import type { Chat } from "@/types/chat"

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:3000/api"

export function ChatsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/chatbot/chats`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    }
  }

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const createNewChat = async () => {
    try {
      const authToken = getAuthToken();
      console.log("authToken: ", authToken)
      const response = await fetch(`${BACKEND_ENDPOINT}/chatbot/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ title: `New Chat ${chats.length+1}` }),
      })
      if (response.ok) {
        const chat = await response.json()
        router.push(`/chat/${chat.id}`)
      }
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto h-[844px] relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] overflow-hidden rounded-[44px] border-[14px] border-[#0f172a]">
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
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="text-[#f97316]" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-[#f97316]">Chats</h1>
            <Button size="icon" variant="ghost" className="text-[#f97316]" onClick={createNewChat}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#fb923c]" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1e293b]/80 border-0 text-[#f97316] placeholder:text-[#fb923c]"
            />
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SocioFi%20(without%20name)-01_copy-c4Z8yhnRIKD7xEm31v4E9Zudnkj660.png"
            alt="SocioFi Logo"
            width={200}
            height={200}
          />
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <Link href={`/chat/${chat.id}`} key={chat.id}>
              <div className="flex items-center gap-4 p-4 hover:bg-[#1e293b] transition-colors border-b border-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#f97316]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[#f97316] font-medium truncate">{chat.title}</h3>
                    <span className="text-xs text-[#fb923c]">{chat.time}</span>
                  </div>
                  <p className="text-[#fb923c] text-sm truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread && (
                  <div className="min-w-[20px] h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-white">{chat.unread}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0f172a]">
          <BottomNavigation />
        </div>
      </div>
    </div>
  )
}
