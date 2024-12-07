const http = require('http');

// Helper function to convert letter to alphabet position
function getAlphabetPosition(letter) {
  return letter.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

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
  
  // Handle POST requests
  if (req.method === 'POST') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        // Handle letter sequence conversion
        if (jsonData.letters) {
          const letters = jsonData.letters.toString().replace(/[^a-zA-Z]/g, '');
          if (letters.length === 0) {
            throw new Error('No valid letters provided');
          }

          const result = {
            input: letters,
            positions: Array.from(letters).map(letter => ({
              letter: letter,
              position: getAlphabetPosition(letter)
            }))
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }
        
        // Handle number array sum (existing functionality)
        if (Array.isArray(jsonData)) {
          const sum = jsonData.reduce((acc, curr) => {
            if (typeof curr !== 'number') {
              throw new Error('All elements must be numbers');
            }
            return acc + curr;
          }, 0);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ sum: sum }));
        }

        throw new Error('Invalid request format');

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