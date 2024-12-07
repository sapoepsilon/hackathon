const http = require('http');

// Array of French words
const frenchWords = ['bonjour', 'au revoir', 'bienvenue', 'merci', 'excusez-moi', 'oui', 'non'];

// Function to get random word
function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * frenchWords.length);
  return frenchWords[randomIndex];
}

const server = http.createServer((req, res) => {
  if(req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(getRandomWord());
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});