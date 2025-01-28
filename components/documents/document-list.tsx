"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/auth"

interface Document {
  id: string
  name: string
  created_at: string
  allowed_roles: string[]
}

export function DocumentList({ userRole }: { userRole: string }) {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    const { data, error } = await supabase.from("documents").select("*").filter("allowed_roles", "cs", `{${userRole}}`)

    if (data) {
      setDocuments(data)
    }
  }

  async function downloadDocument(id: string, name: string) {
    const { data, error } = await supabase.storage.from("documents").download(`${id}/${name}`)

    if (data) {
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  async function deleteDocument(id: string) {
    await supabase.from("documents").delete().match({ id })
    fetchDocuments()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Access and manage your uploaded documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => downloadDocument(doc.id, doc.name)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => deleteDocument(doc.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

