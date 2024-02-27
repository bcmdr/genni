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
              "You turn ideas into prototypes. User enters a prompt, and you interpret it as a web page. Then you build an html page that meets the requirements of the idea. Only ever return a single, complete HTML file. Do not include comments or markdown.",
          },
          { role: "user", content: `[no prose] [no analysis] My user input is ${requestBody.prompt || "blank"}. This input is my idea. For my idea, generate a single html page with css and javascript. The html should be accessible and semantic. The css should use  a a style tag with modern, colorful styling like "box-sizing: border-box;". The javascript should be modern and lightweight and work in a mobile browser. After generating this html page, ensure it meets the requirements. Interpret additional features that would enhance the user experience and interface. Then rewrite the html page with these enhancements. Check the code for errors and rewrite if necessary.`},
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
