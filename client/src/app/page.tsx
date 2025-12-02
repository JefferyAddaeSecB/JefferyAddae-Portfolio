"use client"

import { Button3D } from "@/components/ui/button-3d"
import TypingAnimation from "@/components/typing-animation"

const Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <TypingAnimation text="Welcome to My Portfolio" />
        </h1>
        <Button3D>Get Started</Button3D>
      </div>
    </div>
  )
}

export default Page

