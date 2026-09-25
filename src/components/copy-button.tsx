import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function copyText(value: string, ok = "Skopiowano") {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(ok);
    return true;
  } catch {
    toast.error("Nie udało się skopiować");
    return false;
  }
}

export function CopyButton({
  value,
  label = "Kopiuj",
  done = "Skopiowano",
  className,
}: {
  value: string;
  label?: string;
  done?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("min-w-0", className)}
      onClick={async () => {
        const ok = await copyText(value, done);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Skopiowano" : label}
    </Button>
  );
}
