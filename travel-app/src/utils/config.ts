const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  // Auto-detect when running hosted on Vercel or any non-localhost domain
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1")
  ) {
    return "https://trip-planner-1-zl3c.onrender.com";
  }
  return "http://127.0.0.1:5000";
};

export const API_BASE_URL = getApiBaseUrl();
