export const config = { runtime: 'edge' };

const GAME = `MOKU GRAND ARENA S1: Deposits>#Kills in scoring. STRIKER(67/100,51.4%WR,1086dep) BRUISER(7/100,65.6%WR,562elim) FORWARD(8/100,58.8%WR) GRINDER(9/100) SPRINTER(6/100). Train Speed+Fortitude for Strikers. avgScore>400=elite. Season Feb20-May23 2026, 220 Champions, $1.2M pool. Stats: STR/SPD/DEF/DEX/FRT.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, {status:204, headers:cors()});
  try {
    const body = await req.json();
    const q = body.question || body.prompt || '';
    if (!q) return json({error:'Missing question'},400);
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
        body: JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,system:'You are MokiArena AI, expert Grand Arena strategist.\\n'+GAME,messages:[{role:'user',content:(body.context||'')+' '+q}]})
      });
      if(r.ok){const d=await r.json();return json({response:(d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n'),source:'claude-ai'});}
    }
    return json({response:genAI(q),source:'built-in-ai'});
  } catch(e){return json({error:e.message},500);}
}
function genAI(q){const l=q.toLowerCase();if(l.includes('meta')||l.includes('class')||l.includes('strategy'))return '⚔️ META ANALYSIS\n\nStrikers dominate (67/100) - deposits > kills in scoring. Bruisers have HIGHEST win rate (65.6%) with elimination focus.\n\nTop picks:\n• Moki #343 (Striker, 419avg, 56.9%WR) - #1 Overall\n• Moki #2179 (Bruiser, 68%WR) - Highest Win Rate\n• Moki #3375 (Forward, 61.4%WR) - Best Hybrid\n\n💡 Train Speed+Fortitude for Strikers. avgScore>400 = elite tier.';if(l.includes('winning')||l.includes('condition')||l.includes('score')||l.includes('how'))return '🏆 WINNING CONDITIONS\n\n1. DEPOSITS = carry Warts to zone. HIGHEST scoring.\n2. ELIMINATIONS = knock out opponents. Worth 3-4x LESS.\n3. WART DISTANCE = bonus points.\n\n⚡ Why Strikers dominate: Speed = faster deposits. Moki #343: 1,133 deposits, 38 elims, #1 overall!\nBruisers WIN more (65.6%WR) but SCORE less (kills < deposits).';if(l.includes('train')||l.includes('stat'))return '🏋️ TRAINING GUIDE\n\nStrikers: Speed→Fortitude→skip STR/DEF\nBruisers: Strength→Defense→Speed\nForwards: Speed+Fortitude+some STR\n\n💎 Train stats WITHOUT class bonus (+225) to balance. Train at train.grandarena.gg';if(l.includes('contest')||l.includes('lineup')||l.includes('pick'))return '🎯 BEST LINEUP (4 Champions + 1 Scheme)\n\n1. Moki #343 — 419avg, 56.9%WR (Striker) 🥇\n2. Aura #7324 — 416avg (Striker) 🥈\n3. Moki #1361 — 417avg (Striker) 🥉\n4. Moki #2179 — 406avg, 68%WR (Bruiser)\n5. Moki #3375 — 403avg, 61.4%WR (Forward)\n\nStart with 200-gem 50/50 contests (top half wins).';return '🤖 MOKIARENA AI\n\n#1 Regular: Moki #343 (100,925 mXP, Striker)\n#1 Champion: PNLS (334,935 mXP, Defender)\nDominant: Striker (67%). Highest WR: Bruiser (65.6%)\n\nAsk: "meta analysis", "winning conditions", "training guide", "contest lineup"';}
function json(o,s=200){return new Response(JSON.stringify(o),{status:s,headers:{...cors(),'Content-Type':'application/json'}});}
function cors(){return{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'POST,OPTIONS'};}
