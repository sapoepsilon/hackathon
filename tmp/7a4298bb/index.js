const http = require('http');

// Word banks organized by length and category
const wordBanks = {
  small: {
    numbers: ['one', 'two', 'few', 'half', 'some', 'less'],
    temperature: ['cool', 'cold', 'warm', 'mild', 'hot'],
    quantity: ['tiny', 'mini', 'bits', 'dash', 'pinch', 'drop'],
    percentage: ['low', 'part', 'some', 'half', 'most', 'high']
  },
  medium: {
    numbers: ['several', 'minimal', 'reduced', 'limited', 'partial'],
    temperature: ['chilly', 'frozen', 'heated', 'burning', 'moderate'],
    quantity: ['portion', 'serving', 'amount', 'measure', 'volume'],
    percentage: ['fraction', 'portion', 'segment', 'section', 'divided']
  },
  large: {
    numbers: ['abundance', 'multitude', 'countless', 'numerous', 'plentiful'],
    temperature: ['scorching', 'freezing', 'sweltering', 'moderate'],
    quantity: ['excessive', 'abundant', 'plentiful', 'bountiful'],
    percentage: ['majority', 'minority', 'fragment', 'quotient', 'division']
  }
};

function getWordCategory(number, max) {
  const percentage = (number / max) * 100;
  
  if (percentage < 33) return 'small';
  if (percentage < 66) return 'medium';
  return 'large';
}

function getContextCategory(number, max) {
  const percentage = (number / max) * 100;
  
  if (percentage < 25) return 'temperature';
  if (percentage < 50) return 'numbers';
  if (percentage < 75) return 'quantity';
  return 'percentage';
}

function getRandomWord(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed. Please use POST.' }));
  }

  let data = '';

  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      
      // Validate input structure
      if (!jsonData.data?.randomNumber || !jsonData.data?.range?.min || !jsonData.data?.range?.max) {
        throw new Error('Invalid input format. Expected: {"data": {"randomNumber": n, "range": {"min": n, "max": n}}}');
      }

      const { randomNumber, range } = jsonData.data;
      
      // Validate number is within range
      if (randomNumber < range.min || randomNumber > range.max) {
        throw new Error('Random number must be within the specified range');
      }

      // Generate contextual word
      const sizeCategory = getWordCategory(randomNumber, range.max);
      const contextCategory = getContextCategory(randomNumber, range.max);
      const selectedWord = getRandomWord(wordBanks[sizeCategory][contextCategory]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        input: {
          number: randomNumber,
          range: range
        },
        output: {
          word: selectedWord,
          context: {
            size: sizeCategory,
            category: contextCategory
          }
        }
      }));

    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});