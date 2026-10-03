export const CIRCLE_NAMES = [
  "Orion", "Vega", "Lyra", "Sirius", "Polaris", "Altair", "Rigel", "Antares", "Spica", "Arcturus",
  "Capella", "Procyon", "Aldebaran", "Deneb", "Castor", "Pollux", "Regulus", "Fomalhaut", "Bellatrix", "Canopus",
  "Achernar", "Acrux", "Alnilam", "Alnitak", "Mintaka", "Saiph", "Dubhe", "Merak", "Alioth", "Mizar",
  "Alkaid", "Kochab", "Algol", "Mira", "Denebola", "Andromeda", "Aquarius", "Aquila", "Aries", "Auriga",
  "Bootes", "Cancer", "Carina", "Cassiopeia", "Centaurus", "Cepheus", "Cetus", "Columba", "Corvus", "Crux",
  "Cygnus", "Delphinus", "Dorado", "Draco", "Eridanus", "Gemini", "Grus", "Hercules", "Hydra", "Lacerta",
  "Leo", "Lepus", "Libra", "Lupus", "Lynx", "Pavo", "Pegasus", "Perseus", "Phoenix", "Pisces",
  "Puppis", "Sagitta", "Sagittarius", "Scorpius", "Scutum", "Serpens", "Taurus", "Vela", "Virgo", "Pictor",
  "Pyxis", "Indus", "Norma", "Octans", "Volans", "Musca", "Ara", "Apus", "Tucana", "Horologium",
  "Fornax", "Circinus", "Chamaeleon", "Reticulum", "Sculptor", "Sextans", "Equuleus", "Hydrus", "Mensa", "Antlia",
] as const;


export type CircleName = (typeof CIRCLE_NAMES)[number];

export function isCircleName(value: string): value is CircleName {
  return (CIRCLE_NAMES as readonly string[]).includes(value);
}
