"use client";

import type { Transaction } from "@/types/database";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n));
}

export default function ExportButtons({
  transactions,
  account,
}: {
  transactions: Transaction[];
  account: string;
}) {
  function exportCsv() {
    const header = ["Date", "Type", "Catégorie", "Montant (FCFA)", "Compte", "Note"];
    const rows = transactions.map((t) => [
      t.date,
      t.type === "income" ? "Revenu" : "Dépense",
      t.category,
      String(t.amount),
      t.account === "personal" ? "Personnel" : "Habynex",
      t.note ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // BOM pour un affichage correct des accents dans Excel
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${account}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(
      `Transactions — ${account === "personal" ? "Personnel" : "Habynex"}`,
      14,
      16
    );
    doc.setFontSize(9);
    doc.text(new Date().toLocaleDateString("fr-FR"), 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [["Date", "Type", "Catégorie", "Montant", "Note"]],
      body: transactions.map((t) => [
        t.date,
        t.type === "income" ? "Revenu" : "Dépense",
        t.category,
        `${t.type === "income" ? "+" : "-"}${formatFcfa(t.amount)} FCFA`,
        t.note ?? "",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [31, 77, 61] },
    });

    doc.save(`transactions-${account}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCsv}
        className="text-xs border border-line rounded-md px-3 py-1.5 bg-white"
      >
        Export CSV
      </button>
      <button
        onClick={exportPdf}
        className="text-xs border border-line rounded-md px-3 py-1.5 bg-white"
      >
        Export PDF
      </button>
    </div>
  );
}
