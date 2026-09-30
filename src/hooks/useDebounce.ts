import { useEffect, useState } from 'react';

/**
 * Возвращает value, но обновляет его только тогда,
 * когда исходное значение не менялось delay миллисекунд.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Новое значение пришло раньше, чем истёк delay, -- старый таймер отменяем
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
