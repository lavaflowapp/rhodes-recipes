export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Try ANTHROPIC_API_KEY first, fall back to VITE_ prefixed version
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  console.log('[anthropic proxy] key present:', !!apiKey);
  console.log('[anthropic proxy] key prefix:', apiKey ? apiKey.substring(0, 12) + '...' : 'NONE');
  console.log('[anthropic proxy] key length:', apiKey ? apiKey.length : 0);

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured — neither ANTHROPIC_API_KEY nor VITE_ANTHROPIC_API_KEY found' });
  }

  try {
    const body = JSON.stringify(req.body);
    console.log('[anthropic proxy] sending request, model:', req.body?.model);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body
    });

    const data = await response.json();
    console.log('[anthropic proxy] response status:', response.status);

    if (!response.ok) {
      console.log('[anthropic proxy] error response:', JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error('[anthropic proxy] exception:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
