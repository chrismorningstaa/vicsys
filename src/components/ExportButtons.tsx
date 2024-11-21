import React from 'react';
import { Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ColumnsType } from 'antd/es/table';

interface ExportButtonsProps<T> {
  data: T[];
  columns: ColumnsType<T>;
  fileName: string;
  title: string;
}

// Utility function to format data for export
const formatDataForExport = <T,>(data: T[], columns: ColumnsType<T>): Record<string, any>[] => {
  return data.map(item => {
    const formattedRow: Record<string, any> = {};
    columns.forEach((column: any) => {
      if (!column.title) return;
      
      if (column.render && column.dataIndex) {
        formattedRow[column.title] = column.render(item[column.dataIndex as keyof T], item);
      } else if (column.render) {
        formattedRow[column.title] = column.render(undefined, item);
      } else if (column.dataIndex) {
        formattedRow[column.title] = item[column.dataIndex as keyof T];
      }
    });
    return formattedRow;
  });
};

// Excel export function
export const exportToExcel = <T,>(
  data: T[],
  columns: ColumnsType<T>,
  fileName: string
): void => {
  const formattedData = formatDataForExport(data, columns);
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// PDF export function
export const exportToPDF = <T,>(
  data: T[],
  columns: ColumnsType<T>,
  fileName: string,
  title: string
): void => {
  // @ts-ignore
  const doc = new jsPDF();
  const formattedData = formatDataForExport(data, columns);
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Prepare table data
  const headers = columns
    .filter(col => col.title)
    .map(col => col.title as string);
  
  const rows = formattedData.map(item => 
    headers.map(header => item[header]?.toString() || '')
  );

  // @ts-ignore
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  doc.save(`${fileName}.pdf`);
};

// Export buttons component
export const ExportButtons = <T,>({ 
  data, 
  columns, 
  fileName, 
  title 
}: ExportButtonsProps<T>): JSX.Element => {
  return (
    <Space>
      <Button
        icon={<DownloadOutlined />}
        onClick={() => exportToExcel(data, columns, fileName)}
      >
        Export Excel
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={() => exportToPDF(data, columns, fileName, title)}
      >
        Export PDF
      </Button>
    </Space>
  );
};