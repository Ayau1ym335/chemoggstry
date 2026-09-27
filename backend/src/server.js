const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const dataRepository = require('./repositories/dataRepository');
const PORT = process.env.PORT || 4000;

try {
  // Fail-fast data loading on startup
  dataRepository.loadReactions();
  dataRepository.loadExperiments();

  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
} catch (error) {
  console.error('CRITICAL: Server failed to start due to data loading error.');
  process.exit(1);
}
