import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin-auth';
import {ensureCrmTables,QuotationStatus} from '@/lib/db';

const statuses:QuotationStatus[]=['DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED'];

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const denied=requireAdmin(req);if(denied)return denied;
  const {id}=await params;const quotationId=Number(id);const body=await req.json();
  if(!statuses.includes(body.status))return NextResponse.json({ok:false,error:'Quotation status ไม่ถูกต้อง'},{status:400});
  const sql=await ensureCrmTables();
  const rows=await sql`UPDATE ves_solar_quotations SET status=${body.status},updated_at=NOW() WHERE id=${quotationId} RETURNING *`;
  if(!rows[0])return NextResponse.json({ok:false,error:'ไม่พบใบเสนอราคา'},{status:404});
  const projectId=Number(rows[0].project_id);
  if(body.status==='ACCEPTED'){
   await sql`UPDATE ves_solar_projects SET status='WON',project_value=${Number(rows[0].amount)},updated_at=NOW() WHERE id=${projectId}`;
   await sql`UPDATE ves_solar_leads SET status='WON',updated_at=NOW() WHERE id=(SELECT lead_id FROM ves_solar_projects WHERE id=${projectId})`;
  }else{
   const nextProjectStatus=body.status==='SENT'?'NEGOTIATION':'QUOTATION';
   await sql`UPDATE ves_solar_projects SET status=${nextProjectStatus},updated_at=NOW() WHERE id=${projectId} AND status<>'LOST'`;
   await sql`UPDATE ves_solar_leads SET status='PROPOSAL',updated_at=NOW() WHERE id=(SELECT lead_id FROM ves_solar_projects WHERE id=${projectId})`;
  }
  return NextResponse.json({ok:true,quotation:rows[0]});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
