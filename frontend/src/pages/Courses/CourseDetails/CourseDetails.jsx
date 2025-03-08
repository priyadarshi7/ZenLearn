import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import "./CourseDetails.css"

const CourseDetail = ({ courses }) => {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [relatedCourses, setRelatedCourses] = useState([])

  useEffect(() => {
    // Find the course with the matching ID
    const foundCourse = courses.find((c) => c.course_id === id)
    setCourse(foundCourse)

    // Find related courses
    if (foundCourse && foundCourse.related_courses) {
      const related = courses.filter((c) => foundCourse.related_courses.includes(c.course_id))
      setRelatedCourses(related)
    }
  }, [id, courses])

  if (!course) {
    return <div className="loading">Loading course details...</div>
  }

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <div className="course-header-content">
          <div className="course-badges">
            <span className={`difficulty-badge ${course.difficulty}`}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </span>
            <span className="level-badge">{course.level}</span>
            {course.certification && <span className="certification-badge">Certification</span>}
          </div>
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>

          <div className="instructor-info">
            <div className="instructor-name">
              <span>Instructor:</span> {course.instructor.name}
            </div>
            <div className="instructor-rating">
              <span>Rating:</span> {course.instructor.rating} ★
            </div>
            <div className="instructor-experience">
              <span>Experience:</span> {course.instructor.years_teaching} years
            </div>
          </div>
        </div>
      </div>

      <div className="course-content">
        <div className="course-main">
          <section className="course-section">
            <h2>Course Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <h4>Department</h4>
                <p>{course.department}</p>
              </div>
              <div className="detail-item">
                <h4>Duration</h4>
                <p>{course.duration_weeks} weeks</p>
              </div>
              <div className="detail-item">
                <h4>Hours per Week</h4>
                <p>{course.hours_per_week} hours</p>
              </div>
              <div className="detail-item">
                <h4>Format</h4>
                <p>{course.format}</p>
              </div>
              <div className="detail-item">
                <h4>Language</h4>
                <p>{course.language}</p>
              </div>
              <div className="detail-item">
                <h4>Credits</h4>
                <p>{course.credits}</p>
              </div>
              <div className="detail-item">
                <h4>Last Updated</h4>
                <p>{course.last_updated}</p>
              </div>
              <div className="detail-item">
                <h4>Next Session</h4>
                <p>{course.next_session_start}</p>
              </div>
            </div>
          </section>

          <section className="course-section">
            <h2>What You'll Learn</h2>
            <div className="skills-grid">
              {course.skills_gained.map((skill, index) => (
                <div key={index} className="skill-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="course-section">
            <h2>Topics Covered</h2>
            <div className="topics-list">
              {course.topics.map((topic, index) => (
                <div key={index} className="topic-item">
                  <span className="topic-number">{index + 1}</span>
                  <span className="topic-name">{topic}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="course-section">
            <h2>Career Paths</h2>
            <div className="career-paths">
              {course.popular_career_paths.map((path, index) => (
                <div key={index} className="career-path-item">
                  {path}
                </div>
              ))}
            </div>
          </section>

          <section className="course-section">
            <h2>Student Reviews</h2>
            <div className="reviews-summary">
              <div className="rating-summary">
                <div className="rating-big">{course.rating}</div>
                <div className="rating-stars">★★★★★</div>
                <div className="rating-count">{course.total_ratings} ratings</div>
              </div>
              <div className="completion-info">
                <div className="completion-item">
                  <span>Completion Rate</span>
                  <div className="completion-value">{Math.round(course.completion_rate * 100)}%</div>
                </div>
                <div className="completion-item">
                  <span>Success Rate</span>
                  <div className="completion-value">{course.success_rate}%</div>
                </div>
              </div>
            </div>

            <div className="reviews-list">
              {course.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {Array(review.rating)
                        .fill()
                        .map((_, i) => (
                          <span key={i} className="star">
                            ★
                          </span>
                        ))}
                    </div>
                    <div className="review-date">{review.date}</div>
                  </div>
                  <div className="review-comment">{review.comment}</div>
                </div>
              ))}
            </div>
          </section>

          {relatedCourses.length > 0 && (
            <section className="course-section">
              <h2>Related Courses</h2>
              <div className="related-courses">
                {relatedCourses.map((relatedCourse) => (
                  <Link
                    key={relatedCourse.course_id}
                    to={`/courses/${relatedCourse.course_id}`}
                    className="related-course-item"
                  >
                    <h4>{relatedCourse.title}</h4>
                    <div className="related-course-meta">
                      <span className="related-course-level">{relatedCourse.level}</span>
                      <span className="related-course-rating">{relatedCourse.rating} ★</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="course-sidebar">
          <div className="course-card">
            <div className="course-price">
              <span className="price-amount">${course.price.amount}</span>
              <span className="price-currency">{course.price.currency}</span>
            </div>

            <div className="payment-options">
              <h4>Payment Options</h4>
              <ul>
                {course.price.payment_options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>

            <button className="enroll-button">Enroll Now</button>

            <div className="course-meta-info">
              <div className="meta-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  {course.duration_weeks} weeks, {course.hours_per_week} hrs/week
                </span>
              </div>
              <div className="meta-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>Estimated study time: {course.estimated_study_time} hours</span>
              </div>
              <div className="meta-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Learning style: {course.learning_style.join(", ")}</span>
              </div>
            </div>

            <div className="course-tags">
              {course.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail

