import React, { useEffect, useRef, useState } from 'react';

interface HindiTextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Composition-safe & paste-safe input for Hindi (Devanagari / Gboard IME) and English text.
 * Prevents React controlled re-renders from interrupting IME composition mid-word on Android.
 */
export const HindiTextInput: React.FC<HindiTextInputProps> = ({
  value,
  onValueChange,
  className = '',
  onCompositionStart,
  onCompositionEnd,
  onPaste,
  onBlur,
  ...rest
}) => {
  const [localValue, setLocalValue] = useState<string>(value ?? '');
  const composingRef = useRef(false);

  useEffect(() => {
    if (!composingRef.current) {
      setLocalValue(value ?? '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.currentTarget.value;
    setLocalValue(next);
    if (!composingRef.current) {
      onValueChange(next);
    }
  };

  const handleCompositionStart = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = true;
    onCompositionStart?.(e);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    const finalVal = e.currentTarget.value;
    setLocalValue(finalVal);
    onValueChange(finalVal);
    onCompositionEnd?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    const inputEl = e.currentTarget;
    requestAnimationFrame(() => {
      composingRef.current = false;
      const next = inputEl.value;
      setLocalValue(next);
      onValueChange(next);
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (composingRef.current) {
      composingRef.current = false;
    }
    const finalVal = e.currentTarget.value;
    if (finalVal !== value) {
      setLocalValue(finalVal);
      onValueChange(finalVal);
    }
    onBlur?.(e);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="text"
      lang="hi"
      dir="auto"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      value={localValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      onBlur={handleBlur}
      className={`font-hindi ${className}`}
    />
  );
};
