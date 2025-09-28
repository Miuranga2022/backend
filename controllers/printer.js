import escpos from "escpos";
import escposNetwork from "escpos-network";

escpos.Network = escposNetwork;

const PRINTER_IP = "192.168.8.197"; // change if needed
const PRINTER_PORT = 9100;         // default port

export function printBill(billData) {
  return new Promise((resolve, reject) => {
    try {
      const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
      const printer = new escpos.Printer(device);

      device.open(() => {
        const lineWidth = 48;

        const alignRow = (left, right) => {
          const spaceCount = Math.max(1, lineWidth - left.length - right.length);
          return left + " ".repeat(spaceCount) + right;
        };

        // === Header ===
        printer
          .align("CT")
          .style("B")
          .size(1, 1)
          .text("NEW KUMARA CURTAIN HOUSE")
          .style("NORMAL")
          .size(0, 0)
          .text("123 Main Street, Mawanella")
          .text("Tel: +94 74 274 7144")
          .text("=".repeat(lineWidth));

        // === Bill No & Date ===
        const billNoText = `Bill No: ${billData.billNo}`;
        const dateText = new Date().toLocaleString([], {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        printer.align("LT").text(alignRow(billNoText, dateText));
        printer.text("=".repeat(lineWidth));

        // === Customer Info ===
        if (billData.customerName) {
          printer
            .text(`Customer : ${billData.customerName}`)
            .text(`Mobile   : ${billData.customerMobile || "-"}`)
            .text(`Address  : ${billData.customerAddress || "-"}`);
        }
        if (billData.fixingDate) {
          printer.text(`Fixing Date : ${new Date(billData.fixingDate).toLocaleDateString()}`);
        }
        if (billData.customerName || billData.fixingDate) {
          printer.text("=".repeat(lineWidth));
        }

        // === Items Table Header ===
        printer.text(
          "Qty".padEnd(4) +
          "Item".padEnd(16) +
          "Price".padStart(10) +
          "Total".padStart(12)
        );
        printer.text("-".repeat(lineWidth));

        // === Items Rows ===
        billData.items.forEach((i) => {
          const qty = String(i.itemQuantity).padEnd(4, " ");
          const itemName = i.itemName.padEnd(16, " ").slice(0, 16);
          const price = i.itemRate.toFixed(2).padStart(10, " ");
          const total = i.total.toFixed(2).padStart(12, " ");
          printer.text(`${qty}${itemName}${price}${total}`);
        });

        printer.text("-".repeat(lineWidth));

        // === Totals Section ===
        printer.text(alignRow("Subtotal", billData.subTotal?.toFixed(2) || "0.00"));
        printer.text(alignRow("Discount", billData.discountAmount?.toFixed(2) || "0.00"));
        printer.text(alignRow("Grand Total", billData.grandTotal?.toFixed(2) || "0.00"));

        if (billData.billNo?.startsWith("ORD-")) {
          printer.text("-".repeat(lineWidth));

          // Check if previousPaid exists and is greater than 0
          if (billData.previousPaid && billData.previousPaid > 0) {
            printer.text(alignRow("Previously Paid", (billData.previousPaid ?? 0).toFixed(2)));
            printer.text(alignRow("Today Paid", (billData.todayPaid ?? 0).toFixed(2)));
            printer.text(alignRow("Remaining Balance", (billData.remainingBalance ?? 0).toFixed(2)));
          } else {
            // First-time bill: no previous paid, only show paid amount and remaining balance
            const paid = billData.paidAmount ?? 0;
            const remaining = (billData.grandTotal ?? 0) - paid;
            printer.text(alignRow("Paid Amount", paid.toFixed(2)));
            printer.text(alignRow("Remaining Balance", remaining.toFixed(2)));
          }
        }


        // === Footer ===
        printer
          .align("CT")
          .style("B")
          .text("Thank you for your purchase!")
          .style("NORMAL")
          .text("Please visit us again")
          .text("\n\n")
          .cut()
          .close();

        resolve("Printed successfully");
      });
    } catch (err) {
      reject(err);
    }
  });
}
