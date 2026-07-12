import type { Operator } from "./types";

// Operator-Startbestand. Speed/Armor bestimmen die Health-Werte in R6:
//   3-Speed/1-Armor = 100 HP, 2/2 = 110 HP, 1/3 = 125 HP.
// Weitere Operator einfach nach diesem Muster ergänzen; Waffen über ihre id
// aus weapons.ts referenzieren.
export const operators: Operator[] = [
  {
    id: "ash",
    name: "Ash",
    side: "attacker",
    organization: "FBI SWAT",
    country: "USA",
    speed: 3,
    armor: 1,
    health: 100,
    difficulty: 2,
    roles: ["Entry", "Breach"],
    gadget: {
      name: "M120 CREM (Breaching Rounds)",
      description:
        "Ferngezündete Sprenggeschosse, die zerstörbare Wände und Barrikaden aus der Distanz öffnen. Ideal für schnelle Entries.",
    },
    loadout: {
      primary: ["r4c", "m590a1"],
      secondary: ["5-7", "p226"],
      gadgets: ["Breach Charge", "Stun Grenade"],
    },
    bio: "Eliza Cohen ist eine schnelle Entry-Fraggerin, die mit ihren Breaching Rounds aus sicherer Distanz Zugänge schafft.",
    accent: "#4aa3ff",
  },
  {
    id: "thermite",
    name: "Thermite",
    side: "attacker",
    organization: "FBI SWAT",
    country: "USA",
    speed: 2,
    armor: 2,
    health: 110,
    difficulty: 2,
    roles: ["Hard Breach", "Support"],
    gadget: {
      name: "Exothermic Charge",
      description:
        "Brennladung, die verstärkte Wände öffnet und so Sichtlinien und Zugänge auf verbarrikadierte Bereiche schafft.",
    },
    loadout: {
      primary: ["556xi", "m590a1"],
      secondary: ["5-7"],
      gadgets: ["Smoke Grenade", "Stun Grenade"],
    },
    bio: "Jordan Trace ist der klassische Hard-Breacher: Ohne ihn (oder Hibana) bleiben verstärkte Wände zu.",
    accent: "#ff7a1a",
  },
  {
    id: "sledge",
    name: "Sledge",
    side: "attacker",
    organization: "SAS",
    country: "Großbritannien",
    speed: 2,
    armor: 2,
    health: 110,
    difficulty: 1,
    roles: ["Entry", "Soft Breach"],
    gadget: {
      name: "Tactical Breaching Hammer (The Caber)",
      description:
        "Vorschlaghammer, der zerstörbare Wände, Böden und Barrikaden lautlos und ohne Munitionsverbrauch öffnet.",
    },
    loadout: {
      primary: ["l85a2", "m590a1"],
      secondary: ["p226"],
      gadgets: ["Frag Grenade", "Stun Grenade"],
    },
    bio: "Seamus Cowden schafft mit seinem Hammer flexible Zugänge und neue Sichtlinien – einsteigerfreundlich und stark.",
    accent: "#4aa3ff",
  },
  {
    id: "thatcher",
    name: "Thatcher",
    side: "attacker",
    organization: "SAS",
    country: "Großbritannien",
    speed: 2,
    armor: 2,
    health: 110,
    difficulty: 1,
    roles: ["Support", "Anti-Gadget"],
    gadget: {
      name: "EG Mk 0-EMP Grenade",
      description:
        "EMP-Granaten, die elektronische Verteidiger-Gadgets (Jammer, Batterien, Kameras) für kurze Zeit deaktivieren.",
    },
    loadout: {
      primary: ["l85a2", "m590a1"],
      secondary: ["p226"],
      gadgets: ["Breach Charge", "Claymore"],
    },
    bio: "Mike Baker macht mit seinen EMPs den Weg für Hard-Breacher frei, indem er Bandit-, Mute- und Kaid-Gadgets ausschaltet.",
    accent: "#ff7a1a",
  },
  {
    id: "fuze",
    name: "Fuze",
    side: "attacker",
    organization: "Spetsnaz",
    country: "Russland",
    speed: 2,
    armor: 2,
    health: 110,
    difficulty: 2,
    roles: ["Area Denial", "Support"],
    gadget: {
      name: "Cluster Charge",
      description:
        "Ladung, die durch zerstörbare Oberflächen mehrere Submunitionen in den dahinterliegenden Raum feuert – tödlich für Gegner und Gadgets.",
    },
    loadout: {
      primary: ["ak12"],
      secondary: ["p9"],
      gadgets: ["Breach Charge", "Smoke Grenade"],
    },
    bio: "Shuhrat Kessikbayev räumt mit seinen Cluster Charges Räume – Vorsicht bei Geisel-Missionen.",
    accent: "#ff7a1a",
  },
  {
    id: "mute",
    name: "Mute",
    side: "defender",
    organization: "SAS",
    country: "Großbritannien",
    speed: 2,
    armor: 2,
    health: 110,
    difficulty: 1,
    roles: ["Anti-Breach", "Intel Denial"],
    gadget: {
      name: "Signal Disruptor (Jammer)",
      description:
        "Störsender, die Angreifer-Drohnen und ferngezündete Breaching-Gadgets in ihrem Radius blockieren.",
    },
    loadout: {
      primary: ["mp5k", "m590a1"],
      secondary: ["p226"],
      gadgets: ["Nitro Cell", "Bulletproof Camera"],
    },
    bio: "Mark Chandar verhindert Hard Breaches und blockiert Aufklärung mit seinen Jammern.",
    accent: "#ff7a3d",
  },
  {
    id: "smoke",
    name: "Smoke",
    side: "defender",
    organization: "SAS",
    country: "Großbritannien",
    speed: 2,
    armor: 2,
    health: 110,
    difficulty: 2,
    roles: ["Area Denial", "Anchor"],
    gadget: {
      name: "Remote Gas Grenade",
      description:
        "Ferngezündete Giftgasgranaten, die Bereiche verwehren – auch durch Objectives hindurch gefährlich.",
    },
    loadout: {
      primary: ["fmg9", "m590a1"],
      secondary: ["p226", "smg11"],
      gadgets: ["Barbed Wire", "Deployable Shield"],
    },
    bio: "James Porter hält mit seinem Giftgas den Defuser-Plant auf und verzögert Pushes entscheidend.",
    accent: "#ff7a3d",
  },
  {
    id: "bandit",
    name: "Bandit",
    side: "defender",
    organization: "GSG 9",
    country: "Deutschland",
    speed: 3,
    armor: 1,
    health: 100,
    difficulty: 2,
    roles: ["Anti-Hard-Breach", "Roamer"],
    gadget: {
      name: "Shock Wire (CED-1)",
      description:
        "Elektrifiziert Stacheldraht und verstärkte Wände und zerstört so anliegende Breaching-Gadgets, bevor sie zünden.",
    },
    loadout: {
      primary: ["mp7", "m870"],
      secondary: ["p9"],
      gadgets: ["Nitro Cell", "Barbed Wire"],
    },
    bio: "Dominic Brunsmeier verteidigt verstärkte Wände mit Strom – „Bandit-Tricking“ ist eine eigene Kunst.",
    accent: "#ff7a3d",
  },
  {
    id: "rook",
    name: "Rook",
    side: "defender",
    organization: "GIGN",
    country: "Frankreich",
    speed: 1,
    armor: 3,
    health: 125,
    difficulty: 1,
    roles: ["Support", "Anchor"],
    gadget: {
      name: "R1N “Rhino” Armor",
      description:
        "Legt ein Paket mit Panzerplatten ab, das dem gesamten Team zusätzliche Rüstung und einen Vorteil beim Downed-Zustand gibt.",
    },
    loadout: {
      primary: ["p90", "m870"],
      secondary: ["lfp586", "p9"],
      gadgets: ["Barbed Wire", "Impact Grenade"],
    },
    bio: "Julien Nizan ist der einsteigerfreundliche Support: Rüstung fürs Team, ohne aktiv eingreifen zu müssen.",
    accent: "#ff7a3d",
  },
  {
    id: "doc",
    name: "Doc",
    side: "defender",
    organization: "GIGN",
    country: "Frankreich",
    speed: 1,
    armor: 3,
    health: 125,
    difficulty: 1,
    roles: ["Support", "Anchor"],
    gadget: {
      name: "MPD-0 STIM PISTOL",
      description:
        "Verschießt Stim-Pfeile, die Teammates (oder ihn selbst) heilen und über 100 HP überheilen bzw. aus dem Downed-Zustand zurückholen.",
    },
    loadout: {
      primary: ["mp5", "m870"],
      secondary: ["lfp586", "p9"],
      gadgets: ["Barbed Wire", "Bulletproof Camera"],
    },
    bio: "Gustave Kateb hält das Team am Leben und kann Down-Situationen im Nahkampf drehen.",
    accent: "#ff7a3d",
  },
  {
    id: "jager",
    name: "Jäger",
    side: "defender",
    organization: "GSG 9",
    country: "Deutschland",
    speed: 3,
    armor: 1,
    health: 100,
    difficulty: 1,
    roles: ["Anti-Projectile", "Roamer"],
    gadget: {
      name: "ADS-Mk IV “Magpie”",
      description:
        "Aktives Abwehrsystem, das geworfene Angreifer-Gadgets (Granaten, Impacts) im Flug abfängt und neutralisiert.",
    },
    loadout: {
      primary: ["416c", "m870"],
      secondary: ["p9"],
      gadgets: ["Bulletproof Camera", "Observation Blocker"],
    },
    bio: "Marius Streicher schützt den Objective vor Wurfgadgets – ein Dauer-Pick auf hohem Niveau.",
    accent: "#ff7a3d",
  },
];

export const operatorById = new Map(operators.map((o) => [o.id, o]));

export function getOperator(id: string): Operator | undefined {
  return operatorById.get(id);
}

// Alle vorkommenden Rollen (für Filter-UI), alphabetisch sortiert.
export const allRoles = Array.from(
  new Set(operators.flatMap((o) => o.roles)),
).sort();
