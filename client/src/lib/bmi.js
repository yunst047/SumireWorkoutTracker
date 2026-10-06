// WHO adult BMI classification. Under 18 needs BMI-for-age percentiles instead.
export const ADULT_AGE = 18;

export function calcBmi(heightCm, weightKg) {
  const m = heightCm / 100;
  if (!(m > 0) || !(weightKg > 0)) return null;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi, age) {
  if (bmi == null) return null;
  if (age < ADULT_AGE) return 'child';
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export function healthyWeightRange(heightCm) {
  const m2 = (heightCm / 100) ** 2;
  return { min: Math.round(18.5 * m2 * 10) / 10, max: Math.round(24.9 * m2 * 10) / 10 };
}

export const CATEGORY_LABEL = {
  underweight: 'Underweight',
  normal: 'Normal',
  overweight: 'Overweight',
  obese: 'Obese',
  child: 'Under 18 — use BMI-for-age',
};
