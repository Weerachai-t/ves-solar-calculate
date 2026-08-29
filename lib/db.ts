import { neon } from '@neondatabase/serverless';

export type LeadStatus='NEW'|'CONTACTED'|'SURVEY'|'PROPOSAL'|'WON'|'LOST';

export function db(){
 const url=process.env.DATABASE_URL;
 if(!url) throw new Error('DATABASE_URL is not configured');
 return neon(url);
}

export async function ensureLeadTable(){
 const sql=db();
 await sql`CREATE TABLE IF NOT EXISTS ves_solar_leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  system_size DOUBLE PRECISION DEFAULT 0,
  battery_kwh DOUBLE PRECISION DEFAULT 0,
  investment DOUBLE PRECISION DEFAULT 0,
  saving DOUBLE PRECISION DEFAULT 0,
  payback DOUBLE PRECISION DEFAULT 0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 )`;
 return sql;
}
