export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1"))
  ) {
    return "http://127.0.0.1:5000";
  }
  return "https://trip-planner-1-zl3c.onrender.com";
};

export const API_BASE_URL = getApiBaseUrl();
