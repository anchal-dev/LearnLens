import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from './Card';

const WeeklyStudyChart = ({ data }) => {
  return (
    <Card className="p-4">
      <h4 className="font-bold mb-2">Weekly Study Analytics</h4>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradStudy" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
            <Tooltip contentStyle={{ background: '#0b1220', borderRadius: 10 }} />
            <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#gradStudy)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

WeeklyStudyChart.propTypes = { data: PropTypes.array.isRequired };

export default WeeklyStudyChart;
