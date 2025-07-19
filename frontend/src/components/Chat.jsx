import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import io from 'socket.io-client'

const Chat = ({ bookingId, onClose }) => {
  const { token } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!bookingId || !token) return

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      setIsConnected(true)
      // Join the chat room for this booking
      socket.emit('join_chat', { token, booking_id: bookingId })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('connected', (data) => {
      console.log('Authenticated:', data)
    })

    socket.on('joined_chat', (data) => {
      console.log('Joined chat:', data)
      setIsLoading(false)
    })

    socket.on('chat_history', (data) => {
      setMessages(data.messages)
      setIsLoading(false)
    })

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      setIsLoading(false)
    })

    return () => {
      if (socket) {
        socket.emit('leave_chat', { booking_id: bookingId })
        socket.disconnect()
      }
    }
  }, [bookingId, token])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socketRef.current || !isConnected) return

    socketRef.current.emit('send_message', {
      token,
      booking_id: bookingId,
      message: newMessage.trim()
    })

    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading chat...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chat</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              // Simple check for message ownership - you can enhance this later
              const isOwnMessage = message.sender_name.includes('User') // Simplified for now
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.sender_name}
                    </div>
                    <div className="text-sm">{message.message}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat

