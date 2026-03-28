export const config = { runtime: 'edge' };

// Pre-computed game intelligence from scraped API data
const GAME_CONTEXT = `
MOKU GRAND ARENA SEASON 1 - GAME INTELLIGENCE:

SCORING: Moki Mayhem mode. Score = deposits + eliminations + wart distance. Deposits give most points.

CLASS META ANALYSIS (from top 100 Regulars):
- STRIKER (67/100): Most common. 51.4% avg win rate. Avg 1,086 deposits, 54 elims. Speed+Fortitude focused. Best for deposit rushing. Top: Moki #343 (100,925 mXP).
- BRUISER (7/100): HIGHEST win rate 65.6%! Only 32 deposits but 562 elims. Strength+Defense focused. Elimination machines but lower scores. Top: Moki #2179 (97,795 mXP).
- FORWARD (8/100): Balanced. 58.8% win rate. 441 deposits, 348 elims. Good all-rounders. Top: Moki #3375 (97,005 mXP).
- GRINDER (9/100): 54.4% win rate. 954 deposits, 104 elims. Balanced deposit strategy. Top: Moki #8301.
- SPRINTER (6/100): 51.4% win rate. 1,094 deposits, 47 elims. Pure speed deposit runners. Top: Moki #6697.
- CENTER (2/100): Rare. Balanced stats with high class bonuses (+225 to multiple stats).
- FLANKER (1/100): Rare. Dexterity focused.

WINNING STRATEGY:
1. Strikers dominate because DEPOSITS score more than KILLS
2. Train SPEED and FORTITUDE for deposit rushing (Striker/Sprinter meta)
3. Bruisers have highest WIN RATE but lower total score (kills worth less)
4. For contests: pick high-avgScore Mokis (400+ is elite)
5. Win% above 55% is strong, above 60% is elite
6. avgDeposits above 4.5 per match is top tier
7. Byes = free wins, but no score

SEASON INFO: Feb 20 - May 23, 2026. 220 Champion Slots. $1.2M+ prize pool.
Prize splits: 60 Weekly Top 5, 33 End-Season mXP, 27 1-of-1, 40 Events.

STATS: Each Moki has 5 stats: Strength, Speed, Defense, Dexterity, Fortitude.
Each stat = base + training + class bonus. Train at train.grandarena.gg.
Speed = faster deposit runs. Fortitude = survive longer. Strength = hit harder. Defense = take less damage. Dexterity = special ability.
`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  try {
    const body = await req.json();
    const question = body.question || body.prompt || '';
    const extraContext = body.context || '';

    if (!question) {
      return json({ error: 'Missing question field' }, 400);
    }

    // Try Anthropic API with env key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (apiKey) {
      // Real AI call
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: 'You are MokiArena AI, an expert Moku Grand Arena strategist. You have complete Season 1 data and deep understanding of game mechanics. Be concise, tactical, and actionable. Use specific player names and stats. Format with clear sections.\n\n' + GAME_CONTEXT,
          messages: [{ role: 'user', content: (extraContext ? extraContext + '\n\n' : '') + question }],
        }),
      });

      if (r.ok) {
        const d = await r.json();
        const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
        return json({ response: text, source: 'claude-ai' });
      }
    }

    // Fallback: pre-computed AI insights
    const insights = generateInsight(question);
    return json({ response: insights, source: 'built-in-ai' });

  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function generateInsight(q) {
  const ql = q.toLowerCase();
  
  if (ql.includes('meta') || ql.includes('strategy') || ql.includes('best class')) {
    return `⚔️ CURRENT META ANALYSIS (Season 1)

📊 CLASS DOMINANCE:
• Striker: 67% of top 100. The deposit-rushing meta. Train Speed + Fortitude.
• Bruiser: Only 7% of top 100 BUT highest win rate (65.6%). Elimination focused.
• Forward: 8% - balanced hybrid. Good win rate (58.8%).
• Grinder: 9% - consistent deposit gatherers.
• Sprinter: 6% - pure speed, similar to Striker but faster.

🏆 KEY INSIGHT:
The scoring system heavily rewards DEPOSITS over KILLS. That's why Strikers dominate despite only 51.4% win rate. Bruisers WIN more but SCORE less.

💡 OPTIMAL STRATEGY:
1. For climbing leaderboard: Train a Striker. Focus Speed + Fortitude.
2. For contests: Pick Mokis with avgScore > 400 and winPct > 55%.
3. Dark horse: Forwards have best risk/reward ratio (58.8% win, balanced scoring).
4. The #1 player Moki #343 has 56.9% win rate, 4.7 avg deposits, 419 avg score.`;
  }
  
  if (ql.includes('train') || ql.includes('stat')) {
    return `🏋️ TRAINING PRIORITY GUIDE

FOR STRIKERS (Best for climbing):
1. Speed (priority) — faster deposit runs = more deposits per match
2. Fortitude — survive longer = more time to deposit
3. Dexterity — secondary, helps with special moves
4. Skip Defense/Strength — you're not fighting, you're running

FOR BRUISERS (Best for winning):
1. Strength — hit harder, eliminate faster
2. Defense — survive fights
3. Speed — chase down targets
4. Fortitude — stay alive

💡 PRO TIP: Check your class bonus (+225). Train the stat that DOESN'T have a class bonus to round out your Moki. A Center gets +225 to STR/SPD/DEF/FRT, so train Dexterity.`;
  }
  
  if (ql.includes('contest') || ql.includes('lineup')) {
    return `🎯 CONTEST STRATEGY

LINEUP BUILDING:
• Each contest requires 4 Champion cards + 1 Scheme card
• Pick Mokis with highest avgScore (400+ is elite)
• 50/50 contests: top half wins. Safer bet.
• Prize splits vary by contest type

TOP PICKS FOR LINEUPS:
1. Moki #343 — 419 avg, 56.9% win (Striker)
2. Moki #1361 — 417 avg, 56.4% win (Striker)
3. Aura (#7324) — 417 avg, 51.7% win (Striker)
4. Moki #2179 — 406 avg, 68% win (Bruiser, highest WR!)
5. Moki #3375 — 403 avg, 61.4% win (Forward)

💎 GEM MANAGEMENT:
• Start with 200-gem 50/50 contests (lower risk)
• Only enter 400+ gem contests if you have strong lineups
• Track your ROI per contest type`;
  }
  
  if (ql.includes('winning') || ql.includes('win') || ql.includes('condition')) {
    return `🏆 WINNING CONDITIONS

HOW MOKI MAYHEM SCORING WORKS:
1. DEPOSITS = carry Warts to deposit zone. Each deposit = points. HIGHEST value action.
2. ELIMINATIONS = knock out opponent Mokis. Worth less than deposits.
3. WART DISTANCE = total distance carried with Warts. Bonus points.
4. WINS = winning team gets bonus but losing team still scores.

WHY STRIKERS DOMINATE:
• 1 deposit ≈ worth 3-4 eliminations in score
• Speed stat = faster Wart carrying = more deposits
• Fortitude = survive while carrying = complete more deposits
• Top Striker Moki #343: 1,133 total deposits, only 38 elims, but #1 overall!

COUNTER-META (BRUISER):
• Bruisers have 65.6% win rate (vs Striker's 51.4%)
• They WIN matches by eliminating Strikers carrying Warts
• But they SCORE less because kills < deposits
• Best for 50/50 contests where only winning matters`;
  }
  
  return `🤖 MOKIARENA AI — Quick Analysis

Based on your question, here's what I know from Season 1 data:

📊 CURRENT STANDINGS:
• #1 Regular: Moki #343 (100,925 mXP, Striker)
• #1 Champion: PNLS (334,935 mXP, Defender)
• Dominant class: Striker (67% of top 100)
• Highest win rate class: Bruiser (65.6%)

💡 To get a more specific analysis, try asking:
• "What's the current meta?"
• "Best training strategy for my Moki"
• "Which contests should I enter?"
• "How do winning conditions work?"
• "Analyze the top players"

To enable full Claude AI responses, add your ANTHROPIC_API_KEY to Vercel Environment Variables in project settings.`;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors(), 'Content-Type': 'application/json' },
  });
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
