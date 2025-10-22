export function getCurrentDateFormatted(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return now.toLocaleDateString('pt-BR', options);
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentDate(): Date {
  return new Date();
}
