const http = require('http');

const server = http.createServer((req, res) => {
  // Handle GET request for random number
  if (req.method === 'GET') {
    const min = 1;
    const max = 100;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      randomNumber: randomNumber,
      range: { min, max }
    }));
  }
  
  // Handle POST request for sum
  if (req.method === 'POST') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        // Check if input is an array
        if (!Array.isArray(jsonData)) {
          throw new Error('Input must be an array of numbers');
        }

        // Validate all elements are numbers and calculate sum
        const sum = jsonData.reduce((acc, curr) => {
          if (typeof curr !== 'number') {
            throw new Error('All elements must be numbers');
          }
          return acc + curr;
        }, 0);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sum: sum }));

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Handle unsupported methods
  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method not allowed. Please use GET or POST.' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});