const https = require('https');
const http = require('http');

// Define the URL
const url = 'https://meowfacts.herokuapp.com/';

// Create an HTTP server
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Fetch data from the meowfacts API
        https.get(url, (apiRes) => {
            let data = '';

            // A chunk of data has been received.
            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Parse the result.
            apiRes.on('end', () => {
                try {
                    const fact = JSON.parse(data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(fact));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error parsing JSON: ' + error.message);
                }
            });
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error with request: ' + err.message);
        });
    } else {
        // Handle other routes
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
