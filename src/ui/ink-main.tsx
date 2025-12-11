import React, { useState } from "react";
import { Box, Newline, render, Spacer, Text, useInput } from "ink";
import Table from "./table.js";

import type { StoreStock } from "../exchange.js";
import { buyItems, sellItems, itemCount } from "../player.js";
import { player } from "../state.js";
import chalk from "chalk";

export const pharmacy: StoreStock = {
  "diazepam": { quantity: 10, price: 50 },
  "paracetamol": { quantity: 20, price: 10 },
  "ibuprofen": { quantity: 15, price: 15 },
  "codeine": { quantity: 5, price: 100 },
  "amoxicillin": { quantity: 8, price: 80 },
}

type Props = {
  stock: StoreStock
}

const BuySellMenu: React.FC<Props> = ({ stock }) => {

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [items, setItems] = useState<StoreStock>(stock);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const keys = Object.keys(items);

  useInput((_input, key) => {
    setErrorKey(null);

    if (key.upArrow) {
      setSelectedIndex((prev: number) => (prev - 1 + keys.length) % keys.length);
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev: number) => (prev + 1) % keys.length);
      return;
    }

    if (key.leftArrow) {
      setItems((prev: StoreStock) => {
        const itemKey = keys[selectedIndex]! as keyof typeof items;
        const item = stock[itemKey]!;

        if (!sellItems(itemKey, item.price, 1)) {
          setErrorKey(itemKey as string);
          return prev
        }

        item.quantity += 1;

        return { ...stock };
      });

      return;
    }

    if (key.rightArrow) {
      setItems((prev: StoreStock) => {
        const itemKey = keys[selectedIndex]! as keyof typeof items;
        const item = stock[itemKey]!;

        if (item.quantity <= 0) {
          setErrorKey(itemKey as string);
          return prev;
        }

        if (!buyItems(itemKey, item.price, 1)) {
          setErrorKey(itemKey as string);
          return prev;
        }

        item.quantity -= 1;

        return { ...stock };
      });

      return;
    }
  });

  const data = keys.map((itemKey, index) => {
    const isSelected = index === selectedIndex;
    const item = items[itemKey]!;
    const isError = errorKey === itemKey;
    const hasCount = itemCount(itemKey);

    const prefix = isSelected ? "> " : "  ";

    return {
      name: isError
        ? chalk.red(prefix + itemKey)
        : isSelected
          ? chalk.cyan(prefix + itemKey)
          : prefix + itemKey,
      price: '$' + String(item.price),
      stock: String(item.quantity),
      owned: String(hasCount),
    };
  });

  const Skeleton: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
    <Text>{children}</Text>
  );

  return (
    <Table
      data={data}
      columns={["name", "price", "stock", "owned"]}
      padding={1}
      skeleton={Skeleton}
    />
  );
};

export default BuySellMenu;

render(
  <Box flexDirection="row" borderStyle="classic" minWidth="60" width="60" minHeight="20" height="20">
    <Box flexDirection="column">
      <Text>------------------------------------------------------------------------------------------------------------------------------------------------------------------------</Text>
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
      <Newline />
    </Box>
    <Box flexDirection="column" paddingLeft={1}>
      <Text>Money: {chalk.green('$' + player.money)}</Text>
      <Spacer />
      <BuySellMenu stock={pharmacy} />
    </Box>
  </Box>
)