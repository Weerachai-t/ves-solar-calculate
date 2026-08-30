import { neon } from '@neondatabase/serverless';

export type LeadStatus='NEW'|'CONTACTED'|'SURVEY'|'PROPOSAL'|'WON'|'LOST';
export type ProjectStatus='SURVEY'|'DESIGN'|'QUOTATION'|'NEGOTIATION'|'WON'|'LOST';
export type QuotationStatus='DRAFT'|'SENT'|'ACCEPTED'|'REJECTED'|'EXPIRED';

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

export async function ensureCrmTables(){
 const sql=await ensureLeadTable();
 await sql`CREATE TABLE IF NOT EXISTS ves_solar_projects (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL UNIQUE REFERENCES ves_solar_leads(id) ON DELETE CASCADE,
  project_code TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SURVEY',
  project_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  system_size DOUBLE PRECISION DEFAULT 0,
  battery_kwh DOUBLE PRECISION DEFAULT 0,
  owner TEXT,
  site_address TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 )`;
 await sql`CREATE TABLE IF NOT EXISTS ves_solar_quotations (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES ves_solar_projects(id) ON DELETE CASCADE,
  quotation_number TEXT UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  valid_until DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 )`;
 await sql`CREATE INDEX IF NOT EXISTS ves_solar_projects_status_idx ON ves_solar_projects(status)`;
 await sql`CREATE INDEX IF NOT EXISTS ves_solar_quotations_project_idx ON ves_solar_quotations(project_id)`;
 return sql;
}
