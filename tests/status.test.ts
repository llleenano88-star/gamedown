import { describe, it, expect } from 'vitest';
import { calcStatus } from '../lib/status';

describe('calcStatus', () => {
  it('ok ниже минимума жалоб', () => expect(calcStatus(4, 0)).toBe('ok'));
  it('warn выше 3× среднего', () => expect(calcStatus(6, 672)).toBe('warn'));
  it('down выше 10× среднего', () => expect(calcStatus(12, 672)).toBe('down'));
  it('учитывает индивидуальный минимум', () => expect(calcStatus(12, 672, 15)).toBe('ok'));
});
