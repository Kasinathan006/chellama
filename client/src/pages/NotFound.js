import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-card">
        <h1>404</h1>
        <p>This page does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
