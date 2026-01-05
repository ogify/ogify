type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;
type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];

export function clsx(...inputs: ClassValue[]): string {
  var i = 0,
    tmp,
    str = '',
    len = inputs.length;
  for (; i < len; i++) {
    if ((tmp = inputs[i])) {
      if (typeof tmp === 'string') {
        str += (str && ' ') + tmp;
      }
    }
  }
  return str;
}


