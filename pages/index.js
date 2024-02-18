import React, { useState } from 'react';

function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setGeneratedText(data.generatedText);
    } catch (error) {
      console.error(error);
      // Handle error display
    }
  };

  return (
    <div>
      <h1>Generate Text with OpenAI</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt">Prompt:</label>
        <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button type="submit">Generate</button>
      </form>
      {generatedText && <p>{generatedText}</p>}
    </div>
  );
}

export default Home;