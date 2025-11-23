const pdfParse = require('pdf-parse');
const fs = require('fs');

console.log('pdf-parse module:', pdfParse);
console.log('typeof:', typeof pdfParse);
console.log('is function?', typeof pdfParse === 'function');
console.log('is object?', typeof pdfParse === 'object');
console.log('keys:', Object.keys(pdfParse));

// Try to parse a dummy buffer
async function test() {
  try {
    console.log('\nTrying pdfParse(buffer) directly...');
    const buffer = Buffer.from('%PDF-1.4 test');
    const result = await pdfParse(buffer);
    console.log('Success!', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

test();
