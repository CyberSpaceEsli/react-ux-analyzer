const fs = require('fs');
const path = require('path');
const { detectAestheticMinimalism } = require('./aesthetic-minimalistic-detector');

(async () => {
  const jsxCode = fs.readFileSync(path.resolve(__dirname, '../../../test/test-aesthetic-minimal/bad-minimalistics.jsx'), 'utf8');
  const url = 'http://localhost:5173'; // Or any testable local app

  const feedback = await detectAestheticMinimalism(jsxCode, url);

  console.log('🧠 Aesthetic Feedback:');
  console.log(JSON.stringify(feedback, null, 2));
})();