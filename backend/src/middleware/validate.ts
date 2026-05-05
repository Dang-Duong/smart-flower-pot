type FieldRule = {
  type?: 'string' | 'number';
  minLength?: number;
};

type Schema = Record<string, FieldRule>;

export function validate(body: Record<string, unknown>, schema: Schema): string | null {
  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    if (value === undefined || value === null || value === '') {
      return `${field} is required`;
    }

    if (rules.type && typeof value !== rules.type) {
      return `${field} must be a ${rules.type}`;
    }

    if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }
  }

  return null;
}
