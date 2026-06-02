import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const AIInterventions = ({ items }) => {
  return (
    <Card>
      <h4 className="font-bold mb-3">AI Intervention Suggestions</h4>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="bg-dark-900 p-3 rounded-lg">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-slate-400 mt-1">{it.body}</div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

AIInterventions.propTypes = { items: PropTypes.array.isRequired };

export default AIInterventions;
