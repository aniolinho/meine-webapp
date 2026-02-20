'use client'
import { useEffect, useState } from 'react'

type Post = {
  id: number
  title: string
  content: string
  createdAt: string
}

type User = {
  id: number
  name: string
  email: string
  createdAt: string
  posts: Post[]
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [newPost, setNewPost] = useState({ title: '', content: '', userId: '' })

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => { fetchUsers() }, [])

  const showMessage = (text: string, ok: boolean) => {
    setMessage({ text, ok })
    setTimeout(() => setMessage(null), 3000)
  }

  const createUser = async () => {
    if (!newUser.name || !newUser.email) return showMessage('Bitte Name und E-Mail ausfüllen', false)
    setLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    setLoading(false)
    if (res.ok) {
      showMessage('User erfolgreich angelegt!', true)
      setNewUser({ name: '', email: '' })
      fetchUsers()
    } else {
      showMessage('Fehler beim Anlegen des Users', false)
    }
  }

  const createPost = async () => {
    if (!newPost.title || !newPost.content || !newPost.userId) return showMessage('Bitte alle Felder ausfüllen', false)
    setLoading(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPost, userId: parseInt(newPost.userId) })
    })
    setLoading(false)
    if (res.ok) {
      showMessage('Post erfolgreich angelegt!', true)
      setNewPost({ title: '', content: '', userId: '' })
      fetchUsers()
    } else {
      showMessage('Fehler beim Anlegen des Posts', false)
    }
  }

  const allPosts = users.flatMap(u => u.posts.map(p => ({ ...p, userName: u.name })))

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f13',
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: '#e8e6e0'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .header {
          border-bottom: 1px solid #2a2a35;
          padding: 28px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.5px;
          color: #fff;
        }

        .logo span {
          color: #7c6af7;
        }

        .badge {
          background: #1a1a24;
          border: 1px solid #2a2a35;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          color: #888;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 48px;
        }

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 40px;
          background: #1a1a24;
          border: 1px solid #2a2a35;
          border-radius: 10px;
          padding: 4px;
          width: fit-content;
        }

        .tab {
          padding: 10px 28px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: #666;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }

        .tab.active {
          background: #7c6af7;
          color: #fff;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .card {
          background: #1a1a24;
          border: 1px solid #2a2a35;
          border-radius: 12px;
          padding: 28px;
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #fff;
          margin-bottom: 6px;
        }

        .card-sub {
          font-size: 12px;
          color: #555;
          margin-bottom: 24px;
          letter-spacing: 0.3px;
        }

        .field {
          margin-bottom: 14px;
        }

        .field label {
          display: block;
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          background: #0f0f13;
          border: 1px solid #2a2a35;
          border-radius: 8px;
          padding: 11px 14px;
          color: #e8e6e0;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #7c6af7;
        }

        .field textarea {
          resize: vertical;
          min-height: 80px;
        }

        .field select option {
          background: #1a1a24;
        }

        .btn {
          width: 100%;
          padding: 12px;
          background: #7c6af7;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
          letter-spacing: 0.3px;
        }

        .btn:hover { background: #6a58e0; }
        .btn:disabled { background: #333; color: #666; cursor: not-allowed; }

        .list-card {
          background: #1a1a24;
          border: 1px solid #2a2a35;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 24px;
        }

        .list-header {
          padding: 20px 28px;
          border-bottom: 1px solid #2a2a35;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-header-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
        }

        .count {
          background: #7c6af722;
          color: #7c6af7;
          border: 1px solid #7c6af755;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
        }

        .list-item {
          padding: 18px 28px;
          border-bottom: 1px solid #1f1f2a;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-item:last-child { border-bottom: none; }
        .list-item:hover { background: #20202c; }
        .list-item.selected { background: #1e1b3a; border-left: 3px solid #7c6af7; }

        .item-name {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          margin-bottom: 3px;
        }

        .item-sub {
          font-size: 12px;
          color: #555;
        }

        .item-meta {
          font-size: 11px;
          color: #444;
          text-align: right;
        }

        .posts-badge {
          background: #7c6af722;
          color: #7c6af7;
          border: 1px solid #7c6af744;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          margin-top: 4px;
          display: inline-block;
        }

        .empty {
          padding: 40px 28px;
          text-align: center;
          color: #444;
          font-size: 13px;
        }

        .toast {
          position: fixed;
          bottom: 32px;
          right: 32px;
          padding: 14px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Mono', monospace;
          z-index: 999;
          animation: slideIn 0.3s ease;
          border: 1px solid;
        }

        .toast.ok {
          background: #0d1f14;
          border-color: #2d6a3f;
          color: #4caf72;
        }

        .toast.err {
          background: #1f0d0d;
          border-color: #6a2d2d;
          color: #cf6679;
        }

        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .section-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #444;
          margin-bottom: 16px;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="logo">user<span>.</span>posts</div>
        <div className="badge">lokale Entwicklung</div>
      </div>

      <div className="main">
        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Users
          </button>
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts
          </button>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
            <div className="grid">
              {/* Form */}
              <div className="card">
                <div className="card-title">Neuen User anlegen</div>
                <div className="card-sub">Erstelle einen neuen Benutzer in der Datenbank</div>
                <div className="field">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Max Mustermann"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>E-Mail</label>
                  <input
                    type="email"
                    placeholder="max@example.com"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <button className="btn" onClick={createUser} disabled={loading}>
                  {loading ? 'Wird gespeichert...' : 'User anlegen'}
                </button>
              </div>

              {/* Selected User Detail */}
              <div className="card">
                <div className="card-title">User Details</div>
                <div className="card-sub">Klicke einen User an um Details zu sehen</div>
                {selectedUser ? (
                  <>
                    <div className="field">
                      <label>Name</label>
                      <div style={{ padding: '11px 14px', background: '#0f0f13', borderRadius: 8, border: '1px solid #2a2a35', fontSize: 13, color: '#fff' }}>
                        {selectedUser.name}
                      </div>
                    </div>
                    <div className="field">
                      <label>E-Mail</label>
                      <div style={{ padding: '11px 14px', background: '#0f0f13', borderRadius: 8, border: '1px solid #2a2a35', fontSize: 13, color: '#888' }}>
                        {selectedUser.email}
                      </div>
                    </div>
                    <div className="field">
                      <label>Posts ({selectedUser.posts.length})</label>
                      {selectedUser.posts.length === 0 ? (
                        <div style={{ color: '#444', fontSize: 12, padding: '8px 0' }}>Noch keine Posts vorhanden</div>
                      ) : (
                        selectedUser.posts.map(p => (
                          <div key={p.id} style={{ padding: '10px 14px', background: '#0f0f13', borderRadius: 8, border: '1px solid #2a2a35', marginBottom: 8 }}>
                            <div style={{ fontSize: 13, color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{p.title}</div>
                            <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>{p.content}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty">← Wähle einen User aus der Liste aus</div>
                )}
              </div>
            </div>

            {/* User List */}
            <div className="list-card">
              <div className="list-header">
                <div className="list-header-title">Alle Users</div>
                <div className="count">{users.length} Einträge</div>
              </div>
              {users.length === 0 ? (
                <div className="empty">Noch keine Users vorhanden. Lege den ersten an!</div>
              ) : (
                users.map(u => (
                  <div
                    key={u.id}
                    className={`list-item ${selectedUser?.id === u.id ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <div>
                      <div className="item-name">{u.name}</div>
                      <div className="item-sub">{u.email}</div>
                      <span className="posts-badge">{u.posts.length} Posts</span>
                    </div>
                    <div className="item-meta">
                      ID #{u.id}<br />
                      {new Date(u.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <>
            <div className="grid">
              <div className="card">
                <div className="card-title">Neuen Post anlegen</div>
                <div className="card-sub">Erstelle einen Post für einen bestehenden User</div>
                <div className="field">
                  <label>User auswählen</label>
                  <select value={newPost.userId} onChange={e => setNewPost({ ...newPost, userId: e.target.value })}>
                    <option value="">-- User wählen --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Titel</label>
                  <input
                    type="text"
                    placeholder="Mein erster Post"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Inhalt</label>
                  <textarea
                    placeholder="Was möchtest du mitteilen?"
                    value={newPost.content}
                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                <button className="btn" onClick={createPost} disabled={loading}>
                  {loading ? 'Wird gespeichert...' : 'Post anlegen'}
                </button>
              </div>

              <div className="card">
                <div className="card-title">Übersicht</div>
                <div className="card-sub">Aktuelle Statistiken</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Users', value: users.length },
                    { label: 'Posts gesamt', value: allPosts.length },
                    { label: 'Ø Posts/User', value: users.length ? (allPosts.length / users.length).toFixed(1) : '0' },
                    { label: 'Users mit Posts', value: users.filter(u => u.posts.length > 0).length }
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#0f0f13', border: '1px solid #2a2a35', borderRadius: 10, padding: '18px 16px' }}>
                      <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#7c6af7' }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="list-card">
              <div className="list-header">
                <div className="list-header-title">Alle Posts</div>
                <div className="count">{allPosts.length} Einträge</div>
              </div>
              {allPosts.length === 0 ? (
                <div className="empty">Noch keine Posts vorhanden. Lege den ersten an!</div>
              ) : (
                allPosts.map(p => (
                  <div key={p.id} className="list-item" style={{ cursor: 'default' }}>
                    <div>
                      <div className="item-name">{p.title}</div>
                      <div className="item-sub">{p.content}</div>
                      <span className="posts-badge">von {(p as any).userName}</span>
                    </div>
                    <div className="item-meta">
                      ID #{p.id}<br />
                      {new Date(p.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {message && (
        <div className={`toast ${message.ok ? 'ok' : 'err'}`}>
          {message.ok ? '✓' : '✗'} {message.text}
        </div>
      )}
    </div>
  )
}
