import { useState } from "react"
import { Link } from "react-router-dom"
import CourseCard from "../../../components/Course/CourseCard/CourseCard"
import "./InterestQuiz.css"

const InterestQuiz = ({ courses }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({
    interests: [],
    level: "",
    difficulty: "",
    learningStyle: [],
    timeCommitment: "",
    priceRange: "",
  })
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleInterestChange = (interest) => {
    const updatedInterests = [...answers.interests]
    const index = updatedInterests.indexOf(interest)

    if (index === -1) {
      updatedInterests.push(interest)
    } else {
      updatedInterests.splice(index, 1)
    }

    setAnswers({
      ...answers,
      interests: updatedInterests,
    })
  }

  const handleLearningStyleChange = (style) => {
    const updatedStyles = [...answers.learningStyle]
    const index = updatedStyles.indexOf(style)

    if (index === -1) {
      updatedStyles.push(style)
    } else {
      updatedStyles.splice(index, 1)
    }

    setAnswers({
      ...answers,
      learningStyle: updatedStyles,
    })
  }

  const handleSingleOptionChange = (field, value) => {
    setAnswers({
      ...answers,
      [field]: value,
    })
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const findMatchingCourses = () => {
    // Calculate a match score for each course with improved weightings
    const coursesWithScores = courses.map((course) => {
      let score = 0
      let matchDetails = []

      // Match interests with tags and department - higher weighting (0-15 points)
      if (answers.interests.length > 0) {
        const matchingTags = course.tags.filter((tag) =>
          answers.interests.some((interest) => 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        )
        
        const interestMatches = matchingTags.length
        if (interestMatches > 0) {
          score += interestMatches * 3
          matchDetails.push(`Matched ${interestMatches} interests with tags`)
        }

        // Direct department match is very important
        const departmentMatch = answers.interests.some((interest) => 
          course.department.toLowerCase().includes(interest.toLowerCase())
        )
        
        if (departmentMatch) {
          score += 6
          matchDetails.push("Department match")
        }
      }

      // Match level - critical factor (0 or 10 points)
      if (answers.level && course.level === answers.level) {
        score += 10
        matchDetails.push("Experience level match")
      }

      // Match difficulty - critical factor (0 or 10 points)
      if (answers.difficulty && course.difficulty === answers.difficulty) {
        score += 10
        matchDetails.push("Difficulty level match")
      }

      // Match learning style - important factor (0-12 points)
      if (answers.learningStyle.length > 0 && course.learning_style) {
        const styleMatches = course.learning_style.filter((style) => 
          answers.learningStyle.includes(style)
        ).length
        
        if (styleMatches > 0) {
          score += styleMatches * 4
          matchDetails.push(`Matched ${styleMatches} learning styles`)
        }
      }

      // Match time commitment - meaningful factor (0 or 8 points)
      if (answers.timeCommitment) {
        const [min, max] = answers.timeCommitment.split("-").map(Number)
        if (course.hours_per_week >= min && course.hours_per_week <= max) {
          score += 8
          matchDetails.push("Time commitment match")
        }
      }

      // Match price range - meaningful factor (0 or 8 points)
      if (answers.priceRange) {
        const [min, max] = answers.priceRange.split("-").map(Number)
        if (course.price.amount >= min && (max === undefined || course.price.amount <= max)) {
          score += 8
          matchDetails.push("Price range match")
        }
      }

      return {
        course,
        score,
        matchDetails
      }
    })

    // Set minimum score threshold to be considered a match
    const MINIMUM_MATCH_SCORE = 15
    
    // Filter out courses with scores below threshold, then sort by score
    const validMatches = coursesWithScores
      .filter(item => item.score >= MINIMUM_MATCH_SCORE)
      .sort((a, b) => b.score - a.score)
      
    // Take top matches (up to 3)
    const topMatches = validMatches.slice(0, 3).map((item) => item.course)

    // Log match details for debugging (can be removed in production)
    console.log("Match results:", 
      coursesWithScores.map(({course, score, matchDetails}) => ({
        courseId: course.course_id,
        title: course.title,
        score,
        matchDetails
      }))
    )

    setRecommendedCourses(topMatches)
    setQuizCompleted(true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="quiz-step">
            <h2>What are you interested in learning?</h2>
            <p className="step-description">Select all that apply</p>

            <div className="interest-options">
              {[
                "Programming",
                "Data Science",
                "Business",
                "Art",
                "Design",
                "Language",
                "Psychology",
                "AI",
                "Environment",
                "Finance",
                "History",
                "Health",
                "Music",
                "Philosophy",
              ].map((interest) => (
                <div
                  key={interest}
                  className={`interest-option ${answers.interests.includes(interest) ? "selected" : ""}`}
                  onClick={() => handleInterestChange(interest)}
                >
                  {interest}
                </div>
              ))}
            </div>

            <div className="step-buttons">
              <button className="btn-primary next-button" onClick={nextStep} disabled={answers.interests.length === 0}>
                Next
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="quiz-step">
            <h2>What's your experience level?</h2>
            <p className="step-description">Choose the option that best describes you</p>

            <div className="level-options">
              <div
                className={`level-option ${answers.level === "Beginner" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("level", "Beginner")}
              >
                <h3>Beginner</h3>
                <p>New to the subject with little to no prior knowledge</p>
              </div>

              <div
                className={`level-option ${answers.level === "Intermediate" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("level", "Intermediate")}
              >
                <h3>Intermediate</h3>
                <p>Have some knowledge and looking to build upon existing skills</p>
              </div>

              <div
                className={`level-option ${answers.level === "Advanced" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("level", "Advanced")}
              >
                <h3>Advanced</h3>
                <p>Experienced in the subject and seeking specialized knowledge</p>
              </div>
            </div>

            <div className="step-buttons">
              <button className="btn-secondary prev-button" onClick={prevStep}>
                Back
              </button>
              <button className="btn-primary next-button" onClick={nextStep} disabled={!answers.level}>
                Next
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="quiz-step">
            <h2>What difficulty level are you comfortable with?</h2>
            <p className="step-description">Select your preferred challenge level</p>

            <div className="difficulty-options">
              <div
                className={`difficulty-option easy ${answers.difficulty === "easy" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("difficulty", "easy")}
              >
                <h3>Easy</h3>
                <p>Gentle pace, more guidance, suitable for beginners</p>
              </div>

              <div
                className={`difficulty-option medium ${answers.difficulty === "medium" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("difficulty", "medium")}
              >
                <h3>Medium</h3>
                <p>Balanced challenge, moderate pace, some prior knowledge helpful</p>
              </div>

              <div
                className={`difficulty-option hard ${answers.difficulty === "hard" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("difficulty", "hard")}
              >
                <h3>Hard</h3>
                <p>Challenging content, faster pace, requires dedication</p>
              </div>
            </div>

            <div className="step-buttons">
              <button className="btn-secondary prev-button" onClick={prevStep}>
                Back
              </button>
              <button className="btn-primary next-button" onClick={nextStep} disabled={!answers.difficulty}>
                Next
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="quiz-step">
            <h2>How do you prefer to learn?</h2>
            <p className="step-description">Select all that apply</p>

            <div className="learning-style-options">
              {[
                "Visual",
                "Hands-on",
                "Project-based",
                "Reading-intensive",
                "Discussion",
                "Case-based",
                "Research-based",
                "Practical",
                "Theoretical",
              ].map((style) => (
                <div
                  key={style}
                  className={`learning-style-option ${answers.learningStyle.includes(style) ? "selected" : ""}`}
                  onClick={() => handleLearningStyleChange(style)}
                >
                  {style}
                </div>
              ))}
            </div>

            <div className="step-buttons">
              <button className="btn-secondary prev-button" onClick={prevStep}>
                Back
              </button>
              <button
                className="btn-primary next-button"
                onClick={nextStep}
                disabled={answers.learningStyle.length === 0}
              >
                Next
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="quiz-step">
            <h2>How much time can you commit weekly?</h2>
            <p className="step-description">Select your preferred time commitment</p>

            <div className="time-options">
              <div
                className={`time-option ${answers.timeCommitment === "1-5" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("timeCommitment", "1-5")}
              >
                <h3>1-5 hours/week</h3>
                <p>Light commitment, flexible schedule</p>
              </div>

              <div
                className={`time-option ${answers.timeCommitment === "5-10" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("timeCommitment", "5-10")}
              >
                <h3>5-10 hours/week</h3>
                <p>Moderate commitment, balanced with other activities</p>
              </div>

              <div
                className={`time-option ${answers.timeCommitment === "10-15" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("timeCommitment", "10-15")}
              >
                <h3>10+ hours/week</h3>
                <p>Significant commitment, dedicated learning time</p>
              </div>
            </div>

            <div className="step-buttons">
              <button className="btn-secondary prev-button" onClick={prevStep}>
                Back
              </button>
              <button className="btn-primary next-button" onClick={nextStep} disabled={!answers.timeCommitment}>
                Next
              </button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="quiz-step">
            <h2>What's your budget?</h2>
            <p className="step-description">Select your preferred price range</p>

            <div className="price-options">
              <div
                className={`price-option ${answers.priceRange === "0-300" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("priceRange", "0-300")}
              >
                <h3>Under $300</h3>
                <p>Budget-friendly options</p>
              </div>

              <div
                className={`price-option ${answers.priceRange === "300-500" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("priceRange", "300-500")}
              >
                <h3>$300 - $500</h3>
                <p>Mid-range investment</p>
              </div>

              <div
                className={`price-option ${answers.priceRange === "500-1000" ? "selected" : ""}`}
                onClick={() => handleSingleOptionChange("priceRange", "500-1000")}
              >
                <h3>$500+</h3>
                <p>Premium courses with comprehensive content</p>
              </div>
            </div>

            <div className="step-buttons">
              <button className="btn-secondary prev-button" onClick={prevStep}>
                Back
              </button>
              <button className="btn-primary next-button" onClick={findMatchingCourses} disabled={!answers.priceRange}>
                Find My Courses
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderResults = () => {
    return (
      <div className="quiz-results">
        <h2>Your Recommended Courses</h2>
        <p className="results-description">Based on your preferences, we've found these courses for you:</p>

        {recommendedCourses.length > 0 ? (
          <div className="recommended-courses">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No courses match your criteria</h3>
            <p>We couldn't find courses that match all your preferences. Try adjusting your criteria or browse our complete catalog.</p>
            <div className="no-results-suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Select more interests</li>
                <li>Broaden your price range</li>
                <li>Consider different learning styles</li>
                <li>Try a different difficulty level</li>
              </ul>
            </div>
          </div>
        )}

        <div className="results-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              setQuizCompleted(false)
              setCurrentStep(1)
              setAnswers({
                interests: [],
                level: "",
                difficulty: "",
                learningStyle: [],
                timeCommitment: "",
                priceRange: "",
              })
            }}
          >
            Retake Quiz
          </button>
          <Link to="/courses" className="btn-primary">
            Browse All Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-page">
      {!quizCompleted ? (
        <>
          <div className="quiz-header">
            <h1>Find Your Perfect Course</h1>
            <p>Answer a few questions to get personalized course recommendations</p>
          </div>

          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
            </div>
            <div className="progress-steps">
              <span className="current-step">{currentStep}</span> / 6
            </div>
          </div>

          <div className="quiz-container">{renderStep()}</div>
        </>
      ) : (
        renderResults()
      )}
    </div>
  )
}

export default InterestQuiz