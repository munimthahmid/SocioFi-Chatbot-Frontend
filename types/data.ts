export interface Task {
  id: number
  title: string
  details: string
  status: string
  assignedTo: string // This will now be an email
}

export interface Meeting {
  id: number
  title: string
  date: string
  time: string
  channel: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  date: string
}

