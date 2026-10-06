import { describe, it, expect } from 'vitest';
import { calcBmi, bmiCategory, healthyWeightRange } from '../src/lib/bmi.js';
import { weekRange, monthRange, lastCompleted, pendingReport, recentRanges, effortTier } from '../src/lib/periods.js';
import { estimateCalories, formatDuration, topType } from '../src/lib/workouts.js';

describe('bmi', () => {
  it('computes kg/m² to one decimal', () => {
    expect(calcBmi(170, 65)).toBe(22.5);
    expect(calcBmi(0, 65)).toBeNull();
  });

  it.each([
    [18.4, 'underweight'],
    [18.5, 'normal'],
    [24.9, 'normal'],
    [25, 'overweight'],
    [29.9, 'overweight'],
    [30, 'obese'],
  ])('bmi %d → %s for adults', (bmi, cat) => {
    expect(bmiCategory(bmi, 30)).toBe(cat);
  });

  it('does not apply adult categories under 18', () => {
    expect(bmiCategory(22, 17)).toBe('child');
    expect(bmiCategory(22, 18)).toBe('normal');
  });

  it('gives a healthy weight range', () => {
    expect(healthyWeightRange(170)).toEqual({ min: 53.5, max: 72 });
  });
});

describe('periods (local time)', () => {
  it('weeks start Monday 00:00', () => {
    const sunLate = new Date(2026, 9, 11, 23, 59); // Sun 11 Oct 2026
    const monMidnight = new Date(2026, 9, 12, 0, 0);
    expect(weekRange(sunLate).key).toBe('2026-10-05');
    expect(weekRange(monMidnight).key).toBe('2026-10-12');
    expect(weekRange(sunLate).end).toEqual(monMidnight);
  });

  it('weeks crossing a month/year boundary', () => {
    expect(weekRange(new Date(2027, 0, 1)).key).toBe('2026-12-28');
  });

  it('months roll over, including leap February', () => {
    expect(monthRange(new Date(2028, 1, 29)).key).toBe('2028-02');
    expect(monthRange(new Date(2028, 1, 29)).end).toEqual(new Date(2028, 2, 1));
    expect(lastCompleted('month', new Date(2027, 0, 3)).key).toBe('2026-12');
  });

  it('reports a finished period once, and stays silent on first run', () => {
    const now = new Date(2026, 9, 13, 9); // Tue 13 Oct
    expect(pendingReport('week', now, null)).toEqual({ report: null, markSeen: '2026-10-05' });
    expect(pendingReport('week', now, '2026-09-28').report.key).toBe('2026-10-05');
    expect(pendingReport('week', now, '2026-10-05')).toEqual({ report: null, markSeen: null });
  });

  it('lists recent ranges newest first', () => {
    expect(recentRanges('month', new Date(2026, 0, 15), 3).map((r) => r.key)).toEqual(['2026-01', '2025-12', '2025-11']);
  });

  it('effort tier follows WHO 150 min/week', () => {
    const week = weekRange(new Date(2026, 9, 6));
    expect(effortTier({ sessions: 0, totalMinutes: 0 }, week)).toBe('none');
    expect(effortTier({ sessions: 2, totalMinutes: 60 }, week)).toBe('light');
    expect(effortTier({ sessions: 3, totalMinutes: 100 }, week)).toBe('steady');
    expect(effortTier({ sessions: 5, totalMinutes: 150 }, week)).toBe('great');
    const oct = monthRange(new Date(2026, 9, 6)); // 31 days ≈ 4.43 weeks → 664 min for "great"
    expect(effortTier({ sessions: 10, totalMinutes: 600 }, oct)).toBe('steady');
  });
});

describe('workouts', () => {
  it('estimates calories from MET', () => {
    expect(estimateCalories('running', 30, 60)).toBe(294);
    expect(estimateCalories('running', 30, undefined)).toBeNull();
  });

  it('formats countdowns', () => {
    expect(formatDuration(90_000)).toBe('01:30');
    expect(formatDuration(3_725_000)).toBe('1:02:05');
    expect(formatDuration(-5)).toBe('00:00');
  });

  it('picks the type with most minutes', () => {
    expect(topType({ yoga: { minutes: 20 }, running: { minutes: 75 } }).id).toBe('running');
    expect(topType({})).toBeNull();
  });
});
