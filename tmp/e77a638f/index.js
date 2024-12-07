const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'GET') {
    // Simple random number endpoint at /number
    if (parsedUrl.pathname === '/') {
      const min = 1;
      const max = 100;
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(randomNumber.toString());
      return;
    }
    // Handle unknown paths
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Handle unsupported methods
  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method not allowed' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /      - Returns formatted random number with range');
  console.log('  GET /number - Returns just a random number');
});