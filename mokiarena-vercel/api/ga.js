export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS' } });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  if (!path) return new Response(JSON.stringify({error:'path param required'}), {status:400, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});

  let targetUrl;
  const headers = { 'Accept': 'application/json' };

  if (path.startsWith('__skymavis__')) {
    // Sky Mavis NFT API
    const smPath = path.replace('__skymavis__', '');
    targetUrl = 'https://api-gateway.skymavis.com/skynet/ronin/web3/v2' + smPath;
  } else {
    // Grand Arena API
    targetUrl = 'https://api.grandarena.gg' + path;
    headers['x-api-key'] = 'ga_142f0d37df0d92a0b79939f7473e6108359b6962d0bfb4c0';
  }

  try {
    const r = await fetch(targetUrl, { headers });
    const data = await r.text();
    return new Response(data, {
      status: r.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch(e) {
    return new Response(JSON.stringify({error:e.message}), {status:502, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
}
