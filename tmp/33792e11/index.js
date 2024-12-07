const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        const { num1, num2 } = JSON.parse(data);
        
        // Validate inputs are numbers
        if (typeof num1 !== 'number' || typeof num2 !== 'number') {
          throw new Error('Both inputs must be numbers');
        }

        const sum = num1 + num2;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sum }));

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
  console.log('  GET /      - Returns formatted random number with range');
  console.log('  GET /number - Returns just a random number');
  console.log('  POST /sum   - Takes two numbers and returns their sum');
});