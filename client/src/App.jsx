import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Mobile Nav toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Complaint Form State
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    issue: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // Recent complaints state (from DB)
  const [complaintsList, setComplaintsList] = useState([])
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false)

  // Fetch submitted complaints from backend
  const fetchComplaints = async () => {
    setIsLoadingComplaints(true)
    try {
      const res = await fetch('/api/complaints')
      if (res.ok) {
        const data = await res.json()
        setComplaintsList(data)
      }
    } catch (err) {
      console.error('Failed to load complaints history:', err)
    } finally {
      setIsLoadingComplaints(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error for that field as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Frontend validation logic
  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long.'
    }

    // Phone number validation
    const phoneRegex = /^(\+92|0)?3\d{9}$|^0\d{2,3}-?\d{6,8}$|^\d{10,11}$/
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone Number is required.'
    } else if (!phoneRegex.test(formData.phone_number.trim().replace(/[\s-]/g, ''))) {
      newErrors.phone_number = 'Please enter a valid phone number (e.g. 03001234567).'
    }

    // Issue validation
    if (!formData.issue.trim()) {
      newErrors.issue = 'Please describe your issue or complaint.'
    } else if (formData.issue.trim().length < 10) {
      newErrors.issue = 'Complaint details must be at least 10 characters long.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitSuccess(null)
    setSubmitError(null)

    // Run frontend validation
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone_number: formData.phone_number.trim(),
          issue: formData.issue.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit complaint. Please try again.')
      }

      // Success
      setSubmitSuccess(`Thank you ${formData.name}! Your complaint has been submitted successfully (Reference ID #${data.complaint?.id || 'OK'}).`)
      setFormData({ name: '', phone_number: '', issue: '' })
      setErrors({})
      
      // Refresh complaints history from PostgreSQL
      fetchComplaints()
    } catch (err) {
      setSubmitError(err.message || 'An error occurred while sending your complaint to the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Smooth scroll helper
  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app">
      {/* 1. NAVBAR */}
      <nav className="navbar">
        <div className="container nav-container">
          <a href="#home" className="logo">
            <div className="logo-badge">PT</div>
            <div className="logo-text">PAK<span>TELECOM</span></div>
          </a>

          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
            <li><a href="#packages" onClick={() => scrollToSection('packages')}>Packages</a></li>
            <li><a href="#about" onClick={() => scrollToSection('about')}>About</a></li>
            <li>
              <a 
                href="#complaint" 
                className="nav-btn"
                onClick={() => scrollToSection('complaint')}
              >
                Complaint Form
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header id="home" className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="dot"></span> 100% Ultra-Fast Fiber Optic Infrastructure
            </div>
            <h1 className="hero-title">
              Experience Ultra Gigabit <span>Fiber Broadband</span>
            </h1>
            <p className="hero-desc">
              Power your home and enterprise with Pakistan's premier high-speed optical fiber network. Enjoy seamless 4K streaming, buffer-free gaming, and crystal-clear digital voice.
            </p>

            <div className="hero-cta">
              <button onClick={() => scrollToSection('packages')} className="btn btn-primary">
                View Packages ↓
              </button>
              <button onClick={() => scrollToSection('complaint')} className="btn btn-secondary">
                File a Complaint →
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h4>99.9%</h4>
                <p>Guaranteed Uptime</p>
              </div>
              <div className="stat-item">
                <h4>1000 Mbps</h4>
                <p>Max Gigabit Speeds</p>
              </div>
              <div className="stat-item">
                <h4>24/7</h4>
                <p>Support Assistance</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="speed-meter">
                <div className="speed-number">500</div>
                <div className="speed-unit">Mbps Fiber Speed Test</div>
              </div>
              <div className="badge-row">
                <div className="badge-box">⚡ Low Latency Gaming</div>
                <div className="badge-box">📺 4K Smart TV Ready</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="section section-alt">
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Our Offerings</span>
            <h2 className="section-title">Comprehensive Digital Services</h2>
            <p className="section-subtitle">
              Delivering next-generation connectivity solutions designed for modern homes and businesses.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🌐</div>
              <h3>Flash Fiber Internet</h3>
              <p>Lightning-fast symmetrical upload and download speeds backed by pure fiber optic cables straight to your door.</p>
              <ul className="service-list">
                <li>Unlimited Data Downloads</li>
                <li>Free Wi-Fi 6 Router Included</li>
                <li>Zero Throttle Bandwidth</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">📺</div>
              <h3>Smart TV & Entertainment</h3>
              <p>Access hundreds of HD channels, movie libraries, and sports streams with live pause and recording capabilities.</p>
              <ul className="service-list">
                <li>200+ HD Live Channels</li>
                <li>4K Android Smart Box Option</li>
                <li>Catch-Up TV Features</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">📞</div>
              <h3>Digital Landline Voice</h3>
              <p>Reliable, crystal-clear voice communication with nationwide coverage and free internal network calls.</p>
              <ul className="service-list">
                <li>Unlimited On-Net Minutes</li>
                <li>Caller ID & Call Forwarding</li>
                <li>HD Voice Clarity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PACKAGES SECTION */}
      <section id="packages" className="section">
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Transparent Pricing</span>
            <h2 className="section-title">Popular Broadband Packages</h2>
            <p className="section-subtitle">
              Choose the perfect plan tailored for casual browsing, family streaming, or power gaming.
            </p>
          </div>

          <div className="packages-grid">
            {/* Plan 1 */}
            <div className="package-card">
              <div className="package-header">
                <h3 className="package-name">Fiber Starter</h3>
                <div className="package-speed">20 Mbps</div>
                <div className="package-price">Rs. 2,499 <span>/ month</span></div>
              </div>
              <ul className="package-features">
                <li><strong>20 Mbps</strong> Unlimited Speed</li>
                <li>Free Router & Installation</li>
                <li>Unlimited On-Net Calls</li>
                <li>Standard Support</li>
              </ul>
              <button onClick={() => scrollToSection('complaint')} className="btn btn-secondary package-btn">
                Subscribe Plan
              </button>
            </div>

            {/* Plan 2 (Featured) */}
            <div className="package-card featured">
              <div className="package-badge">Most Popular</div>
              <div className="package-header">
                <h3 className="package-name">Fiber Value</h3>
                <div className="package-speed">50 Mbps</div>
                <div className="package-price">Rs. 4,299 <span>/ month</span></div>
              </div>
              <ul className="package-features">
                <li><strong>50 Mbps</strong> High Speed Fiber</li>
                <li>Free Dual-Band Wi-Fi Router</li>
                <li>Smart TV App Access</li>
                <li>Priority Technical Support</li>
              </ul>
              <button onClick={() => scrollToSection('complaint')} className="btn btn-primary package-btn">
                Subscribe Plan
              </button>
            </div>

            {/* Plan 3 */}
            <div className="package-card">
              <div className="package-header">
                <h3 className="package-name">Gigabit Ultra</h3>
                <div className="package-speed">100 Mbps</div>
                <div className="package-price">Rs. 7,499 <span>/ month</span></div>
              </div>
              <ul className="package-features">
                <li><strong>100 Mbps</strong> Ultra Bandwidth</li>
                <li>Wi-Fi 6 Mesh Router</li>
                <li>200+ HD TV Channels Included</li>
                <li>24/7 Dedicated Account Manager</li>
              </ul>
              <button onClick={() => scrollToSection('complaint')} className="btn btn-secondary package-btn">
                Subscribe Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT SECTION */}
      <section id="about" className="section section-alt">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-tag">About Our Infrastructure</span>
              <h3>Connecting Millions Across Pakistan</h3>
              <p>
                As Pakistan's cornerstone digital communications network, we are dedicated to building a hyper-connected nation through state-of-the-art optical fiber technology.
              </p>
              
              <ul className="feature-check-list">
                <li>
                  <span className="feature-check-icon">✓</span>
                  Nationwide Fiber-to-the-Home (FTTH) network expansion.
                </li>
                <li>
                  <span className="feature-check-icon">✓</span>
                  Redundant submarine cable connections for zero disruption.
                </li>
                <li>
                  <span className="feature-check-icon">✓</span>
                  Dedicated customer service team serving 24 hours a day, 7 days a week.
                </li>
              </ul>
            </div>

            <div className="about-box">
              <h4>Why Choose PakTelecom?</h4>
              <p style={{ color: '#94a3b8' }}>
                We combine decades of telecom leadership with cutting-edge gigabit fiber speeds to keep your digital life moving forward.
              </p>
              <div className="about-box-grid">
                <div className="about-box-card">
                  <h5>10M+</h5>
                  <p>Satisfied Subscribers</p>
                </div>
                <div className="about-box-card">
                  <h5>100+</h5>
                  <p>Cities Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPLAINT FORM SECTION */}
      <section id="complaint" className="section">
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Customer Support</span>
            <h2 className="section-title">Submit a Complaint or Inquiry</h2>
            <p className="section-subtitle">
              Having an issue with your line or internet connection? Register your complaint below and our technical support team will resolve it promptly.
            </p>
          </div>

          <div className="complaint-wrapper">
            {/* Success Alert Banner */}
            {submitSuccess && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <div>{submitSuccess}</div>
              </div>
            )}

            {/* Error Alert Banner */}
            {submitError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <div>{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'error-border' : ''}`}
                  placeholder="e.g. Muhammad Ahmed"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="phone_number">
                  Phone / Connection Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  className={`form-control ${errors.phone_number ? 'error-border' : ''}`}
                  placeholder="e.g. 03001234567 or 051-1234567"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
                {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
              </div>

              {/* Complaint Issue Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="issue">
                  Issue / Complaint Details <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="issue"
                  name="issue"
                  className={`form-control ${errors.issue ? 'error-border' : ''}`}
                  placeholder="Describe your issue (e.g. Red light on router, slow speed, line noise)..."
                  value={formData.issue}
                  onChange={handleChange}
                ></textarea>
                {errors.issue && <span className="error-text">{errors.issue}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Submitting to Database...' : 'Submit Complaint'}
              </button>
            </form>

            {/* Submitted Complaints Database History */}
            <div className="complaints-history">
              <h4>Recent Complaints in PostgreSQL ({complaintsList.length})</h4>
              {isLoadingComplaints ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading recorded complaints...</p>
              ) : complaintsList.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No complaints registered yet. Submit your first complaint above!</p>
              ) : (
                complaintsList.slice(0, 5).map((item) => (
                  <div key={item.id} className="complaint-item">
                    <div className="complaint-item-info">
                      <h5>#{item.id} - {item.name} ({item.phone_number})</h5>
                      <p>{item.issue}</p>
                    </div>
                    <span className="complaint-tag">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo" style={{ color: 'white' }}>
                <div className="logo-badge">PT</div>
                <div className="logo-text">PAK<span style={{ color: 'var(--accent)' }}>TELECOM</span></div>
              </div>
              <p>
                Providing trusted high-speed broadband, digital entertainment, and landline services across Pakistan.
              </p>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
                <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
                <li><a href="#packages" onClick={() => scrollToSection('packages')}>Packages</a></li>
                <li><a href="#about" onClick={() => scrollToSection('about')}>About Us</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="#complaint" onClick={() => scrollToSection('complaint')}>Register Complaint</a></li>
                <li><a href="#complaint" onClick={() => scrollToSection('complaint')}>Check Status</a></li>
                <li><a href="#">Helpline: 1218</a></li>
                <li><a href="#">UAN: 0800-80800</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Fair Usage Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} PakTelecom Dummy Practice Website. Built with React, Node.js & PostgreSQL on Railway.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
