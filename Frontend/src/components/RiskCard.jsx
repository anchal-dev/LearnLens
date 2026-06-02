import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Card from './Card';

const RiskCard = ({ label = 'Learning Risk', value = 'Medium Risk', percent = 57 }) => {
  const color = percent > 75 ? 'text-emerald-400' : percent > 40 ? 'text-amber-400' : 'text-rose-400';
  return (
    <Card className="flex flex-col items-center justify-center text-center">
      <h4 className="text-sm text-slate-400 mb-2">{label}</h4>
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-4">
        <svg width="96" height="96" viewBox="0 0 36 36" className="rounded-full">
          <path d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0f172a" strokeWidth="4" />
          <path d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${percent} ${100 - percent}`}
            style={{ color: color === 'text-emerald-400' ? '#10b981' : color === 'text-amber-400' ? '#f59e0b' : '#f43f5e', transition: 'stroke-dasharray 0.8s' }} />
          <text x="18" y="20.5" fontSize="6" textAnchor="middle" fill="#cbd5e1">{percent}%</text>
        </svg>
      </motion.div>
      <p className="mt-3 font-semibold">{value}</p>
    </Card>
  );
};

RiskCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  percent: PropTypes.number,
};

export default RiskCard;
