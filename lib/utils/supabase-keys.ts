interface JwtPayload {
  iss?: string;
  ref?: string;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  const payloadSegment = parts[1];
  if (!payloadSegment) {
    return null;
  }

  const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

  try {
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === 'object') {
      const payload = parsed as JwtPayload;
      return payload;
    }
  } catch {
    return null;
  }

  return null;
}

function getProjectRefFromUrl(value: string): string | null {
  try {
    const host = new URL(value).hostname;
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

function getProjectRefFromJwt(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  if (typeof payload.ref === 'string' && payload.ref.length > 0) {
    return payload.ref;
  }

  if (typeof payload.iss === 'string' && payload.iss.length > 0) {
    return getProjectRefFromUrl(payload.iss);
  }

  return null;
}

export function assertSupabaseKeyMatchesUrl(url: string, key: string, label: string): void {
  const urlRef = getProjectRefFromUrl(url);
  const keyRef = getProjectRefFromJwt(key);

  if (urlRef && keyRef && urlRef !== keyRef) {
    throw new Error(
      `${label} does not match the Supabase project URL. Use keys from the same project.`,
    );
  }
}
