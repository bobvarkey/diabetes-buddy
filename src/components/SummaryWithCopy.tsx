import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SummaryItem {
  label: string;
  value: string;
}

interface PageSummaryProps {
  title?: string;
  items: SummaryItem[];
  icon?: string; // emoji optionally
}

export function PageSummaryBar({ title, items, icon }: PageSummaryProps) {
  const [copied, setCopied] = useState(false);

  const formatForClipboard = () => {
    const lines = [];
    if (title) lines.push(title);
    items.forEach(item => {
      lines.push(`${item.label}: ${item.value}`);
    });
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatForClipboard());
      setCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  if (items.length === 0) return null;

  // Show preview of first item + Copy button at bottom
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Summary Preview - truncated */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-600 truncate font-medium">
            {icon && `${icon} `}{title || "Results"}: {items[0]?.value || "..."} 
            {items.length > 1 && <span className="text-slate-400">+{items.length - 1} more</span>}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
      </div>
      {/* Spacer for content */}
      <div className="h-9" />
    </div>
  );
}

// No results? Return empty to avoid showing when inactive:
export default function PageSummaryWrapper({ title, items }: Partial<PageSummaryProps>) {
  if (!items || items.length === 0) return null;
  return <PageSummaryBar title={title} items={items} />;
}
