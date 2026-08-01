import type { Day } from '../data/schema';
import { trip } from '../data/trip';

export type RouteLeg = {
  readonly from: string;
  readonly to: string;
  readonly durationMin: number;
  readonly km: number;
  readonly navUrl?: string | undefined;
};

export type DayRoute = {
  readonly dayId: string;
  readonly starterRoute: {
    readonly origin: string;
    readonly destination: string;
    readonly durationMin: number;
    readonly km: number;
    readonly navUrl: string;
  };
  readonly legs: readonly RouteLeg[];
  readonly totalKm: number;
  readonly totalDrivingMinutes: number;
};

const DAY_ROUTES: Record<string, Omit<DayRoute, 'dayId'>> = {
  d1: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Piazza dei Miracoli (Parcheggio Via Pietrasantina, Pisa)',
      durationMin: 65,
      km: 85,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Via+Pietrasantina+Pisa',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Pisa (Parcheggio Via Pietrasantina)',
        durationMin: 65,
        km: 85,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Via+Pietrasantina+Pisa',
      },
      {
        from: 'Pisa',
        to: 'Lucca (Parcheggio Palatucci)',
        durationMin: 30,
        km: 22,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Palatucci+Lucca',
      },
      {
        from: 'Lucca',
        to: trip.base.name,
        durationMin: 65,
        km: 85,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 192,
    totalDrivingMinutes: 160,
  },
  d2: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Tavarnelle Pazarı (Piazza Matteotti)',
      durationMin: 5,
      km: 3,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Piazza+Matteotti+Tavarnelle+Val+di+Pesa',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Tavarnelle Pazarı',
        durationMin: 5,
        km: 3,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Piazza+Matteotti+Tavarnelle+Val+di+Pesa',
      },
      {
        from: 'Tavarnelle',
        to: 'Badia a Passignano',
        durationMin: 12,
        km: 7,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Badia+a+Passignano',
      },
      {
        from: 'Badia a Passignano',
        to: 'San Donato in Poggio',
        durationMin: 12,
        km: 7,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=San+Donato+in+Poggio',
      },
      {
        from: 'San Donato in Poggio',
        to: trip.base.name,
        durationMin: 6,
        km: 4,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 21,
    totalDrivingMinutes: 35,
  },
  d3: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Siena (Parcheggio Santa Caterina - yürüyen merdiven)',
      durationMin: 40,
      km: 42,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Santa+Caterina+Siena',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Siena (Parcheggio Santa Caterina)',
        durationMin: 40,
        km: 42,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Santa+Caterina+Siena',
      },
      {
        from: 'Siena',
        to: trip.base.name,
        durationMin: 40,
        km: 42,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 84,
    totalDrivingMinutes: 80,
  },
  d4: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Floransa Villa Costanza Otoparkı (Tram T1)',
      durationMin: 30,
      km: 32,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Villa+Costanza+Scandicci',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Villa Costanza Otoparkı (Tram T1)',
        durationMin: 30,
        km: 32,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Villa+Costanza+Scandicci',
      },
      {
        from: 'Villa Costanza',
        to: 'Piazzale Michelangelo',
        durationMin: 25,
        km: 15,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Piazzale+Michelangelo+Firenze',
      },
      {
        from: 'Piazzale Michelangelo',
        to: trip.base.name,
        durationMin: 35,
        km: 35,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 82,
    totalDrivingMinutes: 90,
  },
  d5: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Arezzo Antika Fuarı (Parcheggio Pietri)',
      durationMin: 80,
      km: 95,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Pietri+Arezzo',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Arezzo (Parcheggio Pietri)',
        durationMin: 80,
        km: 95,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Pietri+Arezzo',
      },
      {
        from: 'Arezzo',
        to: trip.base.name,
        durationMin: 80,
        km: 95,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 190,
    totalDrivingMinutes: 160,
  },
  d6: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Pienza (Parcheggio Sur Dışı)',
      durationMin: 85,
      km: 105,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Pienza',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Pienza (Sur Dışı Otopark)',
        durationMin: 85,
        km: 105,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Pienza',
      },
      {
        from: 'Pienza',
        to: 'Bagno Vignoni',
        durationMin: 20,
        km: 14,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Bagno+Vignoni',
      },
      {
        from: 'Bagno Vignoni',
        to: 'Cappella Vitaleta',
        durationMin: 12,
        km: 8,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Cappella+della+Madonna+di+Vitaleta',
      },
      {
        from: 'Cappella Vitaleta',
        to: trip.base.name,
        durationMin: 88,
        km: 100,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 227,
    totalDrivingMinutes: 205,
  },
  d7: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'San Gimignano (Parcheggio Giubileo P1)',
      durationMin: 30,
      km: 24,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Giubileo+San+Gimignano',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'San Gimignano (P1 Giubileo)',
        durationMin: 30,
        km: 24,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Giubileo+San+Gimignano',
      },
      {
        from: 'San Gimignano',
        to: trip.base.name,
        durationMin: 30,
        km: 24,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 48,
    totalDrivingMinutes: 60,
  },
  d8: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Fattoria Casa Sola (Barberino)',
      durationMin: 10,
      km: 6,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Fattoria+Casa+Sola+Barberino',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Fattoria Casa Sola',
        durationMin: 10,
        km: 6,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Fattoria+Casa+Sola+Barberino',
      },
      {
        from: 'Fattoria Casa Sola',
        to: 'Montefioralle / Panzano',
        durationMin: 20,
        km: 15,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Montefioralle+Greve+in+Chianti',
      },
      {
        from: 'Panzano',
        to: trip.base.name,
        durationMin: 30,
        km: 18,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 39,
    totalDrivingMinutes: 60,
  },
  d9: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Montelupo Fiorentino (Museo della Ceramica)',
      durationMin: 30,
      km: 35,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Museo+della+Ceramica+Montelupo+Fiorentino',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Montelupo Fiorentino',
        durationMin: 30,
        km: 35,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Museo+della+Ceramica+Montelupo+Fiorentino',
      },
      {
        from: 'Montelupo Fiorentino',
        to: trip.base.name,
        durationMin: 30,
        km: 35,
        navUrl: trip.base.nav,
      },
    ],
    totalKm: 70,
    totalDrivingMinutes: 60,
  },
  d10: {
    starterRoute: {
      origin: trip.base.name,
      destination: 'Pisa Havalimanı (Galileo Galilei Araç İadesi)',
      durationMin: 90,
      km: 88,
      navUrl: 'https://www.google.com/maps/search/?api=1&query=Pisa+Airport+Car+Rental+Return',
    },
    legs: [
      {
        from: trip.base.name,
        to: 'Pisa Havalimanı Benzinci & Araç İadesi',
        durationMin: 90,
        km: 88,
        navUrl: 'https://www.google.com/maps/search/?api=1&query=Pisa+Airport+Car+Rental+Return',
      },
    ],
    totalKm: 88,
    totalDrivingMinutes: 90,
  },
};

export function getDayRoute(day: Day): DayRoute | undefined {
  const route = DAY_ROUTES[day.id];
  if (route === undefined) return undefined;
  return {
    dayId: day.id,
    ...route,
  };
}

/** Generates multi-stop Google Maps and Apple Maps turn-by-turn directions links. */
export function getRouteDirectionsLinks(route: DayRoute): { google: string; apple: string } {
  const originQuery = encodeURIComponent(route.starterRoute.origin);
  const destQuery = encodeURIComponent(route.starterRoute.destination);

  const google = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destQuery}&travelmode=driving`;
  const apple = `https://maps.apple.com/?saddr=${originQuery}&daddr=${destQuery}&dirflg=d`;

  return { google, apple };
}
