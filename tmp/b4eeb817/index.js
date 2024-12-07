const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Handle POST request for sum
  if (req.method === 'POST') {
    let data = '';

    req.on('data', chunk => {
      data += chunk.toString();
    });

    req.on('end', () => {
      try {
        // Split input into UUID and JSON parts
        const colonIndex = data.indexOf(':');
        if (colonIndex === -1) {
          throw new Error('Invalid input format');
        }

        const uuid = data.substring(0, colonIndex).trim();
        const jsonString = data.substring(colonIndex + 1).trim();
        
        // Parse the JSON portion
        const jsonData = JSON.parse(jsonString);
        
        // Extract numbers from the specific format
        const num1 = parseInt(jsonData.input1.data);
        const num2 = parseInt(jsonData.input2.data);
        
        // Validate inputs are valid numbers
        if (isNaN(num1) || isNaN(num2)) {
          throw new Error('Both inputs must be valid numbers');
        }

        const sum = num1 + num2;
        
        const response = {
          uuid,
          result: {
            sum: sum,
            inputs: {
              num1: num1,
              num2: num2
            }
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Handle unknown paths
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /    - Returns formatted random number with range');
  console.log('  POST /sum - Takes two numbers with UUID prefix and returns their sum');
});