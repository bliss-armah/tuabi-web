import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/utils";
import {
  OTP_LENGTH,
  clearDigit,
  onlyDigits,
  toDigitBoxes,
  writeDigits,
} from "@/shared/utils/otp";

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  idPrefix?: string;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  disabled,
  autoFocus,
  idPrefix = "otp",
  className,
}: OtpInputProps) {
  const boxRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [boxes, setBoxes] = React.useState<string[]>(() =>
    toDigitBoxes(value, length),
  );
  const lastEmitted = React.useRef(boxes.join(""));

  React.useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setBoxes(toDigitBoxes(value, length));
  }, [value, length]);

  const commit = (next: string[]) => {
    setBoxes(next);
    const joined = next.join("");
    lastEmitted.current = joined;
    onChange(joined);
  };

  const focusBox = (index: number) => {
    const box = boxRefs.current[Math.max(0, Math.min(index, length - 1))];
    box?.focus();
    box?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const incoming = onlyDigits(raw);

    if (!incoming) {
      commit(clearDigit(boxes, index));
      return;
    }

    const result = writeDigits(boxes, index, incoming, length);
    commit(result.boxes);
    focusBox(result.cursor);
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const incoming = onlyDigits(event.clipboardData.getData("text")).slice(
      0,
      length,
    );
    if (!incoming) return;

    event.preventDefault();
    const start = incoming.length >= length ? 0 : index;
    const result = writeDigits(boxes, start, incoming, length);
    commit(result.boxes);
    focusBox(result.cursor);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      if (boxes[index]) return;
      event.preventDefault();
      commit(clearDigit(boxes, index - 1));
      focusBox(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {boxes.map((digit, index) => (
        <Input
          key={index}
          id={`${idPrefix}-${index}`}
          ref={(node) => {
            boxRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          maxLength={length}
          aria-label={`Digit ${index + 1} of ${length}`}
          className="h-11 w-10 text-center text-lg font-semibold md:h-12 md:w-12"
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
