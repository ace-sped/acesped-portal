import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const normalizeRoleKey = (role: string) =>
  role.trim().replace(/[\s-]+/g, '_').replace(/_+/g, '_').toUpperCase();

const canonicalRoleMap: Record<string, string> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CENTER_LEADER: 'Center_Leader',
  DEPUTY_CENTER_LEADER: 'Deputy_Center_Leader',
  CENTER_SECRETARY: 'Center_Secretary',
  ACADEMIC_PROGRAM_COORDINATOR: 'Academic_Program_Coordinator',
  APPLIED_RESEARCH_COORDINATOR: 'Applied_Research_Coordinator',
  HEAD_OF_PROGRAM: 'Head_of_Program',
  CO_HEAD_OF_PROGRAM: 'Co_Head_of_Program',
  LECTURER: 'Lecturer',
  PG_REP: 'PG_Rep',
  STAFF: 'Staff',
  HEAD_OF_FINANCE: 'Head_of_Finance',
  INDUSTRIAL_LIAISON_OFFICER: 'Industrial_Liaison_Officer',
  ICT: 'ICT',
  MONITORING_AND_EVALUATION_OFFICER: 'Monitoring_and_Evaluation_Officer',
};

// Role to route mapping
const roleToRoute: { [key: string]: string } = {
  'SUPER_ADMIN': '/admin',
  'Center_Leader': '/center-leader',
  'Deputy_Center_Leader': '/deputy-center-leader',
  'Center_Secretary': '/center-secretary',
  'Academic_Program_Coordinator': '/academic-program-coordinator',
  'Applied_Research_Coordinator': '/applied-research-coordinator',
  'Head_of_Program': '/head-of-program',
  'Co_Head_of_Program': '/co-head-of-program',
  'Lecturer': '/lecturer',
  'PG_Rep': '/pg-rep',
  'Staff': '/staff',
  'Head_of_Finance': '/head-of-finance',
  'Industrial_Liaison_Officer': '/industrial-liaison-officer',
  'ICT': '/ict',
  'Monitoring_and_Evaluation_Officer': '/monitoring-and-evaluation-officer',
};

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/center-leader',
  '/center-secretary',
  '/deputy-center-leader',
  '/academic-program-coordinator',
  '/applied-research-coordinator',
  '/head-of-program',
  '/co-head-of-program',
  '/lecturer',
  '/pg-rep',
  '/staff',
  '/head-of-finance',
  '/industrial-liaison-officer',
  '/ict',
  '/monitoring-and-evaluation-officer',
];

// This middleware protects dashboard routes
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a protected dashboard route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;
      const canonicalRole = canonicalRoleMap[normalizeRoleKey(userRole)];

      // Check role-based access
      if (pathname.startsWith('/admin')) {
        // SUPER_ADMIN can access all admin routes; Deputy_Center_Leader can access admission-exercise only
        const canAccess =
          canonicalRole === 'SUPER_ADMIN' ||
          (pathname.startsWith('/admin/admission-exercise') && canonicalRole === 'Deputy_Center_Leader');
        if (!canAccess) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } else if (pathname.startsWith('/center-leader')) {
        // Only Center Leader can access center-leader routes (Deputy has their own route)
        if (canonicalRole !== 'Center_Leader') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } else {
        // For other routes, check if user's role matches the route
        const expectedRoute = canonicalRole ? roleToRoute[canonicalRole] : undefined;
        if (expectedRoute) {
          // If user is on a route that doesn't match their role, redirect them
          if (!pathname.startsWith(expectedRoute)) {
            return NextResponse.redirect(new URL(expectedRoute, request.url));
          }
        } else {
          // Unknown role, redirect to unauthorized
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // Token is valid and user has appropriate role
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired, redirect to login
      console.error('Token verification failed:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/center-leader/:path*',
    '/center-secretary/:path*',
    '/deputy-center-leader/:path*',
    '/academic-program-coordinator/:path*',
    '/applied-research-coordinator/:path*',
    '/head-of-program/:path*',
    '/co-head-of-program/:path*',
    '/lecturer/:path*',
    '/pg-rep/:path*',
    '/staff/:path*',
    '/head-of-finance/:path*',
    '/industrial-liaison-officer/:path*',
    '/ict/:path*',
    '/monitoring-and-evaluation-officer/:path*',
  ],
};
