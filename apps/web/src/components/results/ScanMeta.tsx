import { Globe, Clock, Zap } from "lucide-react";
import { ScanMeta as ScanMetaType } from "@/types";
import { formatUrl, formatDate, formatMs } from "@/lib/utils";

interface Props { meta: ScanMetaType; }

export function ScanMeta({ meta }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-brand-400" />
        <a
          href={meta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold hover:text-brand-500 transition-colors"
        >
          {formatUrl(meta.url)}
        </a>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(meta.scannedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          {formatMs(meta.responseTime)}
        </span>
      </div>
    </div>
  );
}
