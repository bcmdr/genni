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
        // model: "gpt-4",
        max_tokens: 2500,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "You turn ideas into web applications. User enters a prompt, and you interpret it as a web application. Then you build an html page that meets the requirements of the idea. Only ever return a single, complete HTML file. Do not include comments or markdown. If an API is needed, use royalty-free, open apis that do not require authentication or API keys. Add functionality relevant to the completion of the user's idea as needed. Use actual relevent information as content sources for the web page. The html should be accessible and semantic, and it should use meta viewport for mobile. CSS requirements are: use 'box-sizing: border-box' on all elements, use high contrast accessible colors, use a visually appealing colour pallette. The javascript should be modern and lightweight and work in a mobile browser.",
          },
          { role: "user", content: `${requestBody.prompt}`},
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
