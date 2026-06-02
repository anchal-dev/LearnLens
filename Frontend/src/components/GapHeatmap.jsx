import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const GapHeatmap = ({ data }) => {
  return (
    <Card>
      <h4 className="font-bold mb-3">Learning Gap Heatmap</h4>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="font-medium">{d.topic}</div>
            <div className="w-2/3 bg-dark-900 h-3 rounded-full ml-4 mr-4 overflow-hidden">
              <div className={`h-full ${d.count > 15 ? 'bg-rose-500' : d.count > 8 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(d.count * 5, 100)}%` }} />
            </div>
            <div className="w-12 text-right">{d.count}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

GapHeatmap.propTypes = { data: PropTypes.array.isRequired };

export default GapHeatmap;
