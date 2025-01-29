"use client"

import { useState, useRef, useEffect } from "react"
import { Home, MessageSquare, Folder, User, ArrowLeft, Upload, Download, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { getAuthToken, getCurrentUser } from "@/lib/auth"

interface Document {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  accessLevel: string[]
}

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:3000/api"

// Define allowed roles for each user level
const allowedRolesByLevel = {
  CEO: ["All", "CEO", "CTO", "Finance", "Admin", "Manager", "Employee"],
  CTO: ["All", "CTO", "Finance", "Admin", "Manager", "Employee"],
  Finance: ["All", "Finance", "Admin", "Manager", "Employee"],
  Admin: ["All", "Admin", "Manager", "Employee"],
  Manager: ["All", "Manager", "Employee"],
  Employee: ["All", "Employee"]
} as const

export function FoldersPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAccess, setSelectedAccess] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user after component mounts (client-side only)
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (!currentUser) {
      router.push('/sign-in')
      return
    }
    fetchDocuments()
  }, [])

  const getAllowedRoles = () => {
    const userRole = user?.role || "Employee"
    return allowedRolesByLevel[userRole as keyof typeof allowedRolesByLevel] || ["Employee"]
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/documents`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Transform backend data to match our frontend model
        const transformedData = data.map((doc: any) => ({
          id: doc.id.toString(),
          name: doc.filename,
          type: getFileType(doc.file_type),
          size: `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB`,
          lastModified: new Date(doc.upload_date).toISOString().split('T')[0],
          accessLevel: doc.allowed_roles || ['All']
        }))
        setDocuments(transformedData)
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    }
  }

  const getFileType = (mimeType: string): string => {
    if (!mimeType) return 'FILE'
    
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT',
      'application/json': 'JSON',
      'text/csv': 'CSV',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX'
    }
    
    return typeMap[mimeType] || mimeType.split('/')[1].toUpperCase()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAccessChange = (level: string) => {
    const allowedRoles = getAllowedRoles()
    
    // Only allow changes for roles the user has permission to assign
    if (!allowedRoles.includes(level)) {
      return
    }
    
    setSelectedAccess((prev) => {
      if (level === "All") {
        return prev.includes("All") ? [] : allowedRoles
      } else {
        const newAccess = prev.includes(level)
          ? prev.filter((l) => l !== level && l !== "All")
          : [...prev.filter((l) => l !== "All"), level]
        return newAccess.length === allowedRoles.length - 1 ? allowedRoles : newAccess
      }
    })
  }

  const handleUpload = async () => {
    if (selectedFile && selectedAccess.length > 0) {
      setIsLoading(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('allowed_roles', JSON.stringify(selectedAccess))

        const response = await fetch(`${BACKEND_ENDPOINT}/documents/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        })

        if (response.ok) {
          await fetchDocuments()
          setSelectedFile(null)
          setSelectedAccess([])
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        } else {
          const errorData = await response.json()
          const errorMessage = errorData.detail.split(': ').pop()
          setError(errorMessage)
        }
      } catch (error) {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDelete = async (document: Document) => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/documents/${document.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      
      if (response.ok) {
        await fetchDocuments()
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`${BACKEND_ENDPOINT}/documents/download/${doc.id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      
      if (response.ok) {
        // Get filename from Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = doc.name
        console.log(filename)
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename=(.+)/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = window.document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.download = filename
        
        // Need to append to document to work in Firefox
        window.document.body.appendChild(link)
        link.click()
        
        // Cleanup
        setTimeout(() => {
          window.document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }, 100)
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to download document' }))
        setError(errorData.detail)
      }
    } catch (error) {
      console.error("Failed to download document:", error)
      setError("Failed to download document")
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
            {getAllowedRoles().map((level) => (
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
          {error && (
            <div className="mb-2 text-sm text-red-500 bg-red-100/10 p-2 rounded">
              {error}
            </div>
          )}
          <Button onClick={handleUpload} disabled={!selectedFile || isLoading} className="w-full bg-primary text-[#f97316]">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2" />
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2 text-[#f97316]" /> Upload File
              </>
            )}
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
                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
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
