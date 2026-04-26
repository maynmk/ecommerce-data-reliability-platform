import * as React from "react";

export type ColumnDef<Row extends Record<string, unknown>> = {
  key: keyof Row | string;
  header: string;
  className?: string;
  render?: (row: Row) => React.ReactNode;
};

export function DataTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  caption,
  emptyMessage = "Sem dados para exibir.",
}: {
  columns: ColumnDef<Row>[];
  rows: Row[];
  caption?: string;
  emptyMessage?: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-emerald-500/15 bg-zinc-950/25 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {caption ? (
            <caption className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
              {caption}
            </caption>
          ) : null}
          <thead className="border-b border-emerald-500/10 bg-zinc-950/35">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={[
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-300",
                    col.className ?? "",
                  ].join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-zinc-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-emerald-500/5 last:border-b-0 hover:bg-emerald-500/5"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={[
                        "px-4 py-2.5 align-top text-zinc-100",
                        col.className ?? "",
                      ].join(" ")}
                    >
                      {col.render
                        ? col.render(row)
                        : String(
                            (row as Record<string, unknown>)[String(col.key)] ?? "",
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
