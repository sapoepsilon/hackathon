const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let data = '';

    req.on('data', chunk => {
      data += chunk.toString();
    });

    req.on('end', () => {
      try {
        // Parse incoming request
        const userMessage = data;

        // OpenAI API request options
        const options = {
          hostname: 'api.openai.com',
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
          }
        };

        // Make request to OpenAI API
        const apiReq = https.request(options, apiRes => {
          let responseData = '';

          apiRes.on('data', chunk => {
            responseData += chunk;
          });

          apiRes.on('end', () => {
            res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(responseData);
          });
        });

        // Handle request body
        const requestBody = {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant."
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        };

        apiReq.on('error', error => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to make API request' }));
        });

        // Send the request
        apiReq.write(JSON.stringify(requestBody));
        apiReq.end();

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request format' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoint:');
  console.log('  POST /chat - Send a message to OpenAI API');
});