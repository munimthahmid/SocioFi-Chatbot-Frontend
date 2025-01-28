import { ChatPage } from "@/components/chat/chat-page"

export default function Page({ params }: { params: { id: string } }) {
  return <ChatPage chatId={params.id} />
}

