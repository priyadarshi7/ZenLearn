import "./styles/MessageItem.css"

const MessageItem = ({ message }) => {
  const { text, sender, timestamp, isSearch } = message

  if (sender === "bot" && isSearch && Array.isArray(text)) {
    return (
      <div className="message bot-message search-results">
        <div className="message-content">
          <div className="search-results-container">
            <h4>Search Results</h4>
            {text.map((result, index) => (
              <div key={index} className="search-result-item">
                <h5>{result.title || "Result " + (index + 1)}</h5>
                <p>{result.content || result.snippet || "No description available"}</p>
                {result.url && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-link">
                    Learn More
                  </a>
                )}
                {result.image_url && (
                  <div className="result-image">
                    <img src={result.image_url || "/placeholder.svg"} alt={result.title || "Search result"} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="message-timestamp">{timestamp}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`message ${sender === "user" ? "user-message" : "bot-message"}`}>
      <div className="message-content">
        <p>{typeof text === "string" ? text : JSON.stringify(text, null, 2)}</p>
        <div className="message-timestamp">{timestamp}</div>
      </div>
    </div>
  )
}

export default MessageItem

