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
  // Usar data fixa para evitar problemas de hidratação
  // O ano atual é 2025, então retornamos um valor fixo
  return 2025;
}

export function getCurrentDate(): Date {
  return new Date();
}
