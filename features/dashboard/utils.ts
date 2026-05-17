export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getInitial(name?: string | null) {
  return name?.charAt(0)?.toUpperCase() ?? 'A';
}
