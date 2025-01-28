"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Meeting } from "@/types/data"

interface ScheduleMeetingDialogProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (meeting: Omit<Meeting, "id">) => void
}

export function ScheduleMeetingDialog({ isOpen, onClose, onSchedule }: ScheduleMeetingDialogProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [channel, setChannel] = useState("")

  const handleSchedule = () => {
    if (title && date && time && channel) {
      onSchedule({
        title,
        date: format(date, "yyyy-MM-dd"),
        time,
        channel,
      })
      onClose()
      setTitle("")
      setDate(undefined)
      setTime("")
      setChannel("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1e293b] text-[#f97316] border-[#f97316]/20">
        <DialogHeader>
          <DialogTitle className="text-[#f97316]">Schedule New Meeting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-[#f97316]">
              Meeting Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#0f172a]/80 border-[#f97316]/20 text-[#f97316] placeholder:text-[#fb923c]"
            />
          </div>
          <div>
            <Label className="text-[#f97316]">Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-[#f97316]/20"
            />
          </div>
          <div>
            <Label htmlFor="time" className="text-[#f97316]">
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-[#0f172a]/80 border-[#f97316]/20 text-[#f97316]"
            />
          </div>
          <div>
            <Label htmlFor="channel" className="text-[#f97316]">
              Meeting Channel
            </Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="channel" className="bg-[#0f172a]/80 border-[#f97316]/20 text-[#f97316]">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                {["Azure", "Backend", "Fine-tuning", "Frontend", "General", "Jamming"].map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="border-[#f97316]/20 text-[#f97316]">
            Cancel
          </Button>
          <Button onClick={handleSchedule} className="bg-[#f97316] text-white hover:bg-[#fb923c]">
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

