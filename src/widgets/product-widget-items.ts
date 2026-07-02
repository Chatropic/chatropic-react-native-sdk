export interface ProductWidgetItem {
  category: string;
  id: string;
  image: string;
  name: string;
  price: string;
}

function itemsFromData(data: unknown): unknown[] {
  if (data && typeof data === "object") {
    const items = (data as Record<string, unknown>).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

export function productWidgetItemsFromProps(
  props: Record<string, unknown>,
): ProductWidgetItem[] {
  const source: unknown[] = Array.isArray(props.items)
    ? props.items
    : props.defaultData
      ? itemsFromData(props.defaultData)
      : props.default_data
        ? itemsFromData(props.default_data)
        : [];

  return source
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .map((item) => ({
      category: String(item.category ?? ""),
      id: String(item.id ?? item.name ?? ""),
      image: String(item.image ?? item.imageUrl ?? item.image_url ?? ""),
      name: String(item.name ?? item.title ?? ""),
      price: String(item.price ?? ""),
    }))
    .filter((item) => item.name || item.price || item.image);
}

export function canRenderProductWidget(
  component: string,
  props: Record<string, unknown>,
): boolean {
  const normalized = component.toLowerCase();
  return (
    normalized === "productcarousel" ||
    normalized === "productlist" ||
    normalized === "productresults" ||
    (normalized === "customwidget" &&
      productWidgetItemsFromProps(props).length > 0)
  );
}

export function buildAddToCartMessage(item: ProductWidgetItem): string {
  const parts = [
    "Add this product to my cart",
    item.id ? `product_id: ${item.id}` : "",
    item.id ? `id: ${item.id}` : "",
    item.name ? `name: ${item.name}` : "",
    item.price ? `price: ${item.price}` : "",
    item.category ? `type: ${item.category}` : "",
    "quantity: 1",
  ].filter(Boolean);
  return parts.join(". ") + ".";
}

export function buildAddToCartDisplayMessage(item: ProductWidgetItem): string {
  return `Add ${item.name || "this product"} to my cart.`;
}
