const dataRepository = require('../repositories/dataRepository');

function getAllElements(req, res) {
  // shortDescription is intentionally included — the dataset is small (~21 elements),
  // and including it here avoids a second per-click HTTP request in ElementInfoPanel.
  const elements = dataRepository.getAllElements();
  res.json({ elements });
}

function getElementBySymbol(req, res) {
  const { symbol } = req.params;
  const element = dataRepository.getElementBySymbol(symbol);
  
  if (!element) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Element not found' } });
  }

  res.json({ element });
}

module.exports = {
  getAllElements,
  getElementBySymbol
};
