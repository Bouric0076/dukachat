import { useState, type FormEvent } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  onSend: (message: string, language: 'en' | 'sw') => void
  isLoading: boolean
}

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState<'en' | 'sw'>('en')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    onSend(message, language)
    setMessage('')
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
          disabled={isLoading}
          className="language-selector"
        >
          <option value="en">English</option>
          <option value="sw">Swahili</option>
        </select>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="message-field"
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}
