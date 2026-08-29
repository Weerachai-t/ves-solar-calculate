import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'crypto';
export function proxy(req:NextRequest){const path=req.nextUrl.pathname;if(path==='/admin/login'||path.startsWith('/api/admin/login'))return NextResponse.next();if(path.startsWith('/admin')){const expected=process.env.ADMIN_PASSWORD;if(!expected)return NextResponse.redirect(new URL('/admin/login',req.url));const token=createHash('sha256').update(`ves-admin:${expected}`).digest('hex');if(req.cookies.get('ves_admin')?.value!==token)return NextResponse.redirect(new URL('/admin/login',req.url));}return NextResponse.next()}
export const config={matcher:['/admin/:path*']};
