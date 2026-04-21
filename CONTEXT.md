# GymApp — Context Window

## Quem é o usuário
- Rafael, brasileiro, mora nos EUA
- Duas empresas: **Atendro AI** (consultoria AI) e **nova empresa sem nome** (apps AI para consumidores)
- GymApp é o produto principal da nova empresa
- Modelo: hardware DIY (ESP32 + acelerômetro, ~$15 custo, vender $49) + app ($5/mês ou grátis com hardware)
- Público-alvo: EUA + Brasil + Latam → app em PT/EN/ES

---

## Stack
- **Frontend:** HTML + CSS + JS vanilla — **TUDO em um único arquivo: `public/index.html`**
- **Deploy:** Cloudflare Pages (não Workers)
- **Repo:** `rafaraujo10-dev/gym-app`
- **URL live:** `https://gym-app-8ea.pages.dev/`
- **Deploy:** `git push` → Cloudflare atualiza em ~1 min
- **Sem framework, sem build step**

## Estrutura
```
gym-app/
├── public/
│   ├── index.html   ← TODO o app está aqui (~1890 linhas)
│   └── manifest.json
├── wrangler.toml
└── package.json
```

---

## Estado atual do app (último commit: b490cde)

### Funcionalidades implementadas

**Onboarding (6 passos)**
1. Nome + altura + peso + idade + sexo + unidade (lb/kg) + idioma (PT/EN/ES)
2. Nível (Dia 1 / Iniciante / Intermediário / Avançado) + Objetivo (Manter/Crescer/Bodybuilding) + Foco (Full/Upper/Lower)
3. Agenda — dias da semana, cada dia recebe letra A/B/C/D/E
4. Academia — EM BREVE (foto/vídeo), seleção manual, lista padrão Genesis+Precor, ou por marca (Genesis/Precor/Free)
5. Preview dos pesos estimados
6. Confirmação → Disclaimer de segurança → Dashboard

**Dashboard (aba Inicio)**
- Card do treino de hoje → clica → abre **Summary** (lista exercícios + pesos) → clica "Vamos lá!" → inicia treino
- Botão "Escolher treino diferente" → modal A/B/C/D/E (também abre summary antes de iniciar)
- Stats: Streak (calculado corretamente pelo plano) + treinos na semana
- Barra da semana com checkmark nos dias já treinados
- Aviso de retorno se >7 dias sem treinar (banner amarelo)
- Último treino com link para detalhe

**Tela de Treino**
- Peso do exercício em destaque (lime, grande) — **clicável para editar inline sem sair do treino**
- Progresso no topo (barra + X/Y)
- Botão ☰ abre lista de todos exercícios → pode pular para qualquer um
- 3 séries por exercício, tap para registrar reps
- Grid de reps rápidas (6,8,10,12,14,15,16,18,20,25) + input manual
- Tap em série concluída → editar
- **Botão "Deletar" em cada série registrada**
- Botão "Auto" → contador automático por acelerômetro (DeviceMotion API)
- **Botão "Encerrar treino agora"** com confirmação (a qualquer momento)
- Aviso de cautela para ombro (Max 90°) e ACL
- Ao finalizar: ajuste automático de pesos baseado nas reps

**Aba Pesos**
- Lista todos exercícios por treino (A/B/C...)
- Peso em destaque (lime, grande) → sheet para editar (input + bumps ±2.5/±5 em lb, ±1/±2.5 em kg)
- Botão `i` → sheet com instruções de execução
- Badge "Subir ↑" quando progressão indica aumento

**Aba Histórico**
- Lista dos últimos 30 treinos
- Tap → detalhe com todos exercícios, pesos e reps de cada série

**Perfil**
- Editar nome, altura, peso, idade, foco, objetivo
- Escolher unidade (lb/kg) e idioma (PT/EN/ES)
- Editar agenda de dias
- Resetar pesos para estimativa inicial
- Apagar tudo

**Contador automático de reps (DeviceMotion)**
- Detecção de ciclo completo (ida + volta = 1 rep)
- Thresholds calibrados por altura (comprimento do braço estimado)
- Perfis por exercício: curl / press / pull / leg / core
- Cooldown entre reps para evitar dupla contagem
- Barra de sinal em tempo real

