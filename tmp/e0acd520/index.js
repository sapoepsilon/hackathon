const https = require('https');

// Define the URL
const url = 'https://meowfacts.herokuapp.com/';

// Make a GET request
https.get(url, (res) => {
    let data = '';

    // A chunk of data has been received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Parse the result.
    res.on('end', () => {
        try {
            const fact = JSON.parse(data);
            console.log('Random Cat Fact:', fact);
        } catch (error) {
            console.error('Error parsing JSON:', error.message);
        }
    });

}).on('error', (err) => {
    console.error('Error with request:', err.message);
});
