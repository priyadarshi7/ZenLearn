import { useState, useEffect } from "react"
import CourseCard from "../../../components/Course/CourseCard/CourseCard"
import SearchBar from "../../../components/Course/SearchBar/SearchBar"
import Filters from "../../../components/Course/Filters/Filters"
import "./CourseList.css"
import { Button } from "@mui/material"
import { NavLink } from "react-router-dom"

const CourseList = ({ courses }) => {
  const [filteredCourses, setFilteredCourses] = useState(courses)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState({
    level: "",
    difficulty: "",
    department: "",
    priceRange: "",
  })

  useEffect(() => {
    filterCourses()
  }, [searchTerm, activeFilters, courses])

  const filterCourses = () => {
    let results = courses

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.instructor.name.toLowerCase().includes(term) ||
          course.tags.some((tag) => tag.toLowerCase().includes(term)),
      )
    }

    // Apply level filter
    if (activeFilters.level) {
      results = results.filter((course) => course.level === activeFilters.level)
    }

    // Apply difficulty filter
    if (activeFilters.difficulty) {
      results = results.filter((course) => course.difficulty === activeFilters.difficulty)
    }

    // Apply department filter
    if (activeFilters.department) {
      results = results.filter((course) => course.department === activeFilters.department)
    }

    // Apply price range filter
    if (activeFilters.priceRange) {
      const [min, max] = activeFilters.priceRange.split("-")
      if (max) {
        results = results.filter((course) => course.price.amount >= Number(min) && course.price.amount <= Number(max))
      } else {
        // Handle "700+" case
        results = results.filter((course) => course.price.amount >= Number(min.replace("+", "")))
      }
    }

    setFilteredCourses(results)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (filters) => {
    setActiveFilters(filters)
  }

  return (
    <div className="course-list-page">
      <h1>All Courses</h1>
      <NavLink to="/courseQuiz"><Button sx={{
        background:"#4251f5",
        color:"white",
        fontWeight:"800",
        fontFamily:'zen',
        marginBottom:"10px"
      }}>Take Our Quiz Based Course Recommendation</Button></NavLink>
      <SearchBar onSearch={handleSearch} />

      <div className="course-list-container">
        <div className="filters-column">
          <Filters onFilterChange={handleFilterChange} />
        </div>

        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => <CourseCard key={course.course_id} course={course} />)
          ) : (
            <div className="no-courses">
              <h3>No courses found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseList

