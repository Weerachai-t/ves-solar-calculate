import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin-auth';
import {ensureCrmTables} from '@/lib/db';

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const denied=requireAdmin(req);if(denied)return denied;
  const {id}=await params;const leadId=Number(id);
  if(!Number.isInteger(leadId)||leadId<1)return NextResponse.json({ok:false,error:'Lead ID ไม่ถูกต้อง'},{status:400});
  const sql=await ensureCrmTables();
  const leads=await sql`SELECT * FROM ves_solar_leads WHERE id=${leadId}`;
  if(!leads[0])return NextResponse.json({ok:false,error:'ไม่พบ Lead'},{status:404});
  const lead=leads[0];
  const rows=await sql`INSERT INTO ves_solar_projects(lead_id,name,project_value,system_size,battery_kwh,note)
   VALUES(${leadId},${lead.company||lead.name},${lead.investment||0},${lead.system_size||0},${lead.battery_kwh||0},${lead.note||null})
   ON CONFLICT (lead_id) DO UPDATE SET updated_at=NOW() RETURNING *`;
  const projectId=Number(rows[0].id);
  const projects=await sql`UPDATE ves_solar_projects SET project_code=COALESCE(project_code,CONCAT('VES-',EXTRACT(YEAR FROM created_at)::int,'-',LPAD(id::text,5,'0'))) WHERE id=${projectId} RETURNING *`;
  await sql`UPDATE ves_solar_leads SET status=CASE WHEN status IN ('NEW','CONTACTED') THEN 'SURVEY' ELSE status END,updated_at=NOW() WHERE id=${leadId}`;
  return NextResponse.json({ok:true,project:projects[0]}, {status:201});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
