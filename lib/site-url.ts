const DEFAULT_SITE_URL = "https://www.montramontijo.pt";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!configuredUrl) {
    return DEFAULT_SITE_URL;
  }

  try {
    const url = new URL(configuredUrl);

    if (
      process.env.NODE_ENV === "production" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      return DEFAULT_SITE_URL;
    }

    if (url.hostname === "montramontijo.pt") {
      url.hostname = "www.montramontijo.pt";
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}
