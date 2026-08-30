import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin-auth';
import {ensureCrmTables,ProjectStatus} from '@/lib/db';

const statuses:ProjectStatus[]=['SURVEY','DESIGN','QUOTATION','NEGOTIATION','WON','LOST'];

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const denied=requireAdmin(req);if(denied)return denied;
  const {id}=await params;const projectId=Number(id);const sql=await ensureCrmTables();
  const rows=await sql`SELECT p.*,l.name AS contact_name,l.phone,l.email,l.company,l.note AS lead_note,l.investment AS estimated_investment,l.saving,l.payback,l.lat,l.lng
   FROM ves_solar_projects p JOIN ves_solar_leads l ON l.id=p.lead_id WHERE p.id=${projectId}`;
  if(!rows[0])return NextResponse.json({ok:false,error:'ไม่พบ Project'},{status:404});
  const quotations=await sql`SELECT * FROM ves_solar_quotations WHERE project_id=${projectId} ORDER BY created_at DESC`;
  return NextResponse.json({ok:true,project:rows[0],quotations});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const denied=requireAdmin(req);if(denied)return denied;
  const {id}=await params;const projectId=Number(id);const body=await req.json();
  if(!String(body.name||'').trim())return NextResponse.json({ok:false,error:'กรุณาระบุชื่อ Project'},{status:400});
  if(!statuses.includes(body.status))return NextResponse.json({ok:false,error:'Project status ไม่ถูกต้อง'},{status:400});
  const value=Number(body.projectValue||0);if(!Number.isFinite(value)||value<0)return NextResponse.json({ok:false,error:'มูลค่าโครงการไม่ถูกต้อง'},{status:400});
  const sql=await ensureCrmTables();
  const rows=await sql`UPDATE ves_solar_projects SET name=${String(body.name||'').trim()},status=${body.status},project_value=${value},owner=${body.owner||null},site_address=${body.siteAddress||null},note=${body.note||null},updated_at=NOW() WHERE id=${projectId} RETURNING *`;
  if(!rows[0])return NextResponse.json({ok:false,error:'ไม่พบ Project'},{status:404});
  await sql`UPDATE ves_solar_leads SET status=${body.status==='WON'?'WON':body.status==='LOST'?'LOST':body.status==='QUOTATION'||body.status==='NEGOTIATION'?'PROPOSAL':'SURVEY'},updated_at=NOW() WHERE id=${Number(rows[0].lead_id)}`;
  return NextResponse.json({ok:true,project:rows[0]});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
