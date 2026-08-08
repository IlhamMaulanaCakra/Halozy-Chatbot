const fs = require('fs');
let content = fs.readFileSync('src/utils/svmClassifier.ts', 'utf8');

// We need to parse SUPPORT_VECTORS. It's a bit hard with regex, so maybe we write a JS script that imports the TS file after compiling it? Or just string manipulation since we know the structure.
