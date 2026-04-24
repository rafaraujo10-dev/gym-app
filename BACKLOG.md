# GymApp — Backlog Completo (Audio Sessions)

## IMPLEMENTÁVEL AGORA (sem backend)

### 1. Sessão em memória — não perder treino ao voltar ao dashboard
- Salvar estado do treino em `ga_active_session` no localStorage ao navegar
- Ao clicar "Iniciar treino": verificar se há sessão salva para aquele workout key
- Se sim: perguntar "Você tem um treino em andamento. Continuar de onde parou?"
- Ao finalizar e submeter: apagar `ga_active_session`
- Ao voltar ao dashboard sem finalizar: manter `ga_active_session`

### 2. Tempo de sessão → número de máquinas (onboarding step 2 ou 3)
- Fórmula: `numMachines = Math.floor(sessionMinutes / 5)`
- 30 min → 6 máquinas, 45 min → 9, 60 min → 11, 75 min → 15
- Opções: 30 / 45 / 60 / 75 / Custom
- Ao lado: slider ou +/- para ajustar número de máquinas manualmente
- Isso substitui o campo `sessionTime` atual

### 3. Adicionar/remover máquina durante o treino
- Botão "..." no header do treino → menu com opções:
  - "Add exercise" → abre lista de máquinas disponíveis para adicionar
  - "Remove this exercise" → remove o atual
- X ao lado de cada exercício na lista (showExList)
- Antes de submeter: summary com opção de adicionar mais

### 4. Pesos por incremento correto por máquina (data de pesos reais)
- Criar objeto `MACHINE_WEIGHTS` com pesos válidos por máquina
- Precor: incrementos de 5lb (com opção +2.5 via pin)
- Genesis: incrementos de 5lb para maioria, 2.5lb para cabos
- Dual Cable / small cables: 2.5lb
- Calf: 10lb
- Ao editar peso: mostrar apenas valores válidos (prev/next na sequência)
- Bumps de +/- respeitam a sequência real da máquina

### 5. Comentário ao final do treino
- Após submeter: campo de texto opcional "Como foi o treino?"
- Exemplos sugeridos: "Senti dor no ombro", "Muito cansado", "Ótimo treino"
- Salvo em `ga_logs[n].comment`
- AI vai usar esses comentários na análise de pesos (quando AI for implementado)

### 6. Onboarding — tela de guia/tutorial (swipe cards)
- 5-6 cards deslizáveis ANTES do step 1
- Card 1: "Escolha seus dias e máquinas"
- Card 2: "Registre suas séries durante o treino"
- Card 3: "Pesos ajustados automaticamente ou manualmente"
- Card 4: "Bluetooth para contar reps automaticamente"
- Card 5: "Comentários → AI analisa e sugere ajustes"
- Card 6: "Foto corporal (Premium) → AI analisa progresso"
- Botão "Skip" e "Next" / indicador de progresso

### 7. Mais marcas de equipamentos no onboarding (step 4)
- Adicionar: Life Fitness, Hammer Strength, Technogym, Cybex, Matrix, Nautilus, Body-Solid, Paramount
- Para cada marca: lista de máquinas com checkboxes
- Pessoa seleciona quais máquinas tem disponíveis

### 8. Pesos válidos por máquina — data lake
- Pesquisar e hardcodar pesos reais de cada máquina
- Precor Pulldown 304: 10-200lb em 5lb
- Genesis Lat: 5-200lb em 5lb  
- Genesis Dual Cable: 2.5-50lb em 2.5lb
- Genesis Multiplane Calf: 20-300lb em 10lb
- etc.

---

## REQUER BACKEND / AI (próxima fase)

### 9. AI Vision — reconhecimento de máquinas por foto/vídeo
- Botão "EM BREVE" já existe no onboarding step 4
- Implementação: foto → OpenAI Vision API → lista de máquinas identificadas
- Cloudflare Worker como proxy para não expor API key
- Usuário confirma/edita lista gerada

### 10. AI Coach — cálculo de pesos com AI
- Primeira semana: AI recalcula pesos após cada sessão
- Depois: manual a cada 7 dias ou automático a cada 14 dias
- AI lê: histórico de reps, comentários, objetivo, nível
- Endpoint: Cloudflare Worker → OpenAI API

### 11. Foto corporal — análise de progresso (Premium)
- Upload de fotos (frente, lado, costas) — até 6 fotos
- AI analisa e sugere ajustes de treino
- Habilitado 1x por mês
- Apenas para usuários Premium ($4.99/mês)
- Explicar no onboarding como feature premium

### 12. GIFs de exercícios reais
- Precisamos de GIFs de 3-5 frames mostrando execução correta
- Opções:
  a) Rafael fornece GIFs → hospedar no Cloudflare R2 ou CDN
  b) Usar API de exercícios (ExerciseDB, Wger) que já tem GIFs
  c) Criar GIFs com ferramenta (Canva, etc.)
- Cada exercício: 1 GIF de execução correta
- Mostrar no sheet de info (botão "i")

### 13. Subscription / Pausa
- Pausar subscription por até X meses (máx 3x por ano)
- Cobrança proporcional ao uso
- Não bloquear acesso durante pausa
- Despausar a qualquer momento

### 14. Seção de Tips & Tricks no app
- Aba ou modal acessível do perfil
- Explica: manual vs auto pesos, como usar comentários, Bluetooth, foto corporal
- Exemplos de comentários úteis para o AI

---

## ORDEM DE IMPLEMENTAÇÃO SUGERIDA

**Sprint 1 (agora — sem backend):**
1. Sessão em memória (não perder treino)
2. Tempo → número de máquinas no onboarding
3. Pesos válidos por máquina (data lake)
4. Adicionar/remover máquina durante treino
5. Comentário ao final do treino
6. Tutorial swipe no início do onboarding
7. Mais marcas no onboarding

**Sprint 2 (com Cloudflare Worker):**
8. AI Vision para reconhecimento de máquinas
9. AI Coach para cálculo de pesos

**Sprint 3 (produto completo):**
10. GIFs reais de exercícios
11. Foto corporal (Premium)
12. Subscription + pausa
13. Tips & Tricks

---

## NOTAS TÉCNICAS

### Sessão em memória
```js
// ga_active_session = {key, cur, sessionData, timestamp}
// Salvar a cada addSet(), skipEx(), nextEx()
// Limpar em finishWorkout()
```

### Fórmula tempo → máquinas
```js
// 1 exercício = ~5 min (3 séries × 1min + descanso 30s × 3 + walking)
// numMachines = Math.floor(sessionMinutes / 5)
// Mínimo 4, máximo 15
```

### Machine weights data structure
```js
const MACHINE_WEIGHTS = {
  'Precor Pulldown 304': {min:10, max:200, step:5, unit:'lb'},
  'Genesis Dual Cable':  {min:2.5, max:50, step:2.5, unit:'lb'},
  'Genesis Multiplane Calf': {min:20, max:300, step:10, unit:'lb'},
  // ...
}
```
