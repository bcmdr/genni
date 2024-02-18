const openai = require('openai');

exports.handler = async (event, context) => {
  // Extract user input (e.g., from event.body)
  const prompt = event.body.prompt;

  // Set your OpenAI API key securely (e.g., using environment variables)
  openai.api_key = process.env.OPENAI_API_KEY;

  // Call the OpenAI API with the prompt
  const response = await openai.Completion.create({
    engine: "text-davinci-003",
    prompt: prompt,
    max_tokens: 150,
    temperature: 0.7,
    n: 1,
    stop: null,
  });

  // Return the generated text in the response
  return {
    statusCode: 200,
    body: JSON.stringify({ generatedText: response.choices[0].text }),
  };
};