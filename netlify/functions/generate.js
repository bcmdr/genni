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
        model: "gpt-3.5-turbo-0125",
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content:
              "You turn ideas into prototypes. User enters a prompt, and you interpret it as a game, website, or web app. Then build an html page that meets the requirements of the idea. Only ever return a single, complete HTML file with no other formatting. Only use web apis that work in embedded iframes. Don't use APIs that require authentication. Do not include comments or markdown.",
          },
          { role: "user", content: `[no prose] [no analysis] [no markdown] Single HTML page with css (use 'box-sizing: border-box' in css code) and javascript for my idea, which is: ${requestBody.prompt} `},
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
      body: JSON.stringify({ reply: data.choices[0].message.content , usage: data.usage }),
    };
  } catch (error) {
    console.error("Error calling OpenAI function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
