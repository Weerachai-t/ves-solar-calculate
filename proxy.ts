import {NextRequest,NextResponse} from 'next/server';
import {ADMIN_COOKIE,adminToken} from '@/lib/admin-auth';
export function proxy(req:NextRequest){const path=req.nextUrl.pathname;if(path==='/admin/login'||path.startsWith('/api/admin/login'))return NextResponse.next();if(path.startsWith('/admin')){const expected=process.env.ADMIN_PASSWORD;if(!expected)return NextResponse.redirect(new URL('/admin/login',req.url));if(req.cookies.get(ADMIN_COOKIE)?.value!==adminToken(expected))return NextResponse.redirect(new URL('/admin/login',req.url));}return NextResponse.next()}
export const config={matcher:['/admin/:path*']};
