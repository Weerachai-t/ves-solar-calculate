import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin-auth';
import {ensureCrmTables} from '@/lib/db';

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const denied=requireAdmin(req);if(denied)return denied;
  const {id}=await params;const projectId=Number(id);const body=await req.json();const amount=Number(body.amount);
  if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({ok:false,error:'กรุณาระบุมูลค่าใบเสนอราคา'},{status:400});
  const sql=await ensureCrmTables();
  const projects=await sql`SELECT id FROM ves_solar_projects WHERE id=${projectId}`;
  if(!projects[0])return NextResponse.json({ok:false,error:'ไม่พบ Project'},{status:404});
  const versions=await sql`SELECT COALESCE(MAX(version),0)::int+1 AS version FROM ves_solar_quotations WHERE project_id=${projectId}`;
  const rows=await sql`INSERT INTO ves_solar_quotations(project_id,version,amount,valid_until,note) VALUES(${projectId},${Number(versions[0].version)},${amount},${body.validUntil||null},${body.note||null}) RETURNING *`;
  const quoteId=Number(rows[0].id);
  const quotes=await sql`UPDATE ves_solar_quotations SET quotation_number=CONCAT('VES-QT-',TO_CHAR(created_at,'YYYYMM'),'-',LPAD(id::text,5,'0')) WHERE id=${quoteId} RETURNING *`;
  await sql`UPDATE ves_solar_projects SET status='QUOTATION',project_value=${amount},updated_at=NOW() WHERE id=${projectId}`;
  await sql`UPDATE ves_solar_leads SET status='PROPOSAL',updated_at=NOW() WHERE id=(SELECT lead_id FROM ves_solar_projects WHERE id=${projectId})`;
  return NextResponse.json({ok:true,quotation:quotes[0]},{status:201});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
