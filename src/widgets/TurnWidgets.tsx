import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ColorScheme } from "../types";
import { themeSurfaceColors } from "../theme/resolve-colors";
import {
  buildAddToCartDisplayMessage,
  buildAddToCartMessage,
  productWidgetItemsFromProps,
  type ProductWidgetItem,
} from "./product-widget-items";

interface NavigationCardProps {
  label: string;
  path: string;
  requiresAuth?: boolean;
  colorScheme: ColorScheme;
  onNavigate: (path: string) => void;
}

export function NavigationCard({
  label,
  path,
  requiresAuth,
  colorScheme,
  onNavigate,
}: NavigationCardProps) {
  const surfaces = themeSurfaceColors(colorScheme);
  const chipText = `Go to ${label}`;

  return (
    <Pressable
      onPress={() => onNavigate(path)}
      accessibilityLabel={
        requiresAuth
          ? `${chipText}. You may need to sign in first.`
          : chipText
      }
      style={[
        styles.chip,
        {
          borderColor: surfaces.border,
          backgroundColor: colorScheme === "dark" ? "#18181B" : "#FFFFFF",
        },
      ]}
    >
      <Text style={[styles.text, { color: surfaces.foreground }]}>
        {chipText}
      </Text>
    </Pressable>
  );
}

interface UnknownWidgetFallbackProps {
  component: string;
  props: Record<string, unknown>;
  colorScheme: ColorScheme;
}

export function UnknownWidgetFallback({
  component,
  props,
  colorScheme,
}: UnknownWidgetFallbackProps) {
  const [expanded, setExpanded] = useState(false);
  const surfaces = themeSurfaceColors(colorScheme);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: surfaces.border,
          backgroundColor: colorScheme === "dark" ? "#18181B" : "#FAFAFA",
        },
      ]}
    >
      <Pressable onPress={() => setExpanded((v) => !v)}>
        <Text style={[styles.title, { color: surfaces.foreground }]}>
          {component}
        </Text>
        <Text style={[styles.hint, { color: surfaces.muted }]}>
          {expanded ? "Tap to collapse" : "Tap to view payload"}
        </Text>
      </Pressable>
      {expanded ? (
        <Text style={[styles.json, { color: surfaces.muted }]}>
          {JSON.stringify(props, null, 2)}
        </Text>
      ) : null}
    </View>
  );
}

interface ProductListWidgetProps {
  component: string;
  props: Record<string, unknown>;
  colorScheme: ColorScheme;
  disabled?: boolean;
  onAddToCart?: (
    message: string,
    item: ProductWidgetItem,
    displayMessage: string,
  ) => void;
}

export function ProductListWidget({
  component,
  props,
  colorScheme,
  disabled,
  onAddToCart,
}: ProductListWidgetProps) {
  const surfaces = themeSurfaceColors(colorScheme);
  const items = productWidgetItemsFromProps(props);
  const title =
    typeof props.title === "string" && props.title.trim()
      ? props.title.trim()
      : typeof props.widgetName === "string" && props.widgetName.trim()
        ? props.widgetName.trim()
        : component === "CustomWidget"
          ? "Products"
          : component;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: surfaces.border,
          backgroundColor: colorScheme === "dark" ? "#18181B" : "#FFFFFF",
        },
      ]}
    >
      <Text style={[styles.title, { color: surfaces.foreground }]}>
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productRow}
      >
        {items.map((item, index) => (
          <View
            key={item.id || `${item.name}-${index}`}
            style={[
              styles.productCard,
              {
                borderColor: surfaces.border,
                backgroundColor:
                  colorScheme === "dark" ? "#111113" : "#FAFAFA",
              },
            ]}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                accessibilityLabel={item.name}
                style={styles.productImage}
              />
            ) : null}
            <Text
              numberOfLines={2}
              style={[styles.productName, { color: surfaces.foreground }]}
            >
              {item.name}
            </Text>
            {item.category ? (
              <Text
                numberOfLines={1}
                style={[styles.productCategory, { color: surfaces.muted }]}
              >
                {item.category}
              </Text>
            ) : null}
            {item.price ? (
              <Text
                style={[styles.productPrice, { color: surfaces.foreground }]}
              >
                {item.price}
              </Text>
            ) : null}
            <Pressable
              disabled={disabled}
              onPress={() =>
                onAddToCart?.(
                  buildAddToCartMessage(item),
                  item,
                  buildAddToCartDisplayMessage(item),
                )
              }
              accessibilityLabel={`Add ${item.name || "product"} to cart`}
              style={({ pressed }: { pressed: boolean }) => [
                styles.addButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#FFFFFF" : "#18181B",
                  opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.addButtonText,
                  { color: colorScheme === "dark" ? "#18181B" : "#FFFFFF" },
                ]}
              >
                Add to Cart
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  text: {
    fontSize: 13,
  },
  card: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    maxWidth: "95%",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
  json: {
    fontSize: 10,
    fontFamily: "Menlo",
    marginTop: 8,
  },
  productRow: {
    gap: 10,
    paddingTop: 10,
    paddingRight: 4,
  },
  productCard: {
    width: 148,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  productImage: {
    width: "100%",
    height: 88,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#E5E7EB",
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    minHeight: 34,
  },
  productCategory: {
    fontSize: 11,
    marginTop: 3,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  addButton: {
    minHeight: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
