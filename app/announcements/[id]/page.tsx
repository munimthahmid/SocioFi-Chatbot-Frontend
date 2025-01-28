"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface Announcement {
  id: number
  title: string
  content: string
  date: string
}

export default function AnnouncementDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    // Simulating fetching announcement details from a server
    const fetchAnnouncementDetails = () => {
      // This is a dummy implementation. In a real app, you'd fetch from an API.
      const dummyAnnouncement: Announcement = {
        id: Number.parseInt(params.id),
        title: "Important Announcement",
        content: "This is the full content of the announcement. It can be quite long and detailed.",
        date: "2023-06-15",
      }
      setAnnouncement(dummyAnnouncement)
    }

    fetchAnnouncementDetails()
  }, [params.id])

  if (!announcement) {
    return <div>Loading...</div>
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
            <h1 className="text-2xl font-bold text-[#f97316]">Announcement</h1>
            <div className="w-10" /> {/* Placeholder for balance */}
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

        {/* Announcement Details */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100% - 180px)" }}>
          <Card className="bg-[#1e293b]/80 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="w-8 h-8 text-[#f97316]" />
              <div>
                <h2 className="text-xl font-bold text-[#f97316]">{announcement.title}</h2>
                <p className="text-[#fb923c] text-sm">{announcement.date}</p>
              </div>
            </div>
            <p className="text-[#fdba74] text-base">{announcement.content}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

