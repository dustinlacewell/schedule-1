import React from "react";

export type AsciiTableColumn<T> = {
  key: keyof T;
  label: string;
};

export type AsciiTableProps<T> = {
  columns: AsciiTableColumn<T>[];
  rows: T[];
  selectedIndex?: number;
  errorIndex?: number | null | undefined;
};

export function AsciiTable<T extends Record<string, unknown>>({
  columns,
  rows,
  selectedIndex,
  errorIndex,
}: AsciiTableProps<T>) {
  return (
    <pre className="text-xs leading-snug whitespace-pre">
      {rows.map((row, index) => {
        const isSelected = index === selectedIndex;
        const isError = index === errorIndex;
        const cells = columns.map((col) => String(row[col.key] ?? ""));
        let line = cells.join("  ");
        if (isError) line = `! ${line}`;
        else if (isSelected) line = `> ${line}`;
        else line = `  ${line}`;
        return <div key={index}>{line}</div>;
      })}
    </pre>
  );
}
