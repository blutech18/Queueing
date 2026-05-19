const FILE_PROTOCOL_MESSAGE =
  'This page must be served over HTTP. Run "npm run local", then open http://localhost:3000/ (not the .html file from disk).';

async function apiFetch(url, options = {}) {
  if (window.location.protocol === 'file:') {
    throw new Error(FILE_PROTOCOL_MESSAGE);
  }

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
