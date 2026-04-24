/**
 * GymApp — Cloudflare Pages Function
 * Route: /api/ai
 * Proxy seguro para OpenAI API
 * 
 * Endpoints:
 *   POST /api/ai  { action: 'vision', imageBase64, mimeType }
 *   POST /api/ai  { action: 'coach', profile, logs, workouts, settings }
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const OPENAI_KEY = env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers }); }

  const { action } = body;

  // ── AI VISION: identify gym machines from photo ──────────────────────────
  if (action === 'vision') {
    const { imageBase64, mimeType = 'image/jpeg' } = body;
    if (!imageBase64) return new Response(JSON.stringify({ error: 'No image' }), { status: 400, headers });

    const prompt = `You are a gym equipment expert. Analyze this gym photo and identify all visible exercise machines and equipment.

Return ONLY a JSON array of machine names, using these exact names when possible:
- Precor Pulldown 304, Genesis Lat, Precor Low Row, Precor Seated Row, Genesis Dual Cable
- Genesis Chin / Dip Assist, Genesis Multiplane Chest, Dumbbell Bench Press
- Genesis Multiplane Shoulder, Genesis Biceps, Genesis Biceps Preacher
- Genesis Triceps, Genesis Triceps Seated, Leg Extension, Leg Curl, Prone Leg Curl
- Genesis Total Quad / Hip, Genesis Total Glute / Ham, Inner Thigh, Outer Thigh
- Genesis Multiplane Calf, Decline Sit-up
- Life Fitness Lat Pulldown, Life Fitness Seated Row, Life Fitness Chest Press
- Life Fitness Shoulder Press, Life Fitness Leg Press, Life Fitness Leg Extension
- Life Fitness Leg Curl, Life Fitness Calf Raise, Life Fitness Cable Crossover
- Hammer Strength Lat Pulldown, Hammer Strength Seated Row, Hammer Strength Chest Press
- Hammer Strength Shoulder Press, Hammer Strength Leg Press, Hammer Strength Leg Curl
- Technogym Lat Machine, Technogym Chest Press, Technogym Leg Press
- Matrix Lat Pulldown, Matrix Chest Press, Matrix Leg Press
- Cybex Lat Pulldown, Cybex Chest Press, Cybex Leg Press
- Cable Machine, Smith Machine, Barbell Rack, Dumbbell Rack, Bench Press, Squat Rack

If a machine doesn't match any known name, use a descriptive name like "Cable Crossover Machine".
Return format: ["Machine Name 1", "Machine Name 2", ...]
Return ONLY the JSON array, no other text.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'low' } }
          ]
        }]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', detail: err }), { status: 502, headers });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '[]';
    let machines = [];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      machines = JSON.parse(match ? match[0] : text);
    } catch { machines = []; }

    return new Response(JSON.stringify({ machines }), { headers });
  }

  // ── AI COACH: analyze history and suggest weight adjustments ─────────────
  if (action === 'coach') {
    const { profile, logs = [], workouts = {}, settings = {} } = body;

    // Build compact context — last 30 days of logs + comments
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const recentLogs = logs
      .filter(l => new Date(l.date) >= cutoff)
      .slice(-20); // max 20 sessions

    const comments = recentLogs
      .filter(l => l.comment)
      .map(l => `${l.date.slice(0,10)}: "${l.comment}"`)
      .join('\n');

    // Build exercise performance summary
    const perfMap = {};
    recentLogs.forEach(log => {
      (log.exercises || []).forEach(ex => {
        if (!ex.reps || ex.reps.length === 0 || ex.skipped) return;
        if (!perfMap[ex.name]) perfMap[ex.name] = { sessions: [], weight: ex.weight };
        const avg = ex.reps.reduce((a,b)=>a+b,0) / ex.reps.length;
        perfMap[ex.name].sessions.push({ date: log.date.slice(0,10), reps: ex.reps, avg: Math.round(avg*10)/10, weight: ex.weight });
        perfMap[ex.name].weight = ex.weight; // latest weight
      });
    });

    const perfSummary = Object.entries(perfMap)
      .map(([name, d]) => {
        const last3 = d.sessions.slice(-3);
        return `${name}: ${dispW_server(d.weight)} lb — last ${last3.length} sessions avg reps: ${last3.map(s=>s.avg).join(', ')}`;
      }).join('\n');

    const prompt = `You are an expert personal trainer AI for GymApp.

USER PROFILE:
- Name: ${profile?.name || 'User'}
- Level: ${profile?.level || 'intermediate'}
- Goal: ${profile?.goal || 'grow'} (maintain=conservative, grow=moderate, build=aggressive)
- Age: ${profile?.age || 30}, Weight: ${profile?.weight || 80}kg
- Notes: ${profile?.sex === 'M' ? 'Male' : 'Female'}

RECENT PERFORMANCE (last 30 days):
${perfSummary || 'No recent data'}

USER COMMENTS:
${comments || 'No comments'}

WEIGHT ADJUSTMENT RULES:
- grow goal: increase weight when avg reps >= 12 (upper) or >= 14 (legs) for 2+ sessions
- build goal: increase after 1 session above threshold
- maintain goal: very conservative, only increase after 3 sessions
- Decrease weight if avg reps < 6 for 2+ sessions
- Never suggest impossible weights — use realistic increments (2.5-5 lb for upper, 5-10 lb for legs)
- Consider user comments: pain/discomfort → reduce or hold; fatigue → hold; great session → can increase

Return a JSON object with this exact structure:
{
  "adjustments": [
    { "exercise": "Exercise Name", "currentWeight": 70, "suggestedWeight": 75, "reason": "Brief reason", "action": "increase" | "decrease" | "hold" }
  ],
  "generalAdvice": "1-2 sentences of overall coaching advice based on comments and performance",
  "focusArea": "muscle group or area to focus on based on analysis"
}

Return ONLY the JSON, no other text.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', detail: err }), { status: 502, headers });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    let result = {};
    try {
      const match = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(match ? match[0] : text);
    } catch { result = { adjustments: [], generalAdvice: text, focusArea: '' }; }

    return new Response(JSON.stringify(result), { headers });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Helper (server-side version of dispW)
function dispW_server(w) {
  if (!w || w === 0) return '0';
  return Number.isInteger(w) ? String(w) : w.toFixed(1).replace(/\.0$/, '');
}
