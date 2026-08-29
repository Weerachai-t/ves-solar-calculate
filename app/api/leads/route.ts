import {NextResponse} from 'next/server';

type Lead={name:string;phone:string;email?:string;company?:string;note?:string;systemSize?:number;batteryKwh?:number;investment?:number;saving?:number;payback?:number;lat?:number;lng?:number;createdAt?:string};

export async function POST(req:Request){
 try{
  const body=(await req.json()) as Lead;
  if(!body.name?.trim()||!body.phone?.trim()) return NextResponse.json({ok:false,error:'กรุณากรอกชื่อและเบอร์โทรศัพท์'},{status:400});
  const lead={...body,createdAt:new Date().toISOString()};
  // Phase 3 foundation: ready for PostgreSQL/CRM persistence in the next database step.
  console.log('VES_SOLAR_LEAD',JSON.stringify(lead));
  return NextResponse.json({ok:true,lead});
 }catch{return NextResponse.json({ok:false,error:'ข้อมูลไม่ถูกต้อง'},{status:400})}
}
