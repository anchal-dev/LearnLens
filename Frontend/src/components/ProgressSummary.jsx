import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const ProgressSummary = ({ level = 'N/A', mastered = 0, inProgress = 0, weak = 0 }) => {
  return (
    <Card>
      <h4 className="font-bold mb-4">Student Progress Summary</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Current Level</p>
          <p className="font-semibold text-white">{level}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Topics Mastered</p>
          <p className="font-semibold text-white">{mastered}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Topics In Progress</p>
          <p className="font-semibold text-white">{inProgress}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Weak Topics</p>
          <p className="font-semibold text-white">{weak}</p>
        </div>
      </div>
    </Card>
  );
};

ProgressSummary.propTypes = {
  level: PropTypes.string,
  mastered: PropTypes.number,
  inProgress: PropTypes.number,
  weak: PropTypes.number,
};

export default ProgressSummary;
