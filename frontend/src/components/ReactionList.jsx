import React from 'react';
import ReactionCard from './ReactionCard';
import './ReactionList.css';

export default function ReactionList({ reactions, selectedReactionId, onSelectReaction }) {
  return (
    <div className="reaction-list">
      {reactions.map((reaction) => (
        <ReactionCard
          key={reaction.id}
          reaction={reaction}
          isSelected={reaction.id === selectedReactionId}
          onSelect={onSelectReaction}
        />
      ))}
    </div>
  );
}
