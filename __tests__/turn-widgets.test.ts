import {
  buildAddToCartDisplayMessage,
  buildAddToCartMessage,
  canRenderProductWidget,
  productWidgetItemsFromProps,
} from "../src/widgets/product-widget-items";

describe("product widgets", () => {
  it("reads Pricepally-shaped items", () => {
    const items = productWidgetItemsFromProps({
      items: [
        {
          category: "Vegetables",
          id: "1",
          image: "https://example.com/ugu.jpg",
          name: "Ugu",
          price: "₦619 - ₦6,759",
        },
      ],
    });

    expect(items).toEqual([
      {
        category: "Vegetables",
        id: "1",
        image: "https://example.com/ugu.jpg",
        name: "Ugu",
        price: "₦619 - ₦6,759",
      },
    ]);
  });

  it("can render custom widgets with product items", () => {
    expect(
      canRenderProductWidget("CustomWidget", {
        defaultData: {
          items: [{ id: "2", name: "Onions - Red", price: "₦359 - ₦104,099" }],
        },
      }),
    ).toBe(true);
  });

  it("builds an add-to-cart message with procedure-friendly fields", () => {
    const item = {
      category: "Vegetables",
      id: "2",
      image: "https://example.com/onions.jpg",
      name: "Onions - Red",
      price: "₦359 - ₦104,099",
    };

    expect(buildAddToCartMessage(item)).toBe(
      "Add this product to my cart. product_id: 2. id: 2. name: Onions - Red. price: ₦359 - ₦104,099. type: Vegetables. quantity: 1.",
    );
    expect(buildAddToCartDisplayMessage(item)).toBe(
      "Add Onions - Red to my cart.",
    );
  });
});
