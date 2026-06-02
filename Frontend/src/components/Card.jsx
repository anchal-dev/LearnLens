import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`glass-card ${className}`}>{children}</div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;
