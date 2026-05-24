import { useState } from "react";
import { Copy, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SummaryData {
  title: string;
  items: Array<{ label: string; value: string }>;
}

interface ShareableSummaryProps {
  summary: SummaryData;
}

export function ShareableSummary({ summary }: ShareableSummaryProps) {
  const [copied, setCopied] = useState(false);

  const formatSummary = () => {
    const lines = [`${summary.title}`, ""];
    summary.items.forEach(item => {
      lines.push(`• ${item.label}: ${item.value}`);
    });
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatSummary());
      setCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-lg z-50">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="text-xs text-slate-600 truncate flex-1">
          {summary.items[0]?.label}: {summary.items[0]?.value}...
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShareableSummary;