**Lógica de progressão (por objetivo)**
- `maintain`: precisa de 2 sessões acima do threshold para subir
- `grow` (padrão): precisa de 2 sessões acima do threshold
- `build`: 1 sessão já sobe o peso
- Upper: threshold 12 reps (2ª e 3ª série)
- Legs: threshold 14 reps
- Ajuste automático após primeira sessão baseado nas reps

**Streak**
- Calculado por `calcStreak(logs, schedMap)` — conta dias do plano completados consecutivamente
- Não zera em dia de descanso
- Não conta 2 treinos no mesmo dia como 2

**I18n**
- Objeto `LANGS` com `pt`, `en`, `es` — todas as strings do app
- `T()` retorna o objeto do idioma atual
- `S.lang()` lê de `localStorage ga_lang`

**Unidades**
- `S.unit()` retorna `'lb'` ou `'kg'` de `localStorage ga_unit`
- `toDisplay(w)` converte lb→kg para exibição
- `fromDisplay(w)` converte kg→lb para armazenar
- `dispW(w)` formata o número
- Todos os pesos são armazenados internamente em **lb**

---

## Dados do Rafael (pesos reais, treino 3x/semana)
- Treina Seg/Qua/Sex, full body, treinos A/B/C
- Academia com equipamentos Genesis (Freemotion) + Precor
- Histórico de ACL no joelho → progressão conservadora em pernas
- Ombro direito clica abaixo de 90° → Genesis Multiplane Shoulder limitado

**Treino C (pesos atuais):**
- Genesis Lat — 70 lb
- Precor Pulldown 304 — 70 lb
- Precor Seated Row — 60 lb
- Genesis Total Quad / Hip — 17.5 lb
- Genesis Total Glute / Ham — 20 lb
- Genesis Multiplane Shoulder — 25 lb (Max 90°)
- Genesis Biceps — 20 lb
- Genesis Triceps — 30 lb
- Genesis Multiplane Calf — 180 lb
- Genesis Dual Cable — 17 lb
- Decline Sit-up — corpo

---

## Variáveis CSS principais
```
--bg:#0c0c0e  --surface:#141416  --surface2:#1c1c1f  --surface3:#242428
--border:#2a2a2e  --border-strong:#3a3a3f
--text:#f0f0f2  --text2:#a0a0a8  --text3:#606068
--lime:#c8f135  --lime-dim:#1e2a06  --lime-border:#3a5010
--amber:#f5a623  --amber-dim:#2a1e06
--red:#e05252  --red-dim:#2a0a0a
```

## Classes CSS principais
```
.btn .btn-primary .btn-ghost .btn-danger
.card .card-sm .card-inset
.badge .badge-lime .badge-amber .badge-neutral
.set-row .set-row.done .set-row.active
.rep-grid .rep-btn
.prog-bar .prog-fill
.overlay .sheet .sheet-handle
.ob-step .day-cell .sel-opt
.hero-card .stat-box .label .bnav .bnav-btn
```

## localStorage keys
```
ga_user     → {name, height, weight, age, sex, level, focus, goal, trainDays, schedule, sessionTime, onboardedAt}
ga_logs     → [{date (ISO), workout (A/B/C), exercises: [{name, weight, unit, reps:[]}]}]
ga_workouts → {A:[{name, weight, unit, type, group, caution}], B:[...], C:[...]}
ga_streak   → number (recalculado via calcStreak após cada treino)
ga_lang     → 'pt' | 'en' | 'es'
ga_unit     → 'lb' | 'kg'
```

---

## Próximas features discutidas (não implementadas)
1. **Hardware BLE** — ESP32 + MPU6050 no punho, conecta via Web Bluetooth API
2. **Reconhecimento de máquinas por foto/vídeo** — AI via OpenAI Vision (botão "EM BREVE" já existe no onboarding)
3. **AI Coach** — análise de progressão via OpenAI
4. **Tornozeleira** — segundo sensor para exercícios de perna
5. **Landing page** da nova empresa

## Bugs conhecidos / pendências menores
- [ ] Contador automático ainda pode ser impreciso — precisa de teste real na academia
- [ ] Foto/vídeo para reconhecer máquinas — não implementado (placeholder existe)
- [ ] Idioma EN/ES: strings de exercícios e instruções ainda em PT (EX_INFO não foi traduzido)

## Como fazer deploy
```bash
# Na pasta gym-app:
git add .
git commit -m "mensagem"
git push
# Cloudflare Pages deploya automaticamente em ~1 min
```
