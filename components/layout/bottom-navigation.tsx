import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Folder, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BottomNavigation({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={`absolute bottom-0 left-0 right-0 border-t border-primary/20 bg-[#0f172a] ${className}`}>
      <div className="flex justify-around p-4">
        <Link href="/">
          <Button variant="ghost" className="flex flex-col items-center gap-1 touch-manipulation" size="lg">
            <Home className={`w-6 h-6 text-[#ea580c]`} />
            <span className="text-xs text-[#ea580c]">Home</span>
          </Button>
        </Link>
        <Link href="/chats">
          <Button variant="ghost" className="flex flex-col items-center gap-1 touch-manipulation" size="lg">
            <MessageSquare className={`w-6 h-6 text-[#ea580c]`} />
            <span className="text-xs text-[#ea580c]">Chats</span>
          </Button>
        </Link>
        <Link href="/folders">
          <Button variant="ghost" className="flex flex-col items-center gap-1 touch-manipulation" size="lg">
            <Folder className={`w-6 h-6 text-[#ea580c]`} />
            <span className="text-xs text-[#ea580c]">Folders</span>
          </Button>
        </Link>
        <Link href="/account">
          <Button variant="ghost" className="flex flex-col items-center gap-1 touch-manipulation" size="lg">
            <User className={`w-6 h-6 text-[#ea580c]`} />
            <span className="text-xs text-[#ea580c]">Account</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

