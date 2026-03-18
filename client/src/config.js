// Central API base — works both locally and on Vercel production
const API_BASE = process.env.NODE_ENV === 'production'
    ? ''   // same origin on Vercel
    : 'http://localhost:5000';

export default API_BASE;
