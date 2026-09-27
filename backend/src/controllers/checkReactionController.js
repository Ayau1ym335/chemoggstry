const dataRepository = require('../repositories/dataRepository');

function checkReaction(req, res) {
  const { substanceSymbols } = req.body;
  
  if (!substanceSymbols || !Array.isArray(substanceSymbols)) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'substanceSymbols must be an array' } });
  }

  // Normalize: sort and remove duplicates
  const uniqueSymbols = [...new Set(substanceSymbols)];
  const sortedInput = uniqueSymbols.map(s => s.trim()).sort().join(',');

  const mapping = dataRepository.getSubstanceReactionMap();
  
  const match = mapping.find(m => {
    // Normalization logic just in case the source JSON is not sorted perfectly
    const sortedMapping = [...m.substanceSymbols].sort().join(',');
    return sortedMapping === sortedInput;
  });

  if (!match) {
    return res.status(200).json({ reactionPossible: false });
  }

  const reaction = dataRepository.getReactionById(match.reactionId);
  if (!reaction) {
    return res.status(200).json({ reactionPossible: false });
  }

  // Return minimal data required by the UI for the selected reaction
  res.status(200).json({
    reactionPossible: true,
    reaction: {
      id: reaction.id,
      name: reaction.name,
      equation: reaction.equation,
      bondingType: reaction.bondingType
    }
  });
}

module.exports = { checkReaction };
