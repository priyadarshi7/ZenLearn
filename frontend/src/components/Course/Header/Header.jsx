import { useState } from "react"
import { Link } from "react-router-dom"
import "./Header.css"

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          CourseMatch
        </Link>

        <div className={`mobile-menu-button ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" onClick={() => setMenuOpen(false)}>
                All Courses
              </Link>
            </li>
            <li>
              <Link to="/quiz" onClick={() => setMenuOpen(false)}>
                Find Your Course
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header

