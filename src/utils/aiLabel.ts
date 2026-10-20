export interface AiLabelInfo {
  text: string;
  isAi: boolean;
  confidencePercent?: number;
}

const LABELS_DICTIONARY: Record<string, { es: string; en: string }> = {
  person: { es: 'PERSONA', en: 'PERSON' },
  cat: { es: 'GATO', en: 'CAT' },
  dog: { es: 'PERRO', en: 'DOG' },
  car: { es: 'COCHE', en: 'CAR' },
  truck: { es: 'CAMIÓN', en: 'TRUCK' },
  bus: { es: 'AUTOBÚS', en: 'BUS' },
  motorcycle: { es: 'MOTO', en: 'MOTORCYCLE' },
  bicycle: { es: 'BICICLETA', en: 'BICYCLE' },
  bird: { es: 'PÁJARO', en: 'BIRD' },
  horse: { es: 'CABALLO', en: 'HORSE' },
  backpack: { es: 'MOCHILA', en: 'BACKPACK' },
  umbrella: { es: 'PARAGUAS', en: 'UMBRELLA' },
};

/**
 * Parsea el label de detección (ej. "person (84%)" o "cat") y devuelve
 * el nombre del objeto estimado por la IA junto a su porcentaje.
 * 100% libre de emojis para mantener la estética táctica y profesional.
 */
export function getAiLabelInfo(rawLabel?: string, lang: 'es' | 'en' = 'es'): AiLabelInfo {
  if (!rawLabel || rawLabel.toLowerCase() === 'motion' || rawLabel.toLowerCase() === 'movimiento') {
    return {
      text: lang === 'es' ? 'MOVIMIENTO' : 'MOTION',
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
      isAi: true,
      confidencePercent: confNum,
    };
  }

  return {
    text: `${name.toUpperCase()}${confSuffix}`,
    isAi: true,
    confidencePercent: confNum,
  };
}
