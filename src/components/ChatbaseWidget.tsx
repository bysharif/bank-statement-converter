'use client'

import { useEffect } from 'react'

interface ChatbaseConfig {
  chatbotId: string
  domain: string
}

declare global {
  interface Window {
    embeddedChatbotConfig: ChatbaseConfig
  }
}

export function ChatbaseWidget() {
  useEffect(() => {
    // Configure the chatbot
    window.embeddedChatbotConfig = {
      chatbotId: "fv1bxhgzolv7fhs3yc30zoxjhn23qqv9",
      domain: "www.chatbase.co"
    }

    // Load the Chatbase script
    const script = document.createElement('script')
    script.src = "https://www.chatbase.co/embed.min.js"
    script.setAttribute('chatbotId', "fv1bxhgzolv7fhs3yc30zoxjhn23qqv9")
    script.setAttribute('domain', "www.chatbase.co")
    script.defer = true

    document.body.appendChild(script)

    // Cleanup function
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return null // This component doesn't render anything visible
}
