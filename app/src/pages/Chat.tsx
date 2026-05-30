import { useState, useEffect } from 'react'
import ChatWindow from '../components/ChatWindow'
import MessageInput from '../components/MessageInput'
import { claude } from '../api/claude'
import { Message } from '../types'
import './Chat.css'

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load messages from localStorage on mount
    const stored = localStorage.getItem('dukachat_messages')
    if (stored) {
      setMessages(JSON.parse(stored))
    }
  }, [])

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem('dukachat_messages', JSON.stringify(msgs))
  }

  const handleSendMessage = async (content: string, language: 'en' | 'sw') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      language,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
    setIsLoading(true)

    try {
      const response = await claude.sendMessage({
        message: content,
        language,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        language: response.language,
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      saveMessages(finalMessages)
    } catch (error) {
      console.error('Failed to get response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      }

      const errorMessages = [...updatedMessages, errorMessage]
      setMessages(errorMessages)
      saveMessages(errorMessages)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <MessageInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
