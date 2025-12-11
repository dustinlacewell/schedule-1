import React, { type JSX } from "react";
import { Box, Text } from "ink";

/* Table */

type Scalar = string | number | boolean | null | undefined;

type ScalarDict = {
  [key: string]: Scalar;
};

export type CellProps = React.PropsWithChildren<{ column: number }>;

export type TableProps<T extends ScalarDict> = {
  /**
   * List of values (rows).
   */
  data: T[];
  /**
   * Columns that we should display in the table.
   */
  columns: (keyof T)[];
  /**
   * Cell padding.
   */
  padding: number;
  /**
   * Header component.
   * Loosely typed to avoid friction with various React.FC shapes.
   */
  header: (props: any) => any;
  /**
   * Component used to render a cell in the table.
   */
  cell: (props: any) => any;
  /**
   * Component used to render the skeleton of the table.
   */
  skeleton: (props: any) => any;
};

/* Table */

export default class Table<T extends ScalarDict> extends React.Component<
  Pick<TableProps<T>, "data"> & Partial<TableProps<T>>
> {
  /**
   * Merges provided configuration with defaults.
   */
  getConfig(): TableProps<T> {
    return {
      data: this.props.data,
      columns: this.props.columns || this.getDataKeys(),
      padding: this.props.padding ?? 1,
      header: this.props.header || Header,
      cell: this.props.cell || Cell,
      skeleton: this.props.skeleton || Skeleton,
    };
  }

  /**
   * Gets all keys used in data by traversing through the data.
   */
  getDataKeys(): (keyof T)[] {
    const keys = new Set<keyof T>();

    for (const data of this.props.data) {
      for (const key in data) {
        keys.add(key);
      }
    }

    return Array.from(keys);
  }

  /**
   * Calculates the width of each column by finding the longest value in that column.
   */
  getColumns(): Column<T>[] {
    const { columns, padding } = this.getConfig();

    return columns.map((key) => {
      const headerWidth = String(key).length;
      const dataWidths = this.props.data.map((data) => {
        const value = data[key];
        if (value == null) return 0;
        return visibleLength(String(value));
      });

      const width = Math.max(headerWidth, ...dataWidths) + padding * 2;

      return {
        column: key,
        width,
        key: String(key),
      };
    });
  }

  /**
   * Returns a (data) row representing the headings.
   */
  getHeadings(): Partial<T> {
    const { columns } = this.getConfig();

    return columns.reduce<Partial<T>>(
      (acc, column) => ({ ...acc, [column]: column }),
      {},
    );
  }

  /* Rendering utilities */

  // The top most line in the table.
  header = row<T>({
    cell: this.getConfig().skeleton,
    padding: this.getConfig().padding,
    skeleton: {
      component: this.getConfig().skeleton,
      line: "─",
      left: "┌",
      right: "┐",
      cross: "┬",
    },
  });

  // The line with column names.
  heading = row<T>({
    cell: this.getConfig().header,
    padding: this.getConfig().padding,
    skeleton: {
      component: this.getConfig().skeleton,
      line: " ",
      left: "│",
      right: "│",
      cross: "│",
    },
    align: "center",
  });

  // The line that separates rows.
  // For your use case we don't want visible separators, so we simply
  // won't render this in the main render method.
  separator = row<T>({
    cell: this.getConfig().skeleton,
    padding: this.getConfig().padding,
    skeleton: {
      component: this.getConfig().skeleton,
      line: "─",
      left: "├",
      right: "┤",
      cross: "┼",
    },
  });

  // The row with the data.
  data = row<T>({
    cell: this.getConfig().cell,
    padding: this.getConfig().padding,
    skeleton: {
      component: this.getConfig().skeleton,
      line: " ",
      left: "│",
      right: "│",
      cross: "│",
    },
  });

  // The bottom most line of the table.
  footer = row<T>({
    cell: this.getConfig().skeleton,
    padding: this.getConfig().padding,
    skeleton: {
      component: this.getConfig().skeleton,
      line: "─",
      left: "└",
      right: "┘",
      cross: "┴",
    },
  });

  render() {
    const columns = this.getColumns();
    const headings = this.getHeadings();

    return (
      <Box flexDirection="column">
        {/* Header */}
        {this.header({ key: "header", columns, data: {} })}
        {this.heading({ key: "heading", columns, data: headings })}
        {/* Data rows without separators between them */}
        {this.props.data.map((row, index) => {
          const key = `row-${index}`;

          return (
            <Box flexDirection="column" key={key}>
              {this.data({ key: `data-${key}`, columns, data: row })}
            </Box>
          );
        })}
        {/* Footer */}
        {this.footer({ key: "footer", columns, data: {} })}
      </Box>
    );
  }
}

/* Helper components */

type RowConfig = {
  cell: (props: any) => any;
  padding: number;
  skeleton: {
    component: (props: any) => any;
    left: string;
    right: string;
    cross: string;
    line: string;
  };
  align?: "left" | "center";
};

type RowProps<T extends ScalarDict> = {
  key: string;
  data: Partial<T>;
  columns: Column<T>[];
};

type Column<T> = {
  key: string;
  column: keyof T;
  width: number;
};

function row<T extends ScalarDict>(
  config: RowConfig,
): (props: RowProps<T>) => JSX.Element {
  const skeleton = config.skeleton;

  return (props) => (
    <Box flexDirection="row">
      {/* Left */}
      <skeleton.component>{skeleton.left}</skeleton.component>
      {/* Data */}
      {...intersperse(
        (i) => {
          const key = `${props.key}-hseparator-${i}`;
          return (
            <skeleton.component key={key}>{skeleton.cross}</skeleton.component>
          );
        },
        props.columns.map((column, colI) => {
          const value = props.data[column.column];

          if (value == null) {
            const key = `${props.key}-empty-${column.key}`;
            return (
              <config.cell key={key} column={colI}>
                {skeleton.line.repeat(column.width)}
              </config.cell>
            );
          } else {
            const key = `${props.key}-cell-${column.key}`;
            const valueText = String(value);

            let ml = config.padding;
            let mr = column.width - visibleLength(valueText) - config.padding;

            if (config.align === "center") {
              const totalInner = column.width - visibleLength(valueText);
              ml = Math.floor(totalInner / 2);
              mr = totalInner - ml;
            }

            return (
              <config.cell key={key} column={colI}>
                {`${skeleton.line.repeat(ml)}${valueText}${skeleton.line.repeat(mr)}`}
              </config.cell>
            );
          }
        }),
      )}
      {/* Right */}
      <skeleton.component>{skeleton.right}</skeleton.component>
    </Box>
  );
}

export function Header(props: React.PropsWithChildren<{}>) {
  return (
    <Text bold color="blue">
      {props.children}
    </Text>
  );
}

export function Cell(props: CellProps) {
  return <Text>{props.children}</Text>;
}

export function Skeleton(props: React.PropsWithChildren<{}>) {
  return <Text bold>{props.children}</Text>;
}

function intersperse<T, I>(
  intersperser: (index: number) => I,
  elements: T[],
): (T | I)[] {
  let interspersed: (T | I)[] = elements.reduce<(T | I)[]>(
    (acc, element, index) => {
      if (acc.length === 0) return [element];
      return [...acc, intersperser(index), element];
    },
    [],
  );

  return interspersed;
}

// Utility: measure visible length of a string by stripping ANSI color codes.
const ANSI_REGEX = /\u001B\[[0-9;]*m/g;

function visibleLength(text: string): number {
  return text.replace(ANSI_REGEX, "").length;
}
