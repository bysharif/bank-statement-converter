'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    chatbase: any
  }
}

export function ChatbaseWidget() {
  useEffect(() => {
    // Chatbase initialization (from official embed code)
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args: any[]) => {
        if (!window.chatbase.q) {
          window.chatbase.q = []
        }
        window.chatbase.q.push(args)
      }

      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q
          }
          return (...args: any[]) => target(prop, ...args)
        }
      })
    }

    const onLoad = () => {
      const script = document.createElement("script")
      script.src = "https://www.chatbase.co/embed.min.js"
      script.id = "UZXwon6mpEfT7676acRja"
      script.setAttribute('domain', "www.chatbase.co")
      document.body.appendChild(script)
    }

    if (document.readyState === "complete") {
      onLoad()
    } else {
      window.addEventListener("load", onLoad)
    }

    // Cleanup function
    return () => {
      const existingScript = document.getElementById("UZXwon6mpEfT7676acRja")
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}
