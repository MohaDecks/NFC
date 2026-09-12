import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/types";

export function MenuItemRow({
  item,
  onEdit,
}: {
  item: Pick<MenuItem, "name" | "description" | "price" | "currency" | "imageUrl" | "available" | "featured">;
  onEdit?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition hover:bg-black/[0.03]"
    >
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-md bg-[#1b6b5a]/10" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className={`truncate text-sm font-medium ${item.available ? "" : "opacity-50"}`}>{item.name}</p>
          <span className="hidden flex-1 border-b border-dotted border-black/15 sm:block" />
          <p className="shrink-0 text-sm font-semibold tabular-nums text-[#1b6b5a]">
            {formatPrice(item.price, item.currency)}
          </p>
        </div>
        {(item.description || !item.available || item.featured) && (
          <p className="truncate text-[11px] text-muted-foreground">
            {item.description}
            {item.featured ? " · Featured" : ""}
            {!item.available ? " · Hidden" : ""}
          </p>
        )}
      </div>
    </button>
  );
}
