"use client"

import { useState, useRef } from "react"
import { Home, MessageSquare, Folder, User, ArrowLeft, Upload, Download, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"

interface Document {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  accessLevel: string[]
}

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    type: "PDF",
    size: "2.5 MB",
    lastModified: "2023-05-15",
    accessLevel: ["All"],
  },
  {
    id: "2",
    name: "Financial Report Q2.xlsx",
    type: "Excel",
    size: "1.8 MB",
    lastModified: "2023-06-01",
    accessLevel: ["CTO", "CFO"],
  },
  {
    id: "3",
    name: "Marketing Strategy.docx",
    type: "Word",
    size: "3.2 MB",
    lastModified: "2023-06-10",
    accessLevel: ["CMO", "Employees"],
  },
]

const accessLevels = ["All", "Founder", "CTO", "CFO", "CMO", "Employees"]

export function FoldersPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAccess, setSelectedAccess] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAccessChange = (level: string) => {
    setSelectedAccess((prev) => {
      if (level === "All") {
        return prev.includes("All") ? [] : accessLevels
      } else {
        const newAccess = prev.includes(level)
          ? prev.filter((l) => l !== level && l !== "All")
          : [...prev.filter((l) => l !== "All"), level]
        return newAccess.length === accessLevels.length - 1 ? accessLevels : newAccess
      }
    })
  }

  const handleUpload = () => {
    if (selectedFile) {
      const newDocument: Document = {
        id: (documents.length + 1).toString(),
        name: selectedFile.name,
        type: selectedFile.type.split("/")[1].toUpperCase(),
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        lastModified: new Date().toISOString().split("T")[0],
        accessLevel: selectedAccess.length > 0 ? selectedAccess : ["All"],
      }
      setDocuments([newDocument, ...documents])
      setSelectedFile(null)
      setSelectedAccess([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const handleDownload = (document: Document) => {
    // In a real application, this would initiate a file download
    console.log(`Downloading ${document.name}`)
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
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="text-[#f97316]" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-[#f97316]">Folders</h1>
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

        {/* Upload Section */}
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-[#1e293b]/80 border-[#f97316]/20 text-[#f97316]"
            >
              {selectedFile ? selectedFile.name : "Select File"}
            </Button>
          </div>
          <div className="mb-2 grid grid-cols-2 gap-2">
            {accessLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={selectedAccess.includes(level)}
                  onCheckedChange={() => handleAccessChange(level)}
                />
                <label
                  htmlFor={level}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#f97316]"
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} disabled={!selectedFile} className="w-full bg-primary text-[#f97316]">
            <Upload className="w-4 h-4 mr-2 text-[#f97316]" /> Upload File
          </Button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 hover:bg-[#1e293b] transition-colors border-b border-primary/10"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-8 h-8 text-[#f97316]" />
                <div>
                  <p className="text-[#f97316] font-medium">{doc.name}</p>
                  <p className="text-[#fb923c] text-xs">
                    {doc.type} • {doc.size} • {doc.lastModified}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                  <Download className="w-4 h-4 text-[#f97316]" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="w-4 h-4 text-[#f97316]" />
                </Button>
                <Lock className="w-4 h-4 text-[#fb923c]" title={`Access: ${doc.accessLevel.join(", ")}`} />
              </div>
            </div>
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

