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

const imageUrl = (p: { image_file_path: string }) =>
  `http://localhost:8000/api/images/${p.image_file_path.split('/').pop() || p.image_file_path}`

// The agent replies in markdown. Render **bold** as real bold by building
// React nodes rather than injecting HTML, so model output can never inject markup.
function renderMarkdownBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

function App() {
  const [page, setPage] = useState<'home' | 'login' | 'products' | 'about'>('home')
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || '')
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || '')
  const [isRegistering, setIsRegistering] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [contextProduct, setContextProduct] = useState<any | null>(null)  // Keep context even when viewing grid
  const [featured, setFeatured] = useState<any[]>([])

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

  // Featured items for the landing page
  useEffect(() => {
    fetch('http://localhost:8000/api/products?limit=8')
      .then(res => res.json())
      .then(data => setFeatured(data.products || []))
      .catch(err => console.error('Failed to load featured products:', err))
  }, [])

  // Fetch full product data with inventory when product is selected.
  // `cancelled` guards against a slow response for a product the shopper has
  // already navigated away from yanking them back into the detail view.
  useEffect(() => {
    const id = selectedProduct?.product_id
    if (!id) return
    let cancelled = false
    fetch(`http://localhost:8000/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Product ${id} not found`)
        return res.json()
      })
      .then(data => { if (!cancelled) setSelectedProduct(data) })
      .catch(err => {
        if (cancelled) return
        console.error('Failed to load product details:', err)
        setError('Sorry, we could not load that product.')
        setSelectedProduct(null)
      })
    return () => { cancelled = true }
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Registration failed')
        return
      }

      // Account created successfully, log them in
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('user_email', email)
      setUserId(data.user_id)
      setIsLoggedIn(true)
      setUserEmail(email)
      setPage('products')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFirstName('')
      setLastName('')
      // Chat history will load via useEffect
    } catch (err: any) {
      setError(err.message || 'Registration error')
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

  // Always refetch: after a chat search `products` holds only those few matches,
  // so a length check would leave the shopper stranded on a partial catalogue.
  const handleProductsClick = () => {
    setPage('products')
    setError('')
    setSearchInput('')
    setSearchQuery('')
    setSelectedProduct(null)
    fetchProducts()
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return

    // Save the message before clearing the input
    const message = chatInput

    const userMsg: ChatMessage = { role: 'user', content: message }
    setChatMessages(prev => [...prev, userMsg])
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
        setSearchInput('')
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
          <button onClick={() => setPage('about')} className={page === 'about' ? 'active' : ''}>About Us</button>
          {isLoggedIn ? (
            <>
              <span className="user-email">{userEmail}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setPage('login'); setIsRegistering(false); setError('') }}
                className={page === 'login' && !isRegistering ? 'active' : ''}
              >
                Log In
              </button>
              <button
                onClick={() => { setPage('login'); setIsRegistering(true); setError('') }}
                className={page === 'login' && isRegistering ? 'active' : ''}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="content">
        {page === 'home' && (
          <div className="home">
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">Officially Licensed · New Haven</span>
                <h2>Wear the <em>Blue</em>.</h2>
                <p>
                  Heavyweight fleece, stitched lettering, and fits made for the walk
                  across Cross Campus. Authentic Yale apparel — with live stock you can
                  actually trust.
                </p>
                <div className="hero-actions">
                  <button onClick={handleProductsClick} className="cta-btn">Shop the Collection</button>
                  <button onClick={() => setChatOpen(true)} className="cta-btn ghost">Ask our stylist</button>
                </div>
                <dl className="hero-stats">
                  <div><dt>100+</dt><dd>Pieces in stock</dd></div>
                  <div><dt>XS–XXL</dt><dd>Every core fit</dd></div>
                  <div><dt>Live</dt><dd>Inventory counts</dd></div>
                </dl>
              </div>
              <div className="hero-art" aria-hidden="true">
                {featured.slice(0, 3).map((p, i) => (
                  <figure key={p.product_id} className={`hero-tile tile-${i + 1}`}>
                    <img src={imageUrl(p)} alt="" loading="lazy" />
                  </figure>
                ))}
              </div>
            </section>

            <section className="value-props">
              <div className="value-prop">
                <span className="vp-mark">01</span>
                <h3>Licensed, not lookalike</h3>
                <p>Champion, Brooks Brothers, and the Yale marks you actually recognize.</p>
              </div>
              <div className="value-prop">
                <span className="vp-mark">02</span>
                <h3>Stock we don't fake</h3>
                <p>Every size count comes live from the warehouse — down to the last XL.</p>
              </div>
              <div className="value-prop">
                <span className="vp-mark">03</span>
                <h3>Built to survive finals</h3>
                <p>Fleece that keeps its shape through four years of laundry cycles.</p>
              </div>
            </section>

            {featured.length > 0 && (
              <section className="featured">
                <div className="section-head">
                  <h3>Campus favorites</h3>
                  <button onClick={handleProductsClick} className="link-btn">View all →</button>
                </div>
                <div className="featured-grid">
                  {featured.slice(0, 4).map((product) => (
                    <div
                      key={product.product_id}
                      className="product-card"
                      onClick={() => {
                        if (products.length === 0) fetchProducts()
                        setSelectedProduct(product)
                        setContextProduct(product)
                        setPage('products')
                      }}
                    >
                      <div className="card-media">
                        <img src={imageUrl(product)} alt={product.name} loading="lazy" />
                      </div>
                      <h3>{product.name}</h3>
                      <p className="card-price">${product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {page === 'about' && (
          <div className="about-page">
            <h2>About Campus Customs</h2>
            <p className="about-lead">
              We outfit the Yale community in gear worth keeping — pieces you reach for
              on a cold walk across Cross Campus, not just on game day.
            </p>
            <div className="about-sections">
              <section>
                <h3>Built for campus life</h3>
                <p>
                  Every hoodie, crewneck, and tee in our catalogue is chosen for how it
                  holds up: heavyweight fleece that survives four years of laundry,
                  stitched lettering that doesn't peel, and fits that work in a lecture
                  hall or on the walk home from the library.
                </p>
              </section>
              <section>
                <h3>Officially licensed</h3>
                <p>
                  We carry authentic Yale merchandise from names like Champion and
                  Brooks Brothers. If it's on our shelves, it's licensed — no knockoffs,
                  no mystery sourcing.
                </p>
              </section>
              <section>
                <h3>Honest about stock</h3>
                <p>
                  Our shopping assistant reads live inventory straight from our
                  warehouse. If your size is down to two, it will tell you it's down to
                  two. If it's gone, it will say so rather than let you find out at
                  checkout.
                </p>
              </section>
              <section>
                <h3>Here to help</h3>
                <p>
                  Ask the chat anything — what's in navy, whether a crewneck runs large,
                  what's left in XL. For orders and returns, reach a person at
                  support@campuscustoms.yale.edu.
                </p>
              </section>
            </div>
            <button onClick={handleProductsClick} className="cta-btn">Browse the Collection</button>
          </div>
        )}

        {page === 'login' && (
          <div className="login-page">
            {isRegistering ? (
              <form onSubmit={handleRegister} className="login-form">
                <h2>Create Account</h2>
                {error && <div className="error">{error}</div>}
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
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
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
                <p className="toggle-auth">
                  Already have an account? <button type="button" onClick={() => { setIsRegistering(false); setError(''); }}>Log In</button>
                </p>
              </form>
            ) : (
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
                <p className="toggle-auth">
                  Don't have an account? <button type="button" onClick={() => { setIsRegistering(true); setError(''); }}>Create one</button>
                </p>
              </form>
            )}
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
              {displayProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="product-card"
                  onClick={() => {
                    setSelectedProduct(product)
                    setContextProduct(product)
                  }}
                >
                  <div className="card-media">
                    <img src={imageUrl(product)} alt={product.name} loading="lazy" />
                  </div>
                  <h3>{product.name}</h3>
                  <p className="card-price">${product.price.toFixed(2)}</p>
                  {product.description && (
                    <p className="product-description">{product.description.substring(0, 80)}…</p>
                  )}
                </div>
              ))}
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
                    <p>{msg.role === 'assistant' ? renderMarkdownBold(msg.content) : msg.content}</p>
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
