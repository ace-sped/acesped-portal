import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ALLOWED_HOSTS = [
  'res.cloudinary.com',
  'res-1.cloudinary.com',
  'res-2.cloudinary.com',
  'res-3.cloudinary.com',
  'res-4.cloudinary.com',
  'res-5.cloudinary.com',
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const u = new URL(urlString);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

/** If url is a path (e.g. "73071587/dli/file.pdf"), build full Cloudinary URL. */
function resolveUrl(urlParam: string): string {
  const decoded = decodeURIComponent(urlParam);
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return decoded;
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return urlParam;
  const path = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${path}`;
}

/** PDFs under image/upload often return 502; request via raw/upload instead. */
function toRawPdfUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.includes('/image/upload/') && u.pathname.toLowerCase().endsWith('.pdf')) {
      u.pathname = u.pathname.replace(/\/image\/upload\//, '/raw/upload/');
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

/** Build signed authenticated URL for 401 fallback. Tries both image and raw resource types. */
function getSignedAuthenticatedUrls(cloudinaryUrl: string): string[] {
  const out: string[] = [];
  try {
    const u = new URL(cloudinaryUrl);
    const pathParts = u.pathname.split('/').filter(Boolean);
    if (pathParts.length < 5) return out;
    const cloudName = pathParts[0];
    const pathAfterUpload = pathParts.slice(3).join('/');
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (!secret) return out;
    const toSign = pathAfterUpload + secret;
    const hash = crypto.createHash('sha1').update(toSign).digest();
    const signature = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 8);
    for (const resourceType of ['image', 'raw']) {
      const signedPath = `/${cloudName}/${resourceType}/authenticated/s--${signature}--/${pathAfterUpload}`;
      out.push(`https://${u.host}${signedPath}`);
    }
    return out;
  } catch {
    return out;
  }
}

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/pdf,*/*',
};

async function fetchDocument(url: string, signal: AbortSignal): Promise<Response> {
  return fetch(url, { signal, headers: FETCH_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get('url');
    if (!urlParam || typeof urlParam !== 'string') {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const originalUrl = resolveUrl(urlParam);
    const url = toRawPdfUrl(originalUrl);
    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let res = await fetchDocument(url, controller.signal);
    if (res.status === 404 && url !== originalUrl) {
      clearTimeout(timeout);
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 15000);
      res = await fetchDocument(originalUrl, controller2.signal);
      clearTimeout(timeout2);
    } else {
      clearTimeout(timeout);
    }

    if (res.status === 401) {
      const signedUrls = getSignedAuthenticatedUrls(originalUrl);
      for (const signedUrl of signedUrls) {
        clearTimeout(timeout);
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 15000);
        res = await fetchDocument(signedUrl, controller2.signal);
        clearTimeout(timeout2);
        if (res.ok) break;
      }
    }

    if (!res.ok) {
      console.error('view-document upstream:', res.status, res.url);
      const status = res.status === 404 ? 404 : 502;
      const message =
        res.status === 404
          ? 'Document not found. It may have been removed from Cloudinary or the URL may be incorrect.'
          : `Upstream returned ${res.status}`;
      return NextResponse.json({ error: message }, { status });
    }

    const contentType = res.headers.get('content-type') || 'application/pdf';
    const contentDisposition = res.headers.get('content-disposition') || 'inline';
    const body = res.body;

    if (!body) {
      return NextResponse.json({ error: 'No response body' }, { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', contentDisposition);
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('view-document proxy error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
