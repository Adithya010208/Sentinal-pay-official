const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'assets', 'securepay-logo.png');
const outputPath = path.join(__dirname, 'public', 'favicon.ico');

sharp(inputPath)
  .resize(64, 64)
  .toFormat('png')
  .toFile(outputPath)
  .then(() => console.log('Successfully generated favicon.ico'))
  .catch((err) => console.error('Error generating favicon:', err));
