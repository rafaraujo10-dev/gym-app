const WORKOUTS = {
  A: [
    { name: 'Precor Pulldown 304', weight: 70, unit: 'lb' },
    { name: 'Genesis Lat', weight: 60, unit: 'lb' },
    { name: 'Precor Low Row', weight: 80, unit: 'lb' },
    { name: 'Leg Extension', weight: 80, unit: 'lb' },
    { name: 'Leg Curl', weight: 55, unit: 'lb' },
    { name: 'Genesis Multiplane Shoulder', weight: 25, unit: 'lb' },
    { name: 'Genesis Biceps', weight: 20, unit: 'lb' },
    { name: 'Genesis Triceps', weight: 35, unit: 'lb' },
    { name: 'Dumbbell Bench Press', weight: 15, unit: 'lb cada' },
    { name: 'Inner Thigh', weight: 130, unit: 'lb' },
    { name: 'Outer Thigh', weight: 130, unit: 'lb' },
    { name: 'Decline Sit-up', weight: 0, unit: 'corpo' },
  ],
  B: [
    { name: 'Genesis Chin / Dip Assist', weight: 6, unit: 'level' },
    { name: 'Genesis Multiplane Chest', weight: 30, unit: 'lb' },
    { name: 'Precor Low Row', weight: 80, unit: 'lb' },
    { name: 'Leg Extension', weight: 80, unit: 'lb' },
    { name: 'Prone Leg Curl', weight: 60, unit: 'lb' },
    { name: 'Genesis Multiplane Shoulder', weight: 25, unit: 'lb' },
    { name: 'Genesis Biceps Preacher', weight: 20, unit: 'lb' },
    { name: 'Genesis Triceps Seated', weight: 30, unit: 'lb' },
    { name: 'Inner Thigh', weight: 130, unit: 'lb' },
    { name: 'Outer Thigh', weight: 130, unit: 'lb' },
    { name: 'Decline Sit-up', weight: 0, unit: 'corpo' },
  ],
  C: [
    { name: 'Genesis Lat', weight: 70, unit: 'lb' },
    { name: 'Precor Pulldown 304', weight: 70, unit: 'lb' },
    { name: 'Precor Seated Row', weight: 60, unit: 'lb' },
    { name: 'Genesis Total Quad / Hip', weight: 17.5, unit: 'lb' },
    { name: 'Genesis Total Glute / Ham', weight: 20, unit: 'lb' },
    { name: 'Genesis Multiplane Shoulder', weight: 25, unit: 'lb' },
    { name: 'Genesis Biceps', weight: 20, unit: 'lb' },
    { name: 'Genesis Triceps', weight: 30, unit: 'lb' },
    { name: 'Genesis Multiplane Calf', weight: 180, unit: 'lb' },
    { name: 'Genesis Dual Cable', weight: 17, unit: 'lb' },
    { name: 'Decline Sit-up', weight: 0, unit: 'corpo' },
  ]
};

