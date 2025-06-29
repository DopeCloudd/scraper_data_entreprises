/**
 * Attend un délai aléatoire entre deux valeurs en ms
 */
export async function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`⏳ Pause de ${delay}ms`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
