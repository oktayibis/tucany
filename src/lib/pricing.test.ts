import { describe, expect, it } from 'vitest';
import type { Party } from '../data/schema';
import { applyParty, classifyPrice, scalesWithParty } from './pricing';

const party: Party = { adults: 3, children: 1, childAgeApprox: 6 };

describe('classifyPrice', () => {
  it('treats a price with no note as a figure for the whole table', () => {
    const basis = classifyPrice(110, undefined, 3);
    expect(basis).toEqual({ kind: 'group', reason: 'assumed-total' });
  });

  it('reads "3 yetiskin" as a per-adult price and works out the unit', () => {
    const basis = classifyPrice(55, '3 yetiskin; 18 yas alti UCRETSIZ', 3);
    expect(basis.kind).toBe('perAdult');
    if (basis.kind !== 'perAdult') return;
    expect(basis.baselineAdults).toBe(3);
    expect(basis.unit).toBeCloseTo(55 / 3, 6);
    expect(basis.childExemption).toBe('stated');
  });

  it('reads "50 EUR/kisi" as per-person but marks the child share as inferred', () => {
    const basis = classifyPrice(150, '50 EUR/kisi sabit menu', 3);
    expect(basis.kind).toBe('perAdult');
    if (basis.kind !== 'perAdult') return;
    expect(basis.unit).toBe(50);
    expect(basis.childExemption).toBe('inferred-from-total');
  });

  it('handles Turkish spelled with and without diacritics', () => {
    expect(classifyPrice(60, '3 yetişkin', 3).kind).toBe('perAdult');
    expect(classifyPrice(60, '20 EUR / kişi', 3).kind).toBe('perAdult');
    expect(classifyPrice(60, 'kişi başı 20 EUR', 3).kind).toBe('perAdult');
  });

  it('does NOT read a shared steak as per-person', () => {
    // This sentence lives in `why`, not `priceNote`, precisely because it says
    // three adults share ONE steak. Passing it here must still not split it.
    const basis = classifyPrice(110, undefined, 3);
    expect(basis.kind).toBe('group');
  });

  it('ignores a note that says nothing about people', () => {
    expect(classifyPrice(90, 'Terastan bedavaya benzerini goruyorsun', 3).kind).toBe('group');
    expect(classifyPrice(90, '   ', 3).kind).toBe('group');
  });
});

describe('applyParty', () => {
  it('leaves table prices untouched at any party size', () => {
    const basis = classifyPrice(25, undefined, 3);
    expect(applyParty(25, basis, party)).toBe(25);
    expect(applyParty(25, basis, { ...party, adults: 6 })).toBe(25);
  });

  it('scales per-adult prices by the adult count only', () => {
    const basis = classifyPrice(55, '3 yetiskin; 18 yas alti UCRETSIZ', 3);
    expect(applyParty(55, basis, party)).toBe(55);
    expect(applyParty(55, basis, { ...party, adults: 4 })).toBeCloseTo((55 / 3) * 4, 6);
    expect(applyParty(55, basis, { ...party, children: 3 })).toBe(55);
  });

  it('is the identity at the party size the price was written for', () => {
    for (const note of ['3 yetiskin', '50 EUR/kisi sabit menu', undefined]) {
      const basis = classifyPrice(150, note, 3);
      expect(applyParty(150, basis, party)).toBeCloseTo(150, 6);
    }
  });
});

describe('scalesWithParty', () => {
  it('tells the UI which prices the party control actually affects', () => {
    expect(scalesWithParty(classifyPrice(55, '3 yetiskin', 3))).toBe(true);
    expect(scalesWithParty(classifyPrice(55, undefined, 3))).toBe(false);
  });
});
