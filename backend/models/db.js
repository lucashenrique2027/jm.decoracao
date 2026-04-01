import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import dotenv from 'dotenv';
import { schema } from './schema.js';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool ({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.,
    database: process.env.DB_NAME
});

export const db = drizzle(pool,{schema});