import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Card from './Card';

const statusColor = (s) => {
  if (s === 'Strong') return 'bg-emerald-400';
  if (s === 'Needs Practice') return 'bg-amber-400';
  return 'bg-rose-400';
};

const LearningGapAnalysis = ({ gaps }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Learning Gap Analysis</h3>
      <div className="space-y-4">
        {gaps.map((g, i) => (
          <motion.div key={g.topic} whileHover={{ scale: 1.02 }} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{g.topic}</p>
              <p className="text-xs text-slate-400">{g.status}</p>
            </div>
            <div className="flex-1 ml-6 mr-4">
              <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
                <div className={`${statusColor(g.status)} h-full`} style={{ width: `${g.progress}%`, transition: 'width 0.6s' }} />
              </div>
            </div>
            <div className="w-14 text-right text-sm font-bold">{g.progress}%</div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

LearningGapAnalysis.propTypes = {
  gaps: PropTypes.array.isRequired,
};

export default LearningGapAnalysis;
