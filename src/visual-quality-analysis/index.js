const runNimaCheck = require('./run-nima-check');

async function runVisualQualityCheck() {
  return await runNimaCheck();
}

module.exports = {
  runVisualQualityCheck,
};
