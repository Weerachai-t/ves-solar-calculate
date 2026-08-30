import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin-auth';
import {ensureCrmTables} from '@/lib/db';

export const dynamic='force-dynamic';

export async function GET(req:Request){
 try{
  const denied=requireAdmin(req);if(denied)return denied;
  const sql=await ensureCrmTables();
  const projects=await sql`SELECT p.*,l.name AS contact_name,l.phone,l.email,l.company,
   q.quotation_number,q.amount AS quotation_amount,q.status AS quotation_status
   FROM ves_solar_projects p
   JOIN ves_solar_leads l ON l.id=p.lead_id
   LEFT JOIN LATERAL (SELECT quotation_number,amount,status FROM ves_solar_quotations WHERE project_id=p.id ORDER BY created_at DESC LIMIT 1) q ON TRUE
   ORDER BY p.updated_at DESC LIMIT 500`;
  const pipeline=await sql`SELECT status,COUNT(*)::int AS count,COALESCE(SUM(project_value),0)::float8 AS value FROM ves_solar_projects GROUP BY status`;
  const quoteSummary=await sql`SELECT COUNT(*) FILTER (WHERE status IN ('DRAFT','SENT'))::int AS open_count,
   COALESCE(SUM(amount) FILTER (WHERE status IN ('DRAFT','SENT')),0)::float8 AS open_value,
   (SELECT COALESCE(SUM(project_value),0)::float8 FROM ves_solar_projects WHERE status='WON') AS accepted_value FROM ves_solar_quotations`;
  return NextResponse.json({ok:true,projects,pipeline,quotationSummary:quoteSummary[0]});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
