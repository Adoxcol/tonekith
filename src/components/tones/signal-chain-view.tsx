import { Badge } from "@/components/ui/badge";

type Item = {
  item: {
    id: string;
    label: string;
    itemType: string;
    isEnabled: boolean;
    isSoftware: boolean;
    position: number;
  };
  equipment: { name: string } | null;
  parameters: Array<{
    key: string;
    valueNumber: number | null;
    valueBoolean: boolean | null;
    valueText: string | null;
    valueEnum: string | null;
  }>;
};

export function SignalChainView({ items }: { items: Item[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No signal chain defined yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {items.map(({ item, equipment, parameters }, idx) => (
        <li
          key={item.id}
          className={`border border-border/50 px-4 py-3 ${item.isEnabled ? "" : "opacity-50"}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{idx + 1}</span>
            <span className="font-medium">{item.label}</span>
            <Badge variant="outline">{item.itemType}</Badge>
            {item.isSoftware && <Badge variant="secondary">Software</Badge>}
            {!item.isEnabled && <Badge variant="destructive">Bypassed</Badge>}
            {equipment && (
              <span className="text-sm text-muted-foreground">{equipment.name}</span>
            )}
          </div>
          {parameters.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {parameters.map((p) => (
                <div key={p.key} className="text-sm">
                  <dt className="text-muted-foreground">{p.key}</dt>
                  <dd className="font-mono tabular-nums">
                    {p.valueNumber ??
                      p.valueEnum ??
                      p.valueText ??
                      (p.valueBoolean == null ? "—" : p.valueBoolean ? "on" : "off")}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </li>
      ))}
    </ol>
  );
}
