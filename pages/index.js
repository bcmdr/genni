// pages/index.js
import { useState } from 'react';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/.netlify/functions/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.reply);
      setError(null);
    } catch (error) {
      console.error('Error calling OpenAI function:', error);
      setError(error.message || 'An error occurred.');
    }
  };

  return (
    <div>
      <h1>OpenAI Chat with Netlify Function</h1>
      <div>
        <label>
          Enter your prompt:
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      {error && (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      )}
      {response && (
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
