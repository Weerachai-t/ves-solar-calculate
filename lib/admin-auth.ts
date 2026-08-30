import {createHash,timingSafeEqual} from 'crypto';
import {NextRequest,NextResponse} from 'next/server';

export const ADMIN_COOKIE='ves_admin';

export function adminToken(password:string){
 return createHash('sha256').update(`ves-admin:${password}`).digest('hex');
}

export function passwordsMatch(value:string,expected:string){
 const a=createHash('sha256').update(value).digest();
 const b=createHash('sha256').update(expected).digest();
 return a.length===b.length&&timingSafeEqual(a,b);
}

export function isAdminRequest(req:NextRequest|Request){
 const expected=process.env.ADMIN_PASSWORD;
 if(!expected)return false;
 const cookie=req.headers.get('cookie')||'';
 const token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length+1);
 return token===adminToken(expected);
}

export function requireAdmin(req:NextRequest|Request){
 return isAdminRequest(req)?null:NextResponse.json({ok:false,error:'กรุณาเข้าสู่ระบบผู้ดูแล'},{status:401});
}
