import {NextResponse} from 'next/server';
import {ensureLeadTable,LeadStatus} from '@/lib/db';
const statuses:LeadStatus[]=['NEW','CONTACTED','SURVEY','PROPOSAL','WON','LOST'];
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 try{const {id}=await params;const body=await req.json();if(!statuses.includes(body.status))return NextResponse.json({ok:false,error:'Invalid status'},{status:400});const sql=await ensureLeadTable();const rows=await sql`UPDATE ves_solar_leads SET status=${body.status},updated_at=NOW() WHERE id=${Number(id)} RETURNING *`;return NextResponse.json({ok:true,lead:rows[0]||null})}catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 try{const {id}=await params;const sql=await ensureLeadTable();await sql`DELETE FROM ves_solar_leads WHERE id=${Number(id)}`;return NextResponse.json({ok:true})}catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
