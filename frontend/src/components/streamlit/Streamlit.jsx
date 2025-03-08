import React from 'react'

const Streamlit = () => {
  return (
    <div>
            <iframe
      src="http://localhost:8501/"
      style={{ width: '100%', height: '100svh', border: 'none',  }}
      title="Streamlit App"
    ></iframe>
    </div>
  )
}

export default Streamlit