export function validateCsrf(request: Request): boolean {
  const origin = request.headers.get('origin');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!origin || !appUrl) {
    return false;
  }

  try {
    const originHost = new URL(origin).host;
    const appHost = new URL(appUrl).host;
    return originHost === appHost;
  } catch {
    return false;
  }
}
