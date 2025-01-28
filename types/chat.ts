export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Chat {
  id: number
  user_id: number
  title: string
  messages?: ChatMessage[]
  last_message?: string
  created_at: string
  updated_at: string
}
