// lib/utils/helpers.ts

export function parseStringify<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }
  