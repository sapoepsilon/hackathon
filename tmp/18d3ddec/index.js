const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';

        // Collect data from the request body
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Parse the received data
                const { numbers } = JSON.parse(body);

                // Validate input
                if (!Array.isArray(numbers)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Input should be an array of numbers.' }));
                }

                if (!numbers.every(num => typeof num === 'number')) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Array must contain only numbers.' }));
                }

                // Perform summation
                const sum = numbers.reduce((acc, num) => acc + num, 0);

                // Send the result
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ sum }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
            }
        });
    } else {
        // Handle unsupported routes
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route not found');
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
