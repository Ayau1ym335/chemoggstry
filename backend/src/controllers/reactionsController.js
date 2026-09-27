const dataRepository = require('../repositories/dataRepository');

const reactionsController = {
  list: (req, res) => {
    const allReactions = dataRepository.getAllReactions();
    
    // Map to the required frontend format, explicitly excluding parametersRange and reactionPossible
    const formattedReactions = allReactions.map(r => ({
      id: r.id,
      name: r.name,
      equation: r.equation,
      bondingType: r.bondingType
    }));

    res.json({ reactions: formattedReactions });
  },

  getById: (req, res) => {
    const { id } = req.params;
    
    // Validate ID existence just in case, though Express handles route matching
    if (!id) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Reaction ID is required'
        }
      });
    }

    const reaction = dataRepository.getReactionById(id);

    if (!reaction) {
      return res.status(404).json({
        error: {
          code: 'REACTION_NOT_FOUND',
          message: `Reaction with id '${id}' not found`
        }
      });
    }

    // Return full details but strip internal algorithm data (parametersRange)
    res.json({
      reaction: {
        id: reaction.id,
        name: reaction.name,
        reactants: reaction.reactants,
        products: reaction.products,
        equation: reaction.equation,
        bondingType: reaction.bondingType,
        reactionPossible: reaction.reactionPossible
      }
    });
  }
};

module.exports = reactionsController;
