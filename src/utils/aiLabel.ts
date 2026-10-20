export interface AiLabelInfo {
  text: string;
  icon: string;
  isAi: boolean;
  confidencePercent?: number;
}

const LABELS_DICTIONARY: Record<string, { es: string; en: string; icon: string }> = {
  person: { es: 'PERSONA', en: 'PERSON', icon: '👤' },
  cat: { es: 'GATO', en: 'CAT', icon: '🐱' },
  dog: { es: 'PERRO', en: 'DOG', icon: '🐶' },
  car: { es: 'COCHE', en: 'CAR', icon: '🚗' },
  truck: { es: 'CAMIÓN', en: 'TRUCK', icon: '🚚' },
  bus: { es: 'AUTOBÚS', en: 'BUS', icon: '🚌' },
  motorcycle: { es: 'MOTO', en: 'MOTORCYCLE', icon: '🏍️' },
  bicycle: { es: 'BICICLETA', en: 'BICYCLE', icon: '🚲' },
  bird: { es: 'PÁJARO', en: 'BIRD', icon: '🐦' },
  horse: { es: 'CABALLO', en: 'HORSE', icon: '🐴' },
  backpack: { es: 'MOCHILA', en: 'BACKPACK', icon: '🎒' },
  umbrella: { es: 'PARAGUAS', en: 'UMBRELLA', icon: '☂️' },
};

/**
 * Parsea el label de detección (ej. "person (84%)" o "cat") y devuelve
 * el nombre del objeto estimado por la IA junto a su icono y porcentaje.
 */
export function getAiLabelInfo(rawLabel?: string, lang: 'es' | 'en' = 'es'): AiLabelInfo {
  if (!rawLabel || rawLabel.toLowerCase() === 'motion' || rawLabel.toLowerCase() === 'movimiento') {
    return {
      text: lang === 'es' ? 'MOVIMIENTO' : 'MOTION',
      icon: '⚡',
      isAi: false,
    };
  }

  // Parsear formatos como "person (84%)" o "person"
  const match = rawLabel.match(/^([a-zA-Z\s_-]+)(?:\s*\(([0-9]+)%?\))?/);
  const name = match ? match[1].trim().toLowerCase() : rawLabel.trim().toLowerCase();
  const confNum = match && match[2] ? parseInt(match[2], 10) : undefined;
  const confSuffix = confNum !== undefined ? ` ${confNum}%` : '';

  const entry = LABELS_DICTIONARY[name];
  if (entry) {
    const localizedName = lang === 'en' ? entry.en : entry.es;
    return {
      text: `${localizedName}${confSuffix}`,
      icon: entry.icon,
      isAi: true,
      confidencePercent: confNum,
    };
  }

  return {
    text: `${name.toUpperCase()}${confSuffix}`,
    icon: '🎯',
    isAi: true,
    confidencePercent: confNum,
  };
}
