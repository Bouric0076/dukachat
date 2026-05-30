import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export interface ClaudeRequest {
  message: string
  language: 'en' | 'sw'
  context?: string
}

export interface ClaudeResponse {
  response: string
  language: 'en' | 'sw'
  confidence: number
}

export const claude = {
  async sendMessage(req: ClaudeRequest): Promise<ClaudeResponse> {
    try {
      const response = await apiClient.post('/api/claude/message', req)
      return response.data
    } catch (error) {
      console.error('Error calling Claude API:', error)
      throw error
    }
  },

  async analyzeSwahili(text: string): Promise<{ analysis: string; intent: string }> {
    try {
      const response = await apiClient.post('/api/claude/swahili-analysis', { text })
      return response.data
    } catch (error) {
      console.error('Error analyzing Swahili text:', error)
      throw error
    }
  },

  async translateText(text: string, targetLanguage: 'en' | 'sw'): Promise<{ translated: string }> {
    try {
      const response = await apiClient.post('/api/claude/translate', {
        text,
        targetLanguage,
      })
      return response.data
    } catch (error) {
      console.error('Error translating text:', error)
      throw error
    }
  },
}
