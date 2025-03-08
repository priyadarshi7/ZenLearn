import { useState } from "react"
import "./Filters.css"

const Filters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    level: "",
    difficulty: "",
    department: "",
    priceRange: "",
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const updatedFilters = {
      ...filters,
      [name]: value,
    }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const clearFilters = () => {
    const resetFilters = {
      level: "",
      difficulty: "",
      department: "",
      priceRange: "",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button className="clear-filters" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <label>Level</label>
        <select name="level" value={filters.level} onChange={handleFilterChange}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Difficulty</label>
        <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
          <option value="">Any Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Department</label>
        <select name="department" value={filters.department} onChange={handleFilterChange}>
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Data Science">Data Science</option>
          <option value="Business">Business</option>
          <option value="Fine Arts">Fine Arts</option>
          <option value="Languages">Languages</option>
          <option value="Psychology">Psychology</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Environmental Studies">Environmental Studies</option>
          <option value="Finance">Finance</option>
          <option value="History">History</option>
          <option value="Health Sciences">Health Sciences</option>
          <option value="Music">Music</option>
          <option value="Philosophy">Philosophy</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
          <option value="">Any Price</option>
          <option value="0-300">Under $300</option>
          <option value="300-500">$300 - $500</option>
          <option value="500-700">$500 - $700</option>
          <option value="700+">$700+</option>
        </select>
      </div>
    </div>
  )
}

export default Filters

