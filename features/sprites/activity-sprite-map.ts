export function getSpriteForActivity(activityName?: string, type?: string): string {
  const name = (activityName || '').toLowerCase();
  
  // Specific Exercises
  if (name.includes('bench') || name.includes('chest press')) return 'bench-press';
  if (name.includes('deadlift')) return 'deadlift';
  if (name.includes('squat')) return 'back_squat';
  if (name.includes('lunge')) return 'dumbbell-lunge';
  if (name.includes('curl') || name.includes('bicep')) return 'dumbbell-curl';
  if (name.includes('lat') || name.includes('pull down')) return 'lat-pull';
  if (name.includes('overhead') || name.includes('shoulder press')) return 'overhead-press';
  if (name.includes('pull-up') || name.includes('pullup') || name.includes('chin-up')) return 'pull-ups';
  if (name.includes('row')) return 'rowing';
  if (name.includes('cable')) return 'seated-cable-row';
  if (name.includes('side raise') || name.includes('lateral')) return 'side-raise';
  if (name.includes('leg press')) return 'leg-press';
  
  // Sports & Cardio
  if (name.includes('cycl') || name.includes('bike') || name.includes('spin')) return 'cycling';
  if (name.includes('swim') || name.includes('pool') || name.includes('dive')) return 'swimming';
  if (name.includes('climb')) return 'rock-climbing';
  if (name.includes('skate')) return 'skateboarding';
  if (name.includes('surf') || name.includes('wake')) return 'surfing';
  if (name.includes('paraglid')) return 'paragliding';
  if (name.includes('snowboard')) return 'snowboarding';
  if (name.includes('archery') || name.includes('bow')) return 'archery';
  if (name.includes('base') || name.includes('softball')) return 'baseball';
  if (name.includes('basket') || name.includes('hoop')) return 'basketball';
  if (name.includes('golf')) return 'golf';
  if (name.includes('rugby')) return 'rugby';
  if (name.includes('football') || name.includes('american')) return 'american-football';
  if (name.includes('soccer')) return 'soccer';
  if (name.includes('tennis') || name.includes('racket') || name.includes('squash')) return 'tennis';
  if (name.includes('volley')) return 'volleyball';
  if (name.includes('hockey')) return 'hockey';
  
  // Martial Arts
  if (name.includes('box') || name.includes('punch')) return 'boxing';
  if (name.includes('karate')) return 'karate';
  if (name.includes('mma') || name.includes('fight')) return 'mma';
  if (name.includes('taekwondo') || name.includes('kick')) return 'taekwondo';
  if (name.includes('kungfu') || name.includes('kung fu') || name.includes('wushu')) return 'kungfu';
  
  // Flexibility & Bodyweight
  if (name.includes('yoga') || name.includes('stretch') || name.includes('pilates')) return 'yoga';
  if (name.includes('handstand') || name.includes('arm stand') || name.includes('gymnastic')) return 'arm-stand';

  // Broad Fallbacks based on activity name
  if (name.includes('run') || name.includes('jog') || name.includes('sprint')) return 'running';
  if (name.includes('walk') || name.includes('stroll') || name.includes('hike')) return 'walking';
  
  // Fallbacks based on broad type
  if (type === 'strength') return 'flex';
  if (type === 'cardio') return 'running';
  if (type === 'run') return 'running';
  if (type === 'walk') return 'walking';
  
  // Default fallback
  return 'smiling-coach';
}
