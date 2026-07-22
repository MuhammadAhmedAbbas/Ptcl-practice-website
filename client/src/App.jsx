import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(null)
  const [messages, setMessages] = useState([])
  const [newContent, setNewContent] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch health status
  const checkHealth = async () => {
    try {
      setHealthError(null)
      const res = await fetch('/api/health')
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const data = await res.json()
      setHealth(data)
    } catch (err) {
      setHealthError(err.message)
    }
  }

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  useEffect(() => {
    checkHealth()
    fetchMessages()
  }, [])

  const handleAddMessage = async (e) => {
    e.preventDefault()
    if (!newContent.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim() })
      })
      if (res.ok) {
        setNewContent('')
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to add message:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
      if (res.ok) fetchMessages()
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>⚡ Railway PostgreSQL + Node + React App</h1>

      <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3>Backend & Database Status</h3>
        <button onClick={checkHealth} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          Check Connection
        </button>
        
        {health && (
          <div style={{ marginTop: '12px', color: 'green' }}>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Message:</strong> {health.message}</p>
            <p><strong>Database Time:</strong> {new Date(health.dbTime).toLocaleString()}</p>
          </div>
        )}

        {healthError && (
          <div style={{ marginTop: '12px', color: 'red' }}>
            <p><strong>Connection Error:</strong> {healthError}</p>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2>PostgreSQL Data Store</h2>

        <form onSubmit={handleAddMessage} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Type a new entry..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px 16px', cursor: 'pointer' }}>
            {loading ? 'Adding...' : 'Add Record'}
          </button>
        </form>

        <h3>Entries ({messages.length})</h3>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>No entries found yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {messages.map((item) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div>
                  <strong>#{item.id}:</strong> {item.content}
                  <span style={{ fontSize: '12px', color: '#888', marginLeft: '10px' }}>
                    {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
