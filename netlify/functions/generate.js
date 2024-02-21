// functions/generate.js
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    console.log("Function started.");

    const requestBody = JSON.parse(event.body);

    console.log("Making OpenAI API request...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "Create working prototypes with complete html, css, and javascript code based on the user prompt. Output complete html files. Add functionality via cdn if needed to complete the prototype. Do not include additional formatting nor comments nor markdown.",
          },
          { role: "user", content: requestBody.prompt },
        ],
      }),
    });

    console.log("Checking response status...");
    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} - ${await response.text()}`,
      );
    }

    console.log("Parsing response JSON...");
    const data = await response.json();

    console.log("Returning response.");
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Error calling OpenAI function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};