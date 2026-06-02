import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const Achievements = ({ items }) => {
  return (
    <Card>
      <h4 className="font-bold mb-3">Achievements</h4>
      {items && items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map(it => (
            <div key={it.id} className="flex items-center gap-3 bg-dark-900 p-3 rounded-lg">
              <div className="text-2xl">{it.icon}</div>
              <div>
                <div className="font-semibold">{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-400">No achievements yet. Keep learning to earn badges!</div>
      )}
    </Card>
  );
};

Achievements.propTypes = { items: PropTypes.array.isRequired };

export default Achievements;
