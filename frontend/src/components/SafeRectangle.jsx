import React from 'react';
import { Rectangle } from 'react-leaflet';

// validate bounds: [[lat1,lng1],[lat2,lng2]]
function isValidBounds(bounds) {
  if (!bounds || !Array.isArray(bounds) || bounds.length < 2) return false;
  const a = bounds[0];
  const b = bounds[1];
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2) return false;
  const lat1 = Number(a[0]);
  const lng1 = Number(a[1]);
  const lat2 = Number(b[0]);
  const lng2 = Number(b[1]);
  return [lat1, lng1, lat2, lng2].every(Number.isFinite);
}

export default function SafeRectangle(props) {
  const { bounds } = props;
  if (!isValidBounds(bounds)) {
    console.warn('SafeRectangle: invalid bounds, skipping rectangle:', bounds, props);
    return null;
  }
  return <Rectangle {...props} />;
}

