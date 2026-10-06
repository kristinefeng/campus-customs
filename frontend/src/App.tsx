import { useState, useEffect } from 'react'
import './App.css'

interface Product {
  product_id: string
  name: string
  price: number
  image_file_path: string
  description: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
}

function App() {
  const [page, setPage] = useState<'home' | 'login' | 'products'>('home')
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || '')
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [contextProduct, setContextProduct] = useState<any | null>(null)  // Keep context even when viewing grid

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMaximized, setChatMaximized] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Load chat history when user logs in
  useEffect(() => {
    if (isLoggedIn && userId) {
      loadChatHistory()
    }
  }, [isLoggedIn, userId])

  // Fetch full product data with inventory when product is selected
  useEffect(() => {
    if (selectedProduct && selectedProduct.product_id) {
      fetch(`http://localhost:8000/api/products/${selectedProduct.product_id}`)
        .then(res => res.json())
        .then(data => setSelectedProduct(data))
        .catch(err => console.error('Failed to load product details:', err))
    }
  }, [selectedProduct?.product_id])

  const loadChatHistory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/chat/history?user_id=${userId}`)
      const data = await res.json()
      if (data.success && data.messages) {
        // Convert stored messages to ChatMessage format
        const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          products: msg.products_json ? JSON.parse(msg.products_json) : undefined
        }))
        setChatMessages(formattedMessages)
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Login failed')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('user_email', email)
      setUserId(data.user_id)
      setIsLoggedIn(true)
      setUserEmail(email)
      setPage('products')
      setEmail('')
      setPassword('')
      // Chat history will load via useEffect
    } catch (err: any) {
      setError(err.message || 'Login error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    setIsLoggedIn(false)
    setUserEmail('')
    setUserId('')
    setChatMessages([]) // Clear chat history on logout
    setPage('home')
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/products')
      const data = await res.json()
      setProducts(data.products)
      setSearchQuery('')
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleProductsClick = () => {
    setPage('products')
    if (products.length === 0) {
      fetchProducts()
    }
    setSearchQuery('')
    setSelectedProduct(null)
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    // Save the message before clearing the input
    const message = chatInput

    const userMsg: ChatMessage = { role: 'user', content: message }
    setChatMessages([...chatMessages, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      // Use contextProduct so context persists even after going back from detail view
      const productForContext = selectedProduct || contextProduct
      const payload = {
        message: message,
        user_id: userId ? parseInt(userId) : null,
        current_product_id: productForContext?.product_id,
        current_product_name: productForContext?.name
      }
      console.log('Sending to chat API:', payload)

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.content,
        products: data.products
      }
      setChatMessages(prev => [...prev, assistantMsg])

      // If chat returned products, display them on the products page
      if (data.products && data.products.length > 0) {
        setProducts(data.products)
        setSearchQuery(message)
        setPage('products')
        setSelectedProduct(null)
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = { role: 'assistant', content: 'Error: Could not reach chatbot' }
      setChatMessages(prev => [...prev, errorMsg])
    } finally {
      setChatLoading(false)
    }
  }

  // Filter products based on search input
  const filteredProducts = searchInput
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchInput) ||
        p.description.toLowerCase().includes(searchInput)
      )
    : products

  const displayProducts = filteredProducts
  const displayTitle = searchQuery ? `Search Results for "${searchQuery}"` : 'Our Products'

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="logo">Campus Customs</h1>
        <div className="nav-links">
          <button onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>Home</button>
          <button onClick={handleProductsClick} className={page === 'products' ? 'active' : ''}>Products</button>
          {isLoggedIn ? (
            <>
              <span className="user-email">{userEmail}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <button onClick={() => setPage('login')} className={page === 'login' ? 'active' : ''}>Login</button>
          )}
        </div>
      </nav>

      <main className="content">
        {page === 'home' && (
          <div className="home">
            <h2>Welcome to Campus Customs</h2>
            <p>Your ultimate destination for authentic college merchandise.</p>
            {!isLoggedIn && (
              <button onClick={() => setPage('login')} className="cta-btn">Log In to Shop</button>
            )}
          </div>
        )}

        {page === 'login' && (
          <div className="login-page">
            <form onSubmit={handleLogin} className="login-form">
              <h2>Log In</h2>
              {error && <div className="error">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
            </form>
          </div>
        )}

        {page === 'products' && !selectedProduct && (
          <div className="products-page">
            <h2>{displayTitle}</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products by name, type, or color..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
                className="search-input"
              />
            </div>
            {loading && <p>Loading...</p>}
            {error && <div className="error">{error}</div>}
            <div className="products-grid">
              {displayProducts.map((product) => {
                const filename = product.image_file_path.split('/').pop() || product.image_file_path
                return (
                  <div
                    key={product.product_id}
                    className="product-card"
                    onClick={() => {
                      setSelectedProduct(product)
                      setContextProduct(product)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={`http://localhost:8000/api/images/${filename}`} alt={product.name} />
                    <h3>{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                    {product.description && (
                      <p className="product-description">{product.description.substring(0, 80)}...</p>
                    )}
                  </div>
                )
              })}
            </div>
            {displayProducts.length === 0 && !loading && (
              <p className="no-results">No products found. Try searching in chat!</p>
            )}
          </div>
        )}

        {page === 'products' && selectedProduct && (
          <div className="product-detail">
            <button className="back-btn" onClick={() => setSelectedProduct(null)}>← Back to Products</button>
            <div className="detail-content">
              <div className="detail-image">
                <img
                  src={`http://localhost:8000/api/images/${selectedProduct.image_file_path.split('/').pop() || selectedProduct.image_file_path}`}
                  alt={selectedProduct.name}
                />
              </div>
              <div className="detail-info">
                <h1>{selectedProduct.name}</h1>
                <p className="detail-price">${selectedProduct.price.toFixed(2)}</p>
                <p className="detail-description">{selectedProduct.description}</p>

                {/* Size Selector */}
                <div className="size-selector">
                  <h3>Available Sizes:</h3>
                  <div className="size-options">
                    {selectedProduct.inventory && selectedProduct.inventory.map((inv: any) => (
                      <button
                        key={inv.size}
                        className={`size-btn ${inv.quantity === 0 ? 'out-of-stock' : ''}`}
                        disabled={inv.quantity === 0}
                      >
                        {inv.size}
                        <span className="stock-info">
                          {inv.quantity > 0 ? `(${inv.quantity} in stock)` : '(Out of stock)'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Widget */}
      <div className="chat-container">
        <button className="chat-toggle" onClick={() => setChatOpen(!chatOpen)}>💬</button>

        {chatOpen && (
          <div className={`chat-panel ${chatMaximized ? 'maximized' : ''}`}>
            <div className="chat-header">
              <h3>Campus Customs Chat</h3>
              <div className="chat-header-buttons">
                <button
                  className="chat-maximize"
                  onClick={() => setChatMaximized(!chatMaximized)}
                  title={chatMaximized ? "Minimize" : "Maximize"}
                >
                  {chatMaximized ? '⬇' : '⬆'}
                </button>
                <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
              </div>
            </div>

            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <p className="chat-placeholder">Ask me about our products!</p>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message-wrapper ${msg.role}`}>
                  <div className={`chat-message ${msg.role}`}>
                    <p>{msg.content}</p>
                  </div>
                  {msg.products && msg.products.length > 0 && (
                    <div className="chat-products">
                      {msg.products.map((product) => (
                        <div key={product.product_id} className="chat-product-card">
                          <img
                            src={`http://localhost:8000/api/images/${product.image_file_path}`}
                            alt={product.name}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedProduct(product); setContextProduct(product)
                              setPage('products')
                            }}
                          />
                          <h4>{product.name}</h4>
                          <p className="product-price">${product.price.toFixed(2)}</p>
                          <button
                            className="product-link"
                            onClick={() => {
                              setSelectedProduct(product); setContextProduct(product)
                              setPage('products')
                            }}
                          >
                            View Product
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder={isLoggedIn ? "Ask something..." : "Ask something... (history not saved)"}
                className="chat-input"
              />
              <button onClick={handleChatSend} disabled={chatLoading} className="chat-send">
                {chatLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
