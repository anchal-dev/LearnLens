import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from './Card';

const PerformanceTrend = ({ data }) => {
  return (
    <Card className="p-4">
      <h4 className="font-bold mb-2">Performance Trend</h4>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
            <Tooltip contentStyle={{ background: '#0b1220', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

PerformanceTrend.propTypes = { data: PropTypes.array.isRequired };

export default PerformanceTrend;
