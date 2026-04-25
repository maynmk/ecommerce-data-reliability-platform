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
}: {
  columns: ColumnDef<Row>[];
  rows: Row[];
  caption?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {caption ? (
            <caption className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
              {caption}
            </caption>
          ) : null}
          <thead className="border-b border-zinc-200 bg-zinc-50/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={[
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600",
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
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  Sem dados para exibir.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/70"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={[
                        "px-4 py-3 align-top text-zinc-800",
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
