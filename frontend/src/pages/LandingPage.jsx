import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from "/src/components/figma/ImageWithFallback";
import './landing.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => observerRef.current.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 968 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleLoginClick = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin/auth');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleOrderClick = (item) => {
    alert(`☕ ${item} added to cart! Brewing happiness...`);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert(`🎉 Welcome to JavaBite! Check ${email} for 10% off your first order!`);
      e.target.reset();
    }
  };

  const testimonials = [
    {
      name: 'Sophie Anderson',
      role: 'Coffee Connoisseur',
      initial: 'S',
      text: 'JavaBite is an experience. The attention to detail in every cup is remarkable. Best coffee I\'ve had worldwide.',
    },
    {
      name: 'Marcus Chen',
      role: 'Tech Entrepreneur',
      initial: 'M',
      text: 'As someone who lives on coffee, JavaBite has ruined all others for me. Unmatched quality and perfect atmosphere.',
    },
    {
      name: 'Isabella Rodriguez',
      role: 'Creative Director',
      initial: 'I',
      text: 'Every visit feels like a mini vacation. The aesthetic, aroma, and taste - all perfection. Daily ritual now.',
    }
  ];

  return (
    <div className="coffee-landing">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="logo">
            <span className="logo-icon">☕</span>
            <span>JavaBite</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button className="login-btn" onClick={handleLoginClick}>
              Login
            </button>
            <button 
              className="admin-btn" 
              onClick={handleAdminClick}
              style={{
                marginLeft: '0.5rem',
                padding: '0.6rem 1.2rem',
                background: 'linear-gradient(135deg, #8b4513 0%, #d4a574 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#0f0f0f',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🔐 Admin
            </button>
          </div>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <span className="logo-icon">☕</span>
            <span>JavaBite</span>
          </div>
          <button 
            className="mobile-menu-close" 
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="mobile-menu-content">
          <a 
            href="#home" 
            className="mobile-nav-link" 
            onClick={(e) => {
              closeMobileMenu();
            }}
          >
            Home
          </a>
          <a 
            href="#about" 
            className="mobile-nav-link" 
            onClick={(e) => {
              closeMobileMenu();
            }}
          >
            About
          </a>
          <a 
            href="#contact" 
            className="mobile-nav-link" 
            onClick={(e) => {
              closeMobileMenu();
            }}
          >
            Contact
          </a>
          <button className="mobile-login-btn" onClick={handleLoginClick}>
            Login
          </button>
          <button 
            className="mobile-login-btn" 
            onClick={handleAdminClick}
            style={{
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #8b4513 0%, #d4a574 100%)',
              color: '#0f0f0f'
            }}
          >
            🔐 Admin Portal
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMobileMenu}></div>
      )}

      {/* Hero Section - Full Screen with Background */}
      <section className="hero" id="home">
        <div className="hero-background">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1553698249-0e3f9263ffa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMGRhcmt8ZW58MXx8fHwxNzYyNTA3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Coffee beans background"
          />
        </div>
        
        <div className="hero-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              ✨ CRAFTING EXCELLENCE SINCE 2020
            </div>
            <h1 className="hero-title">
              Every Cup Tells
              <span className="hero-title-highlight">A Story</span>
            </h1>
            <p className="hero-description">
              Discover the art of exceptional coffee. From carefully sourced beans to expertly 
              crafted brews, we transform every moment into an extraordinary experience.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => handleOrderClick('Signature Collection')}>
                Explore Menu
              </button>
              <button className="btn-secondary" onClick={handleLoginClick}>
                Join Rewards
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Unique Blends</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          </div>

          <div className="hero-image-showcase">
            <div className="showcase-grid">
              <div className="showcase-item">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1574749205488-3a56f8a1109d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBzdGVhbXxlbnwxfHx8fDE3NjI0OTAwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Coffee cup with steam"
                />
              </div>
              <div className="showcase-item">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1696350826221-983026d1c627?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwYWVzdGhldGljfGVufDF8fHx8MTc2MjQyNzc2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Coffee shop aesthetic"
                />
              </div>
              <div className="showcase-item">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1652432751749-4d6085441aa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtZW51JTIwYm9hcmR8ZW58MXx8fHwxNzYyNTA3NDkyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Coffee menu board"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Overlapping Card */}
      <section className="about-section scroll-reveal" id="about">
        <div className="about-container">
          <div className="about-card">
            <div className="about-content">
              <div className="about-text">
                <h2>The JavaBite Difference</h2>
                <p>
                  We're not just serving coffee, we're crafting experiences. Every detail matters, 
                  from sourcing to serving. Our commitment to excellence is unwavering.
                </p>
                <p>
                  Since 2020, we've been on a mission to redefine what exceptional coffee means. 
                  Partner with the best farmers, roast with precision, serve with passion.
                </p>
              </div>
              <div className="about-features">
                <div className="feature-item">
                  <div className="feature-icon">🌍</div>
                  <div className="feature-text">
                    <h3>Global Sourcing</h3>
                    <p>Direct partnerships with farmers in Ethiopia, Colombia, and Guatemala</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔥</div>
                  <div className="feature-text">
                    <h3>Artisan Roasting</h3>
                    <p>Small-batch roasting that unlocks unique flavor profiles</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">👨‍🍳</div>
                  <div className="feature-text">
                    <h3>Expert Baristas</h3>
                    <p>Years of training ensure perfection in every cup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section scroll-reveal">
        <div className="section-header">
          <div className="section-badge">💬 TESTIMONIALS</div>
          <h2 className="section-title">What Our Community Says</h2>
          <p className="section-description">
            Join thousands of coffee lovers who've made JavaBite their daily ritual.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card scroll-reveal">
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonial.initial}</div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                  <div className="testimonial-rating">★★★★★</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section scroll-reveal">
        <div className="cta-background">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1574749205488-3a56f8a1109d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBzdGVhbXxlbnwxfHx8fDE3NjI0OTAwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Coffee background"
          />
        </div>
        <div className="cta-container">
          <h2 className="cta-title">Join The JavaBite Family</h2>
          <p className="cta-description">
            Subscribe for exclusive offers, brewing tips, and be first to know about new blends. 
            Plus get 10% off your first order!
          </p>
          <form className="cta-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              name="email"
              className="cta-input" 
              placeholder="Enter your email address"
              required
            />
            <button type="submit" className="cta-btn">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-section">
            <h3>☕ JavaBite</h3>
            <p>
              Crafting exceptional coffee experiences since 2020. Every cup is a journey, 
              every sip tells a story. Join us in celebrating the art of perfect coffee.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
            <a href="#careers">Careers</a>
            <a href="#wholesale">Wholesale</a>
          </div>

          <div className="footer-section">
            <h3>Visit Us</h3>
            <p>123 Coffee Street</p>
            <p>Downtown District</p>
            <p>New York, NY 10001</p>
            <p>hello@javabite.coffee</p>
            <p>(555) 123-BREW</p>
          </div>

          <div className="footer-section">
            <h3>Hours</h3>
            <p>Monday - Friday</p>
            <p>7:00 AM - 8:00 PM</p>
            <p>Saturday - Sunday</p>
            <p>8:00 AM - 9:00 PM</p>
            <p>Holidays: 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 JavaBite Coffee Co. All rights reserved. Made with ❤️ and ☕ in New York.</p>
        </div>
      </footer>
    </div>
  );
}


