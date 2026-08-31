const { parseSpokenAmount } = require('./src/lib/utils/formatters.ts');

// We can test the parser directly or test via custom mock
console.log('Testing Spoken Amount Formatter:');
const tests = [
  '50 ribu',
  'lima puluh ribu',
  '1.5 juta',
  '250rb',
  '100k',
  'dua juta lima ratus ribu',
  '300000',
  '350 rb',
  '10 juta rupiah',
];

// Simple regex validator for test
tests.forEach(t => {
  console.log(`Input: "${t}"`);
});
