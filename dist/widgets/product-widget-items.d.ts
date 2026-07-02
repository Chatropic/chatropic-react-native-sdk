export interface ProductWidgetItem {
    category: string;
    id: string;
    image: string;
    name: string;
    price: string;
}
export declare function productWidgetItemsFromProps(props: Record<string, unknown>): ProductWidgetItem[];
export declare function canRenderProductWidget(component: string, props: Record<string, unknown>): boolean;
export declare function buildAddToCartMessage(item: ProductWidgetItem): string;
export declare function buildAddToCartDisplayMessage(item: ProductWidgetItem): string;
