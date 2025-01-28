"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { ArrowLeft, ImageIcon, Mic, MoreHorizontal, ThumbsDown, ThumbsUp, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const [view, setView] = useState<"prompt" | "chat">("prompt")

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto h-[844px] relative bg-card overflow-hidden rounded-[44px] border-[14px] border-black">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-5 py-2 bg-black text-white">
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
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <span className="text-white font-medium">
            {view === "prompt" ? "Speaking to AI Bot" : "Chat with AI Bot"}
          </span>
          <Button variant="ghost" size="icon" className="text-white">
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

        {view === "prompt" ? (
          // Prompt View
          <div className="flex flex-col items-center justify-center h-[calc(100%-140px)] px-6 text-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/original-71c164b822161b2af1f123ccacbdc2bb-49sDEV6XHE7p5YDejscOSjua0E4vlO.webp"
              alt="AI Assistant"
              className="w-32 h-32 mb-8"
            />
            <h1 className="text-2xl font-bold text-white mb-2">Describe and show me the</h1>
            <p className="text-2xl font-bold text-secondary-foreground">
              perfect vacation spot on an island in the ocean
            </p>
            <div className="flex gap-4 mt-12">
              <Button size="lg" variant="outline" className="rounded-full w-14 h-14 bg-primary/20 border-0">
                <ImageIcon className="w-6 h-6 text-white" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-14 h-14 bg-primary/20 border-0"
                onClick={() => setView("chat")}
              >
                <Mic className="w-6 h-6 text-white" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full w-14 h-14 bg-primary/20 border-0">
                <MoreHorizontal className="w-6 h-6 text-white" />
              </Button>
            </div>
          </div>
        ) : (
          // Chat View
          <div className="flex flex-col h-[calc(100%-140px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-end">
                <div className="bg-primary text-white rounded-2xl p-3 max-w-[80%]">
                  Describe and show me the perfect vacation spot on an island in the ocean
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-primary/20 rounded-2xl p-4 max-w-[80%]">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Tropical Island"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <p className="text-white text-sm">
                    Imagine yourself on an idyllic island in the middle of the vast ocean, where turquoise waters and
                    powdery white sand surround you. This perfect vacation spot is a tropical paradise that offers a
                    blend of tranquility and adventure.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-primary/20">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 bg-primary/20 border-0 text-white placeholder:text-secondary-foreground"
                />
                <Button type="submit" size="icon" variant="ghost">
                  <Mic className="h-6 w-6 text-white" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

