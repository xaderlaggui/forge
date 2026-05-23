export function classifyWorkoutFromExercises(exercises: any[] | undefined): string {
  if (!exercises || exercises.length === 0) return 'Rest Day';

  const pushKWs = ['press', 'push', 'fly', 'dip', 'pec', 'tri', 'front raise', 'lateral raise'];
  const pullKWs = ['pull', 'row', 'curl', 'lat', 'chin', 'shrug', 'rear delt'];
  const legsKWs = ['squat', 'leg', 'calf', 'calves', 'lunge', 'deadlift', 'rdl', 'glute', 'hamstring', 'step-up'];

  let pushScore = 0;
  let pullScore = 0;
  let legsScore = 0;

  exercises.forEach(ex => {
    const name = (ex.name || ex.exerciseName || '').toLowerCase();

    // Leg exercises that might contain push/pull/press (e.g. Leg Press, Leg Curl)
    if (legsKWs.some(kw => name.includes(kw))) {
      legsScore++;
      return;
    }

    if (pushKWs.some(kw => name.includes(kw))) pushScore++;
    if (pullKWs.some(kw => name.includes(kw))) pullScore++;
  });

  const total = pushScore + pullScore + legsScore;
  if (total === 0) return 'Workout Day'; // Unknown

  // Full body: significant mix of upper and lower
  if ((pushScore > 0 || pullScore > 0) && legsScore > 0) {
    if (legsScore >= 1 && (pushScore >= 1 || pullScore >= 1)) return 'Full Body Day';
  }

  if (pushScore > pullScore && pushScore > legsScore) return 'Push Day';
  if (pullScore > pushScore && pullScore > legsScore) return 'Pull Day';
  if (legsScore > pushScore && legsScore > pullScore) return 'Leg Day';

  if (pushScore === pullScore && legsScore === 0) return 'Upper Body Day';

  return 'Workout Day';
}
