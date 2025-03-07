import { useEffect, useRef } from "react";
import "./ReviewMarquee.css";

// Sample review data
const reviews = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Product Designer",
    content:
      "This product has completely transformed our workflow. The interface is intuitive and the performance is outstanding.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Marketing Director",
    content: "Incredibly easy to use with powerful features. The support team is also very responsive and helpful.",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Developer",
    content:
      "The API documentation is comprehensive and the integration was seamless. Highly recommended for any tech stack.",
    rating: 4,
  },
  {
    id: 4,
    name: "Emma Rodriguez",
    role: "UX Researcher",
    content:
      "The attention to detail in the user experience is remarkable. Our users have reported a significant improvement in satisfaction.",
    rating: 5,
  },
  {
    id: 5,
    name: "David Kim",
    role: "Startup Founder",
    content: "This solution helped us scale quickly without compromising on quality. Worth every penny.",
    rating: 5,
  },
  {
    id: 6,
    name: "Lisa Thompson",
    role: "Project Manager",
    content: "The collaboration features have made our remote work much more efficient. The learning curve is minimal.",
    rating: 4,
  },
];

export default function ReviewMarquee() {
  const marqueeRef = useRef(null); // ✅ FIXED: Removed TypeScript syntax

  useEffect(() => {
    const marqueeElement = marqueeRef.current;
    if (!marqueeElement) return;

    // Clone the content for seamless looping
    const content = marqueeElement.querySelector(".marquee-content");
    if (content) {
      const clone = content.cloneNode(true);
      marqueeElement.appendChild(clone);
    }
  }, []);

  return (
    <div className="review-marquee-container">
      <h2 className="marquee-title">What Our Customers Say</h2>

      <div className="marquee-wrapper" ref={marqueeRef}>
        <div className="marquee-content">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < review.rating ? "filled" : ""}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <p className="review-text">{review.content}</p>

              <div className="review-author">
                <div className="author-avatar">{review.name.charAt(0)}</div>
                <div className="author-info">
                  <h4 className="author-name">{review.name}</h4>
                  <p className="author-role">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
