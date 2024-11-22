import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

interface PrintButtonProps {
  tableId: string;
  title: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ tableId, title }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableElement = document.getElementById(tableId);
    if (!tableElement) return;

    const tableHTML = tableElement.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            h1 { text-align: center; color: #333; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${tableHTML}
          <script>
            window.onload = () => {
              window.print();
              window.onfocus = () => window.close();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Button icon={<PrinterOutlined />} onClick={handlePrint} className="ml-2">
      Print
    </Button>
  );
};

export default PrintButton;
