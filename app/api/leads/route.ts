import {NextResponse} from 'next/server';
import {ensureLeadTable} from '@/lib/db';

type Lead={name:string;phone:string;email?:string;company?:string;note?:string;systemSize?:number;batteryKwh?:number;investment?:number;saving?:number;payback?:number;lat?:number;lng?:number};

export const dynamic='force-dynamic';

export async function GET(){
 try{
  const sql=await ensureLeadTable();
  const leads=await sql`SELECT * FROM ves_solar_leads ORDER BY created_at DESC LIMIT 500`;
  return NextResponse.json({ok:true,leads});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}

export async function POST(req:Request){
 try{
  const body=(await req.json()) as Lead;
  if(!body.name?.trim()||!body.phone?.trim()) return NextResponse.json({ok:false,error:'กรุณากรอกชื่อและเบอร์โทรศัพท์'},{status:400});
  const sql=await ensureLeadTable();
  const rows=await sql`INSERT INTO ves_solar_leads(name,phone,email,company,note,system_size,battery_kwh,investment,saving,payback,lat,lng)
   VALUES(${body.name.trim()},${body.phone.trim()},${body.email||null},${body.company||null},${body.note||null},${body.systemSize||0},${body.batteryKwh||0},${body.investment||0},${body.saving||0},${body.payback||0},${body.lat??null},${body.lng??null}) RETURNING *`;
  return NextResponse.json({ok:true,lead:rows[0]},{status:201});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Database error'},{status:500})}
}
