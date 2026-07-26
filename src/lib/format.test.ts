import { describe, expect, it } from 'vitest';
import { deltaPhrase, euro, signedEuro } from './format';

describe('euro', () => {
  it('rounds and groups with a leading symbol', () => {
    expect(euro(1770)).toBe('€1.770');
    expect(euro(55)).toBe('€55');
    expect(euro(0)).toBe('€0');
    expect(euro(18.33)).toBe('€18');
  });
});

describe('signedEuro', () => {
  it('signs a positive delta with a plus', () => {
    expect(signedEuro(230)).toBe('+€230');
  });

  it('signs a negative delta with a real minus sign', () => {
    expect(signedEuro(-230)).toBe('−€230');
  });

  it('calls a zero delta "aynı" rather than "+€0"', () => {
    expect(signedEuro(0)).toBe('aynı');
  });
});

describe('deltaPhrase', () => {
  it('phrases a cheaper candidate as "daha az"', () => {
    expect(deltaPhrase(-230)).toBe('€230 daha az');
  });

  it('phrases a pricier candidate as "daha fazla"', () => {
    expect(deltaPhrase(120)).toBe('€120 daha fazla');
  });

  it('calls no difference "aynı"', () => {
    expect(deltaPhrase(0)).toBe('aynı');
  });
});
