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
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content:
              "You build accessibly designed, stylish, modern, impressive, fully-featured, working front-end web apps and websites with complete html, css, and javascript code based on the user's description of requirements and ideas of the user interface. Only ever return a single, complete HTML file with no other formatting. Only use web apis that work in embedded iframes. Don't use APIs that require authentication. Do not include comments or markdown. Assume the output will be rendered immediately in an iframe with CORS restrictions. Interpret additional features where needed to make more complete or impressive. Always use flexbox or grid and sizing tricks like minmax. The user interface of the result should have input and output. If state is needed, use Vue unless another framework is specified. Use box-sizing: border-box in the css. Always load demo content and load the first example of the demo if possible",
          },
          { role: "user", content: `[no prose] [no analysis] [no markdown] Single HTML page for this idea: ${requestBody.prompt}` },
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
