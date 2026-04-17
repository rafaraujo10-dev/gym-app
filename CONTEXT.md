# GymApp — Context Window para nova sessão

## Quem é o usuário
- Rafael, brasileiro, mora nos EUA
- Construtor de produtos, surfa a onda de AI
- Duas empresas em desenvolvimento:
  - **Atendro AI** — consultoria de AI para empresas
  - **Nova empresa (sem nome ainda)** — vende apps de AI para consumidores
- O GymApp é o produto principal da nova empresa
- Modelo de negócio pensado: hardware DIY (ESP32 + acelerômetro, ~$15 custo, vender por $49) + app ($5/mês ou grátis com hardware)

---

## Stack do projeto
- **Frontend:** HTML + CSS + JS vanilla (single file `public/index.html`)
- **Deploy:** Cloudflare Pages (não Workers)
- **Repo GitHub:** `rafaraujo10-dev/gym-app`
- **URL live:** `https://gym-app-8ea.pages.dev/`
- **Deploy automático:** git push → Cloudflare atualiza em ~1 min
- **Sem framework, sem build step** — tudo em um arquivo

---

## Estrutura do projeto
```
gym-app/
├── public/
│   ├── index.html   ← TODO o app está aqui
│   └── manifest.json
├── wrangler.toml
└── package.json
```

---

## Estado atual do app (o que já foi construído)

### Design
- Dark premium theme (inspirado em Strong / Whoop)
- Paleta: `--bg:#0c0c0e`, `--surface:#141416`, `--lime:#c8f135` (acento principal)
- Zero emojis — SVG icons na nav, texto limpo
- Bottom nav com 4 abas: Inicio / Historico / Pesos / Perfil

### Onboarding (6 passos)
1. Nome + altura + peso + sexo biológico
2. Nível (Iniciante/Intermediário/Avançado) + Foco (Full Body / Upper / Lower)
3. Agenda — seleciona dias da semana, cada dia recebe letra A/B/C/D/E
4. Academia — opção foto/vídeo (EM BREVE), seleção manual de equipamentos, ou lista padrão
5. Preview dos pesos estimados (calculados por peso corporal + nível)
6. Confirmação + lançamento

### Dashboard (aba Inicio)
- Card do treino de hoje com letra grande em lime
- Botão "Escolher treino diferente" → modal com A/B/C/D/E
- Stats: Sequência de dias + treinos na semana
- Barra da semana mostrando dias de treino com letra correta
- Último treino com link para detalhe

### Treino
- Progresso no topo (barra + X/Y)
- Botão ☰ abre lista de todos exercícios → pode pular para qualquer um
- 3 séries por exercício, tap para registrar reps
- Grid de reps rápidas (6,8,10,12,14,15,16,18,20,25) + input manual
- Tap em série concluída → editar
- Botão "Auto" → contador automático por acelerômetro (DeviceMotion API)
- Aviso de cautela para ombro (Max 90°) e ACL
- Ao finalizar: ajuste automático de pesos baseado nas reps

### Aba Pesos
- Lista todos exercícios por treino (A/B/C...)
- Botão do peso → sheet para editar (input grande + bumps de ±2.5/±5)
- Botão `i` → sheet com instruções de execução do exercício
- Badge "Subir ↑" quando progressão indica aumento

### Aba Histórico
- Lista dos últimos 30 treinos
- Tap → detalhe com todos exercícios, pesos e reps de cada série

### Perfil
- Editar nome, altura, peso, foco
- Editar agenda de dias
- Resetar pesos para estimativa inicial
- Apagar tudo

### Contador automático de reps (DeviceMotion)
- Detecção de ciclo completo (ida + volta = 1 rep)
- Thresholds calibrados por altura da pessoa (comprimento do braço estimado)
- Perfis por exercício: curl / press / pull / leg / core
- Cooldown entre reps para evitar dupla contagem
- Barra de sinal em tempo real

### Lógica de progressão
- Analisa últimas 2 sessões do mesmo exercício no mesmo peso
- Upper: 2ª e 3ª série ≥ 12 reps → sugere subir
- Legs: 2ª e 3ª série ≥ 14 reps → sugere subir
- Ajuste automático após primeira sessão baseado nas reps

---

## Treinos do Rafael (dados reais)
- Treina Seg/Qua/Sex (3x/semana), full body
- Academia com equipamentos Genesis (Freemotion) + Precor
- Histórico de ACL no joelho → progressão conservadora em pernas
- Ombro direito clica abaixo de 90° → Genesis Multiplane Shoulder limitado
- Treino A (Seg), B (Qua), C (Sex)

**Treino C (próximo treino):**
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

## Bugs conhecidos / pendências
- [ ] Contador automático ainda pode ser impreciso — precisa de teste real na academia
- [ ] Foto/vídeo para reconhecer máquinas (EM BREVE — não implementado)
- [ ] Botão "i" de info nos exercícios durante o treino tem quote escaping frágil
- [ ] Sessão de pesos foi bugada (div não fechada) — JÁ CORRIGIDO no último commit

---

## Próximas features discutidas (não implementadas)
1. **Hardware BLE** — ESP32 + MPU6050 no punho, conecta via Web Bluetooth API
2. **Reconhecimento de máquinas por foto/vídeo** — AI via OpenAI Vision
3. **AI Coach** — análise de progressão via OpenAI (igual ao ROI Analyzer da Atendro)
4. **Tornozeleira** — segundo sensor para exercícios de perna
5. **Landing page** da nova empresa para vender o app + hardware

---

## Como fazer deploy
```bash
# Na pasta gym-app:
git add .
git commit -m "mensagem"
git push
# Cloudflare Pages deploya automaticamente em ~1 min
```

---

## Variáveis CSS principais
```css
--bg: #0c0c0e
--surface: #141416
--surface2: #1c1c1f
--surface3: #242428
--border: #2a2a2e
--border-strong: #3a3a3f
--text: #f0f0f2
--text2: #a0a0a8
--text3: #606068
--lime: #c8f135        /* acento principal */
--lime-dim: #1e2a06
--lime-border: #3a5010
--amber: #f5a623
--red: #e05252
```

## Classes CSS principais
```
.btn.btn-primary    → fundo lime, texto preto
.btn.btn-secondary  → outlined, borda visível
.btn.btn-ghost      → minimal, borda fina
.card               → surface + border + radius 16px
.card-sm            → card com padding 16px
.badge.badge-lime   → verde
.badge.badge-amber  → laranja
.badge.badge-neutral → cinza
.label              → uppercase, letter-spacing, text3
.set-row            → linha de série no treino
.rep-btn            → botão de rep rápida
.hero-card          → card do treino de hoje
.stat-box           → caixa de estatística
```

---

## Contexto de negócio
- Rafael quer vender o app como produto da nova empresa
- Atendro AI é separada — consultoria, não produto
- O GymApp pode ser o produto âncora da nova empresa
- Modelo: hardware + app subscription
- Público: usuários de academia que querem algo mais inteligente que planilha/ChatGPT
- Diferencial: contador automático de reps + progressão inteligente + sem Apple Watch necessário
