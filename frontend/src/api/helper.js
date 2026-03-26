const BASE_URL = "http://localhost:8000";

export async function apiFetch(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data;

  try {
    data = await res.json();
  } catch (error) {
    data = null;
  }

  // Throw error or return data
  if (!res.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}