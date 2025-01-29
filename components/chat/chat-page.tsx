"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, MoreHorizontal, ThumbsUp, ThumbsDown, Share2, Paperclip, Mic, Send, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { getAuthToken } from "@/lib/auth"
import type { Message, User } from "@/types/chat"

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:3000/api"

interface User {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  profile_picture: string | null
  role: string
}

export function ChatPage({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [chatTitle, setChatTitle] = useState("Chat")
  const router = useRouter()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionType, setSuggestionType] = useState<"assign" | "mention" | "announce" | null>(null)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showTaskPrompt, setShowTaskPrompt] = useState(false)
  const [showAnnouncementPrompt, setShowAnnouncementPrompt] = useState(false)

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACKEND_ENDPOINT}/users/all`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        console.log("data: ", data)
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Implement voice recording logic here
  }

  useEffect(() => {
    fetchMessages()
  }, []) //Removed chatId from dependency array

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/chatbot/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const sendMessage = async (content: string) => {
    // Immediately add user's message to UI
    const userMessage = { role: "user", content: content, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMessage])
    setInput("")  // Clear input immediately

    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/chatbot/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("data: ", data)
        // Add only the assistant's response
        setMessages(prev => [...prev, 
          { role: "assistant", content: data.content, created_at: new Date().toISOString() }
        ])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // Optionally show an error message to the user
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // Handle left swipe (e.g., navigate to next chat)
      console.log("Swiped left")
    }
    if (isRightSwipe) {
      // Handle right swipe (e.g., navigate back)
      router.back()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    if (value.endsWith("@")) {
      setShowSuggestions(true)
      setSuggestionType(null)
      setFilteredUsers(users)
    } else if (value.includes("@assign")) {
      setShowSuggestions(true)
      setSuggestionType("assign")
      const searchTerm = value.split("@assign")[1].trim().toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName?.toLowerCase().includes(searchTerm) || user.lastName?.toLowerCase().includes(searchTerm),
        ),
      )
    } else if (value.includes("@announce")) {
      setShowSuggestions(false)
      setSuggestionType("announce")
      setShowAnnouncementPrompt(true)
    } else if (value.includes("@") && !value.includes("@assign") && !value.includes("@announce")) {
      setShowSuggestions(true)
      setSuggestionType("mention")
      const searchTerm = value.split("@").pop()?.toLowerCase() || ""
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName?.toLowerCase().includes(searchTerm) || user.lastName?.toLowerCase().includes(searchTerm),
        ),
      )
    } else {
      setShowSuggestions(false)
    }
  }

  const handleUserSelect = (user: User) => {
    if (suggestionType === "assign") {
      setInput(`@assign @${user.email} `)
      setSelectedUser(user)
      setShowTaskPrompt(true)
    } else {
      setInput(input.replace(/@[^@]*$/, `@${user.email} `))
    }
    setShowSuggestions(false)
  }

  const generateTaskTitle = (details: string): string => {
    const words = details.split(" ")
    const title = words.slice(0, 5).join(" ")
    return title.charAt(0).toUpperCase() + title.slice(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      let newMessage: Message = { role: "user", content: input }
      if (showTaskPrompt && selectedUser) {
        //This is a task assignment
        const taskDetails = input.trim()
        const taskTitle = generateTaskTitle(taskDetails)

        try {
          const response = await fetch(`${BACKEND_ENDPOINT}/tasks/create?chat_id=${chatId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({
              assignedTo: selectedUser.email,
              title: taskTitle,
              details: taskDetails,
              status: "Planning",
            }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log("task data: ", data)

            // Append the returned messages (user, task, assistant) to the state
            setMessages((prev) => [...prev, ...data])

            // Clear input and close prompt
            setInput("")
            setShowTaskPrompt(false)
          } else {
            console.error("Failed to create task")
          }
        } catch (error) {
          console.error("Failed to store task:", error)
        }
      } else if (showAnnouncementPrompt) {
        //This is an announcement
        const announcementContent = input.replace("@announce", "").trim()
      const announcementTitle = generateTaskTitle(announcementContent)

      try {
        const response = await fetch(`${BACKEND_ENDPOINT}/announcement/create?chat_id=${chatId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({
            title: announcementTitle,
            content: announcementContent,
            chat_id: chatId,
            date: new Date().toISOString(),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("data: ", data)

          // Append the returned messages (user, announcement, assistant) to the state
          setMessages((prev) => [...prev, ...data])

          // Clear input and close prompt
          setInput("")
          setShowAnnouncementPrompt(false)
        } else {
          console.error("Failed to create announcement")
        }
      } catch (error) {
        console.error("Failed to store announcement:", error)
      }
      }
      else
      {
        //This is a normal message
        
        try {
          await sendMessage(newMessage.content)
        } catch (error) {
          console.error("Failed to send message:", error)
        }
        
      }
      setInput("")
      setSelectedUser(null)
    }
  }

  useEffect(() => {
    if (showTaskPrompt || showAnnouncementPrompt) {
      const textarea = document.querySelector("textarea")
      if (textarea) {
        textarea.focus()
      }
    }
  }, [showTaskPrompt, showAnnouncementPrompt])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <Button variant="ghost" size="icon" className="text-[#f97316]" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <span className="text-[#f97316] font-medium">{chatTitle}</span>
          <Button variant="ghost" size="icon" className="text-[#f97316]">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
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

        {/* Chat Area */}
        <div className="flex flex-col h-[calc(100%-200px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl p-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-[#f97316] text-white"
                      : message.role === "announcement"
                        ? "bg-[#22c55e] text-white"
                        : "bg-[#1e293b]/80 text-[#f97316]"
                  }`}
                >
                  {message.assignedTo && (
                    <div>
                      <div className="font-bold mb-1">Task assigned to @{message.assignedTo}</div>
                      <div className="font-semibold">Title: {message.taskTitle}</div>
                      <div className="text-sm mb-2">Details: {message.taskDetails}</div>
                    </div>
                  )}
                  {message.role === "announcement" && (
                    <div>
                      <div className="font-bold mb-1">
                        <Megaphone className="inline-block mr-2 h-5 w-5" />
                        Announcement: {message.announcementTitle}
                      </div>
                      <div className="text-sm">{message.content}</div>
                    </div>
                  )}
                  {message.role !== "announcement" && message.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-[#fb923c]">Start a new conversation</p>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Add this empty div for scrolling */}
          </div>

          {/* Task Prompt */}
          {showTaskPrompt && (
            <div className="p-4 bg-[#1e293b]/80 border-t border-[#f97316]/20">
              <p className="text-[#f97316] mb-2">Please describe the task you want to assign:</p>
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.currentTarget.style.height = "auto"
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                }}
                placeholder="Enter task details..."
                className="bg-[#0f172a]/80 border-[#f97316]/20 text-[#f97316] placeholder:text-[#fb923c] min-h-[100px] max-h-[200px] overflow-y-auto resize-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
          )}

          {/* Announcement Prompt */}
          {showAnnouncementPrompt && (
            <div className="p-4 bg-[#1e293b]/80 border-t border-[#f97316]/20">
              <p className="text-[#f97316] mb-2">Please enter your announcement:</p>
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.currentTarget.style.height = "auto"
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                }}
                placeholder="Enter announcement details..."
                className="bg-[#0f172a]/80 border-[#f97316]/20 text-[#f97316] placeholder:text-[#fb923c] min-h-[100px] max-h-[200px] overflow-y-auto resize-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-primary/20">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <Button type="button" variant="ghost" size="icon" className="text-[#fb923c]" onClick={handleFileUpload}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => {
                    handleInputChange(e)
                    e.currentTarget.style.height = "auto"
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#1e293b]/80 border-0 text-[#f97316] placeholder:text-[#fb923c] rounded-xl min-h-[40px] max-h-[120px] py-2 px-4 resize-none overflow-hidden"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                {showSuggestions && (
                  <div className="absolute bottom-full left-0 w-full bg-[#1e293b] border border-[#f97316]/20 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {suggestionType === null && (
                      <div className="p-2">
                        <button
                          className="w-full text-left p-2 hover:bg-[#f97316]/20 text-[#f97316]"
                          onClick={() => {
                            setInput("@assign ")
                            setSuggestionType("assign")
                          }}
                        >
                          @assign
                        </button>
                        <button
                          className="w-full text-left p-2 hover:bg-[#f97316]/20 text-[#f97316]"
                          onClick={() => setSuggestionType("mention")}
                        >
                          @mention
                        </button>
                        <button
                          className="w-full text-left p-2 hover:bg-[#f97316]/20 text-[#f97316]"
                          onClick={() => {
                            setInput("@announce ")
                            setSuggestionType("announce")
                            setShowAnnouncementPrompt(true)
                          }}
                        >
                          @announce
                        </button>
                      </div>
                    )}
                    {(suggestionType === "assign" || suggestionType === "mention") &&
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          className="flex items-center w-full p-2 hover:bg-[#f97316]/20 text-[#f97316]"
                          onClick={() => handleUserSelect(user)}
                        >
                          <Image
                            src={user.profile_picture ? `${BACKEND_ENDPOINT}${user.profile_picture}` : "/placeholder.svg"}
                            alt={`${user.firstName || ''} ${user.lastName || ''}`}
                            width={24}
                            height={24}
                            className="rounded-full mr-2"
                          />
                          {user.firstName || ''} {user.lastName || ''}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("text-[#fb923c]", isRecording && "text-red-500")}
                onClick={toggleRecording}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" variant="ghost" size="icon" className="text-[#f97316]">
                <Send className="h-5 w-5" />
              </Button>
            </form>
            {selectedFile && (
              <div className="mt-2 px-4">
                <p className="text-xs text-[#fb923c]">Selected file: {selectedFile.name}</p>
              </div>
            )}
          </div>
        </div>

        <BottomNavigation className="bg-[#0f172a]" />
      </div>
    </div>
  )
}
