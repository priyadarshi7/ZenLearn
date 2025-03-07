import { useState, useEffect } from "react";
import "./Navbar.css";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();

  const pages = ["Home", "Meditation", "Speaking Dojo", "Communities", "Courses", "AI Assistant"];
  const settings = ["Profile", "Account", "Dashboard", "Logout"];
  const services = ["Consulting", "Development", "Design", "Marketing"];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setServicesOpen(false);
    setUserMenuOpen(false);
  };

  // Toggle services dropdown
  const toggleServices = (e) => {
    e.stopPropagation();
    setServicesOpen(!servicesOpen);
    setUserMenuOpen(false);
  };

  // Toggle user menu
  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
    setServicesOpen(false);
  };

  // Close all menus when clicking outside
  useEffect(() => {
    const closeMenus = (e) => {
      if (!e.target.closest(".user-menu-container")) setUserMenuOpen(false);
      if (!e.target.closest(".dropdown-container")) setServicesOpen(false);
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          ZenLearn
        </a>

        {/* Mobile menu button */}
        <div className="mobile-menu-button" onClick={toggleMobileMenu}>
          <div className={`hamburger ${mobileMenuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          {pages.map((page) =>
            page === "Services" ? (
              <div key={page} className="dropdown-container">
                <button className="nav-link dropdown-trigger" onClick={toggleServices}>
                  {page}
                  <span className={`dropdown-arrow ${servicesOpen ? "open" : ""}`}>&#9662;</span>
                </button>
                <div className={`dropdown-menu ${servicesOpen ? "open" : ""}`}>
                  {services.map((service) => (
                    <a key={service} href={`/services/${service.toLowerCase()}`} className="dropdown-item">
                      {service}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={page} href={`/${page.toLowerCase()}`} className="nav-link">
                {page}
              </a>
            )
          )}
        </div>

        {/* User section */}
        <div className="navbar-user">
          {/* Theme toggle button */}
          <button className="theme-toggle">
            🌙
          </button>

          {/* User avatar */}
          <div className="user-menu-container">
            {isAuthenticated ? (
              <Button className="user-avatar" onClick={toggleUserMenu}>
                <img
                  src={user?.picture || "https://via.placeholder.com/40"}
                  alt="User"
                  className="user-avatar"
                />
              </Button>
            ) : (
              <Button
                // className="user-avatar"
                onClick={loginWithRedirect}
                sx={{
                  backgroundColor: "rgb(9, 238, 9)",
                  color: "white",
                  fontFamily: "zen",
                  textTransform: "none",
                  fontWeight: "800",
                }}
              >
                Login
              </Button>
            )}
            {/* Dropdown for user settings */}
            <div className={`user-dropdown ${userMenuOpen ? "open" : ""}`}>
              {settings.map((setting) =>
                setting === "Logout" ? (
                  <button key={setting} className="dropdown-item" onClick={() => logout({ returnTo: window.location.origin })}>
                    {setting}
                  </button>
                ) : (
                  <a key={setting} href={`/user/${setting.toLowerCase()}`} className="dropdown-item">
                    {setting}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
