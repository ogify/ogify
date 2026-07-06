type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];

function appendClass(value: ClassValue, classes: string[]): void {
  if (value === null || value === undefined || value === false) {
    return;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    classes.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendClass(item, classes);
    }
    return;
  }

  if (typeof value === 'object') {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) {
        classes.push(key);
      }
    }
  }
}

export function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    appendClass(input, classes);
  }

  return classes.join(' ');
}
