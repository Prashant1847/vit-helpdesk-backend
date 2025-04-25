import session from 'express-session';
import MongoStore from 'connect-mongo';

import dotenv from 'dotenv';
dotenv.config();


const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-12345-not-for-prod',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/vit-helpdesk',
    ttl: 30 * 60 // 30 minutes
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.CLIENT_URL?.startsWith('https'),
    sameSite: 'none',
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
});

export default sessionMiddleware; 