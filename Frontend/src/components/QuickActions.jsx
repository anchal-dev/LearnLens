import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const QuickActions = ({ actions }) => {
  return (
    <Card>
      <h4 className="font-bold mb-3">AI Tutor Quick Actions</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a, i) => (
          <button key={i} className="py-3 px-2 rounded-lg bg-gradient-to-br from-primary-500 to-rose-500 text-white font-semibold hover:scale-105 transition-transform">
            <div className="text-xl mb-1">{a.icon}</div>
            <div className="text-sm">{a.label}</div>
          </button>
        ))}
      </div>
    </Card>
  );
};

QuickActions.propTypes = { actions: PropTypes.array.isRequired };

export default QuickActions;
