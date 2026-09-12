const DEFAULT_API_ORIGIN = 'http://localhost:3001';
const DEFAULT_HOTEL_WS_PATH = '/ws/hotel';
const DEFAULT_CALLS_WS_PATH = '/calls';

function readEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function ensureLeadingSlash(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function toUrl(candidate: string, defaultProtocol: 'http:' | 'ws:'): URL {
  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate);
  return new URL(hasProtocol ? candidate : `${defaultProtocol}//${candidate}`);
}

function normalizeApiOrigin(candidate: string): string {
  const url = toUrl(candidate, 'http:');
  if (url.protocol === 'ws:') {
    url.protocol = 'http:';
  } else if (url.protocol === 'wss:') {
    url.protocol = 'https:';
  }

  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function normalizeSocketBase(candidate: string): URL {
  const url = toUrl(candidate, 'ws:');
  if (url.protocol === 'http:') {
    url.protocol = 'ws:';
  } else if (url.protocol === 'https:') {
    url.protocol = 'wss:';
  }

  url.search = '';
  url.hash = '';
  return url;
}

function withPath(baseUrl: URL, pathname: string): string {
  const url = new URL(baseUrl.toString());
  url.pathname = pathname;
  url.search = '';
  url.hash = '';
  return url.toString();
}

const explicitPublicBase = readEnv(process.env.EXPO_PUBLIC_PUBLIC_BASE_URL);
const explicitApiUrl = readEnv(process.env.EXPO_PUBLIC_API_URL);
const legacySocketUrl = readEnv(process.env.EXPO_PUBLIC_WS_URL);
const explicitHotelSocketUrl = readEnv(process.env.EXPO_PUBLIC_HOTEL_WS_URL);

const resolvedApiBase = normalizeApiOrigin(
  explicitApiUrl ?? explicitPublicBase ?? legacySocketUrl ?? DEFAULT_API_ORIGIN,
);

const socketBaseCandidate =
  explicitHotelSocketUrl ?? legacySocketUrl ?? explicitPublicBase ?? explicitApiUrl ?? DEFAULT_API_ORIGIN;

const resolvedSocketBase = normalizeSocketBase(socketBaseCandidate);
const hotelSocketPath =
  explicitHotelSocketUrl && normalizeSocketBase(explicitHotelSocketUrl).pathname !== '/'
    ? ensureLeadingSlash(normalizeSocketBase(explicitHotelSocketUrl).pathname)
    : DEFAULT_HOTEL_WS_PATH;

export const API_BASE_URL = resolvedApiBase;
export const HOTEL_WS_URL = withPath(resolvedSocketBase, hotelSocketPath);
export const DEFAULT_CALL_SOCKET_PATH = DEFAULT_CALLS_WS_PATH;

export function buildCallSocketUrl(callServerUrl: string, callToken: string): string {
  const url = normalizeSocketBase(callServerUrl);
  if (url.pathname === '/' || !url.pathname) {
    url.pathname = DEFAULT_CALLS_WS_PATH;
  }
  url.searchParams.set('token', callToken);
  return url.toString();
}
