import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const LearningPlan = ({ tasks }) => {
  const [items, setItems] = useState(tasks || []);
  const completed = useMemo(() => items.filter(i => i.done).length, [items]);

  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold">Today's Learning Plan</h4>
        <div className="text-sm text-slate-400">{items.length ? `${Math.round((completed / items.length) * 100)}% complete` : 'No tasks'}</div>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-400">You're all caught up — no tasks for today.</div>
      ) : (
        <ul className="space-y-3">
          {items.map(t => (
            <li key={t.id} className="flex items-center gap-3">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="w-4 h-4" />
              <span className={`${t.done ? 'line-through text-slate-400' : 'text-white'}`}>{t.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

LearningPlan.propTypes = { tasks: PropTypes.array.isRequired };

export default LearningPlan;
