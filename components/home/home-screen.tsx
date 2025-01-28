"use client"

import { useState, useEffect } from "react"
import {
  Home,
  MessageSquare,
  Folder,
  User,
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { ScheduleMeetingDialog } from "@/components/meetings/schedule-meeting-dialog"
import { getCurrentUser, getAuthToken } from "@/lib/auth"
import type { Task, Meeting, Announcement } from "@/types/data"

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:3000/api"

const taskStatuses = ["Planning", "In Progress", "Review", "Completed"]

export function HomeScreen({ user }) {
  const [showTasks, setShowTasks] = useState(false)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [showMeetings, setShowMeetings] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    if (user) {  
      fetchTasks()
      fetchAllTasks()
      fetchMeetings()
      fetchAnnouncements()
      console.log(user)
      console.log(user?.role)
    }
  }, [user])  

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/tasks`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const fetchAllTasks = async () => {
    if (user?.role !== "Employee") {
      try {
        const response = await fetch(`${BACKEND_ENDPOINT}/tasks/all`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setAllTasks(data)
        }
      } catch (error) {
        console.error("Failed to fetch all tasks:", error)
      }
    }
  }

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/meetings`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMeetings(data)
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/announcement/get-announcements`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    }
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  const handleAddMeeting = async (newMeeting: Omit<Meeting, "id">) => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(newMeeting),
      })
      if (response.ok) {
        fetchMeetings()
      }
    } catch (error) {
      console.error("Failed to add new meeting:", error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto h-[844px] relative bg-[#ffedd5] overflow-hidden rounded-[44px] border-[14px] border-[#0f172a]">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-5 py-2 bg-[#0f172a] text-white">
          <span className="text-sm font-medium">9:41</span>
          <div className="w-40 h-6 bg-black rounded-full relative">
            <div className="absolute inset-1.5 mx-auto w-16 h-3 bg-[#ffedd5] rounded-full" />
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-white" />
            <div className="w-4 h-4 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Company Header */}
        <div className="p-4 border-b border-primary/20 bg-[#0f172a] text-[#ea580c]">
          <div className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SocioFi%20(without%20name)-01_copy-c4Z8yhnRIKD7xEm31v4E9Zudnkj660.png"
              alt="SocioFi Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold">Hi! {user ? user.firstName : "User"}</h1>
              <p className="text-sm">Welcome back!</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6 relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-[#f97316] h-full overflow-y-auto">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SocioFi%20(without%20name)-01_copy-c4Z8yhnRIKD7xEm31v4E9Zudnkj660.png"
              alt="SocioFi Logo"
              width={200}
              height={200}
            />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* User's Running Tasks */}
            <Card
              className="bg-[#1e293b]/80 p-4 rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer touch-manipulation"
              onClick={() => setShowTasks(!showTasks)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#f97316]" />
                  <div>
                    <p className="text-[#f97316] text-sm font-medium">Your Running Tasks</p>
                    <p className="text-[#fb923c] text-xs">{tasks.length} active tasks</p>
                  </div>
                </div>
                {showTasks ? (
                  <ChevronDown className="w-5 h-5 text-[#f97316]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#f97316]" />
                )}
              </div>
              {showTasks && (
                <div className="mt-4 space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-[#0f172a]/80 p-2 rounded-lg">
                      <p className="text-[#f97316] text-sm">{task.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                          <SelectTrigger className="w-[120px] h-7 text-xs bg-[#1e293b]/80 border-[#f97316]/20 text-[#f97316]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatuses.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* All Active Tasks (for non-Employee roles) */}
            {user?.role !== "employee" && (
              <Card
                className="bg-[#1e293b]/80 p-4 rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer touch-manipulation"
                onClick={() => setShowAllTasks(!showAllTasks)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-[#f97316]" />
                    <div>
                      <p className="text-[#f97316] text-sm font-medium">All Active Tasks</p>
                      <p className="text-[#fb923c] text-xs">{allTasks.length} total tasks</p>
                    </div>
                  </div>
                  {showAllTasks ? (
                    <ChevronDown className="w-5 h-5 text-[#f97316]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#f97316]" />
                  )}
                </div>
                {showAllTasks && (
                  <div className="mt-4 space-y-2">
                    {allTasks.map((task) => (
                      <div key={task.id} className="bg-[#0f172a]/80 p-2 rounded-lg">
                        <p className="text-[#f97316] text-sm">{task.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[#fb923c] text-xs">Assigned to: {task.assignedTo}</p>
                          <p className="text-[#fb923c] text-xs">Status: {task.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Meetings */}
            <Card
              className="bg-[#1e293b]/80 p-4 rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer touch-manipulation"
              onClick={() => setShowMeetings(!showMeetings)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-[#f97316]" />
                  <div>
                    <p className="text-[#f97316] text-sm font-medium">Upcoming Meetings</p>
                    <p className="text-[#fb923c] text-xs">{meetings.length} meetings today</p>
                  </div>
                </div>
                {showMeetings ? (
                  <ChevronDown className="w-5 h-5 text-[#f97316]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#f97316]" />
                )}
              </div>
              {showMeetings && (
                <div className="mt-4 space-y-2">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="bg-[#0f172a]/80 p-2 rounded-lg">
                      <p className="text-[#f97316] text-sm">{meeting.title}</p>
                      <p className="text-[#fdba74] text-xs">
                        {meeting.date} at {meeting.time}
                      </p>
                      <p className="text-[#fdba74] text-xs">Channel: {meeting.channel}</p>
                    </div>
                  ))}
                  {user?.role !== "Employee" && (
                    <Button
                      onClick={() => setIsScheduleDialogOpen(true)}
                      className="w-full bg-[#f97316] text-white hover:bg-[#fb923c]"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Schedule New Meeting
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Announcements Section */}
          <div className="space-y-3">
            <h2 className="text-[#f97316] text-xl font-bold">Announcements</h2>
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <Link href={`/announcements/${announcement.id}`} key={announcement.id}>
                  <Card className="bg-[#1e293b]/80 p-4 rounded-xl flex items-center justify-between hover:bg-[#1e293b] transition-colors touch-manipulation">
                    <div className="flex items-center gap-3">
                      <Megaphone className="w-5 h-5 text-[#f97316]" />
                      <div>
                        <span className="text-[#fdba74] text-sm font-medium">{announcement.title}</span>
                        <p className="text-[#fb923c] text-xs">{announcement.content}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#f97316]" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-primary/20 bg-[#0f172a]">
          <BottomNavigation />
        </div>
      </div>

      <ScheduleMeetingDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        onSchedule={handleAddMeeting}
      />
    </div>
  )
}
