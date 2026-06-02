import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import Card from './Card';

const AIFeedback = ({ title, message, actions }) => {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <AlertTriangle className="text-amber-400" size={22} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold">{title}</h4>
          <p className="text-sm text-slate-400 mt-2">{message}</p>

          <div className="mt-4">
            <p className="text-xs uppercase text-slate-500 font-semibold">Recommended Actions</p>
            <ul className="mt-2 space-y-2">
              {actions.map((a, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

AIFeedback.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  actions: PropTypes.array,
};

export default AIFeedback;