export function renderWorkout(container, workoutKey) {
  let currentExercise = 0;
  let sets = {};
  const exercises = WORKOUTS[workoutKey];

  function renderExercise() {
    const ex = exercises[currentExercise];
    const exSets = sets[currentExercise] || [];
    const isLast = currentExercise === exercises.length - 1;

    container.innerHTML = `
      <div style="padding: 24px; max-width: 480px; margin: 0 auto; min-height: 100vh; background: #0d0d0f;">

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 28px;">
          <button onclick="goBack()" style="width: 36px; height: 36px; border-radius: 50%; background: #1a1a22; border: 0.5px solid #333; color: #888; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&#8592;</button>
          <div style="flex: 1;">
            <div style="background: #1a1a22; border-radius: 20px; height: 4px; overflow: hidden;">
              <div style="background: #fff; height: 4px; width: ${Math.round(((currentExercise + 1) / exercises.length) * 100)}%; transition: width 0.3s;"></div>
            </div>
            <p style="color: #555; font-size: 11px; margin: 6px 0 0; text-align: right;">${currentExercise + 1} / ${exercises.length}</p>
          </div>
        </div>

        <p style="color: #888; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.08em;">Treino ${workoutKey}</p>
        <p style="color: #fff; font-size: 24px; font-weight: 500; margin: 0 0 4px;">${ex.name}</p>
        <p style="color: #555; font-size: 14px; margin: 0 0 28px;">${ex.weight > 0 ? ex.weight + ' ' + ex.unit : 'Peso corporal'}</p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
          ${[0,1,2].map(i => {
            const rep = exSets[i];
            return `<div style="background: #1a1a22; border-radius: 14px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border: 0.5px solid ${rep !== undefined ? '#2a3a2a' : i === exSets.length ? '#3a3a4a' : '#1a1a22'};">
              <span style="color: #888; font-size: 14px;">Série ${i+1}</span>
              ${rep !== undefined
                ? `<span style="color: #4ade80; font-size: 16px; font-weight: 500;">${rep} reps</span>`
                : i === exSets.length
                  ? `<span style="color: #555; font-size: 13px;">aguardando...</span>`
                  : `<span style="color: #333; font-size: 13px;">—</span>`
              }
            </div>`;
          }).join('')}
        </div>

        ${exSets.length < 3 ? `
          <div style="margin-bottom: 16px;">
            <p style="color: #888; font-size: 13px; margin: 0 0 10px; text-align: center;">Quantas reps na série ${exSets.length + 1}?</p>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px;">
              ${[6,8,10,12,14,15,16,18,20,25].map(n =>
                `<button onclick="addSet(${n})" style="padding: 14px 0; background: #1a1a22; border: 0.5px solid #2a2a35; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 500; cursor: pointer;">${n}</button>`
              ).join('')}
            </div>
            <div style="display: flex; gap: 8px;">
              <input id="customReps" type="number" min="1" max="99" placeholder="outro" style="flex: 1; padding: 14px; background: #1a1a22; border: 0.5px solid #2a2a35; border-radius: 10px; color: #fff; font-size: 15px; text-align: center;" />
              <button onclick="addCustomSet()" style="padding: 14px 20px; background: #1a1a22; border: 0.5px solid #2a2a35; border-radius: 10px; color: #fff; font-size: 15px; cursor: pointer;">OK</button>
            </div>
          </div>
        ` : `
          <button onclick="nextExercise()" style="width: 100%; padding: 16px; background: #fff; border: none; border-radius: 14px; color: #0d0d0f; font-size: 16px; font-weight: 500; cursor: pointer; margin-bottom: 12px;">
            ${isLast ? 'Finalizar treino' : 'Próximo exercício'}
          </button>
        `}

        <button onclick="skipExercise()" style="width: 100%; padding: 14px; background: transparent; border: 0.5px solid #2a2a35; border-radius: 14px; color: #555; font-size: 14px; cursor: pointer;">
          Pular este exercício
        </button>

      </div>
    `;
  }

  window.addSet = function(reps) {
    if (!sets[currentExercise]) sets[currentExercise] = [];
    if (sets[currentExercise].length < 3) {
      sets[currentExercise].push(reps);
      renderExercise();
    }
  };

  window.addCustomSet = function() {
    const val = parseInt(document.getElementById('customReps').value);
    if (val > 0) window.addSet(val);
  };

  window.nextExercise = function() {
    if (currentExercise < exercises.length - 1) {
      currentExercise++;
      renderExercise();
    } else {
      finishWorkout();
    }
  };

  window.skipExercise = function() {
    sets[currentExercise] = sets[currentExercise] || [];
    window.nextExercise();
  };

  window.goBack = function() {
    if (currentExercise > 0) {
      currentExercise--;
      renderExercise();
    } else {
      import('../app.js').then(() => location.reload());
    }
  };

  function finishWorkout() {
    const logs = JSON.parse(localStorage.getItem('gymapp_logs') || '[]');
    logs.push({ date: new Date().toISOString(), workout: workoutKey, sets });
    localStorage.setItem('gymapp_logs', JSON.stringify(logs));

    const streak = parseInt(localStorage.getItem('gymapp_streak') || '0');
    localStorage.setItem('gymapp_streak', streak + 1);

    container.innerHTML = `
      <div style="padding: 24px; max-width: 480px; margin: 0 auto; min-height: 100vh; background: #0d0d0f; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 24px;">&#127942;</div>
        <p style="color: #fff; font-size: 28px; font-weight: 500; margin: 0 0 8px;">Treino concluído!</p>
        <p style="color: #888; font-size: 15px; margin: 0 0 8px;">Treino ${workoutKey} · ${exercises.length} exercícios</p>
        <p style="color: #f97316; font-size: 14px; margin: 0 0 40px;">&#9733; ${streak + 1} dias de sequência</p>
        <button onclick="location.reload()" style="width: 100%; padding: 16px; background: #fff; border: none; border-radius: 14px; color: #0d0d0f; font-size: 16px; font-weight: 500; cursor: pointer;">
          Voltar ao início
        </button>
      </div>
    `;
  }

  renderExercise();
}