import { Link } from "react-router-dom"
import "./CourseCard.css"

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <div className="course-card-header">
        <span className={`difficulty-badge ${course.difficulty}`}>
          {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
        </span>
        <span className="level-badge">{course.level}</span>
      </div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-meta">
        <div className="instructor">
          <span className="meta-label">Instructor:</span>
          <span className="meta-value">{course.instructor.name}</span>
        </div>
        <div className="rating">
          <span className="meta-label">Rating:</span>
          <span className="meta-value">
            {course.rating} ★ ({course.total_ratings})
          </span>
        </div>
      </div>
      <div className="course-tags">
        {course.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
        {course.tags.length > 3 && <span className="tag more">+{course.tags.length - 3}</span>}
      </div>
      <div className="course-footer">
        <div className="price">${course.price.amount}</div>
        <Link to={`/courses/${course.course_id}`} className="view-course-btn">
          View Course
        </Link>
      </div>
    </div>
  )
}

export default CourseCard

