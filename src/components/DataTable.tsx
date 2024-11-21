import { useState, useEffect } from "react";
import { Table, Input, Select, Space, Button } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import type { ColumnsType } from "antd/es/table";
import type { TableProps } from "antd";
import React from "react";

export interface ColumnConfig {
  title: string;
  dataIndex: string;
  width?: number | string;
  fixed?: boolean | "left" | "right";
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

interface DataTableProps<T extends object>
  extends Omit<TableProps<T>, "columns"> {
  dataSource?: T[];
  columns?: ColumnConfig[];
  showReset?: boolean;
  searchPlaceholder?: string;
}

export default function DataTable<T extends object>({
  dataSource = [],
  columns = [],
  showReset = true,
  searchPlaceholder = "Search",
  ...restProps
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState<string>();
  const [filteredData, setFilteredData] = useState<T[]>([]);

  useEffect(() => {
    setFilteredData(dataSource);
  }, [dataSource]);

  const enhancedColumns: ColumnsType<T> = columns.map((column) => ({
    ...column,
    sorter: (a: any, b: any) => {
      const aValue = a[column.dataIndex];
      const bValue = b[column.dataIndex];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }
      return 0;
    },
    sortDirections: ["ascend", "descend"],
    onCell: () => ({
      style: {
        padding: "4px 8px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  }));

  const columnOptions = columns.map((column) => ({
    label: column.title,
    value: column.dataIndex,
  }));

  const handleSearch = (value: string, column?: string) => {
    setSearchText(value);

    if (!column || !value) {
      setFilteredData(dataSource);
      return;
    }

    const filtered = dataSource.filter((record: any) => {
      const cellValue = record[column];
      if (cellValue == null) return false;
      return String(cellValue).toLowerCase().includes(value.toLowerCase());
    });

    setFilteredData(filtered);
  };

  const handleColumnSelect = (value: string) => {
    setSearchColumn(value);
    handleSearch(searchText, value);
  };

  const handleReset = () => {
    setSearchText("");
    setSearchColumn(undefined);
    setFilteredData(dataSource);
  };
  const getTextFromRender = (render: any, record: any): string => {
    if (render) {
      const renderedValue = render(record, record, 0);

      // Check if the rendered value is a valid React element
      if (React.isValidElement(renderedValue)) {
        return extractTextFromReactElement(renderedValue);
      }

      // If not a React element, return the string value directly
      return String(renderedValue);
    }

    return "";
  };

  // Helper function to extract text from React elements
  const extractTextFromReactElement = (element: React.ReactNode): string => {
    if (typeof element === "string" || typeof element === "number") {
      return String(element); // If it's already a string or number, return it
    }

    if (React.isValidElement(element)) {
      // If it's a valid React element, recursively extract text from its children
      return React.Children.toArray(element.props.children)
        .map((child) => extractTextFromReactElement(child))
        .join(""); // Join children in case of nested elements
    }

    return ""; // Return empty string if unable to extract text
  };
  // Function to generate and download Excel report with the table columns
  const handleExportToExcel = () => {
    // Prepare data based on the columns
    const dataToExport = filteredData.map((record: any) => {
      const row: { [key: string]: any } = {};

      columns.forEach((column) => {
        console.log(getTextFromRender(column?.render, record));
        row[column.title] = column?.render
          ? getTextFromRender(column?.render, record)
          : record[column.dataIndex];
      });
      return row;
    });

    // Generate worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Export the file
    XLSX.writeFile(workbook, "Report.xlsx");
  };

  return (
    <div>
      <Space style={{ marginBottom: 8 }} className="d-flex justify-content-end">
        <Select
          style={{ width: 200 }}
          placeholder="Select column"
          allowClear
          options={columnOptions}
          onChange={handleColumnSelect}
          value={searchColumn}
          size="small"
        />
        <Input
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value, searchColumn)}
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          disabled={!searchColumn}
          size="small"
        />
        {showReset && (
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={!searchText && !searchColumn}
            size="small"
          >
            Reset
          </Button>
        )}
        <Button
          icon={<FileExcelOutlined />}
          onClick={handleExportToExcel}
          size="small"
        >
          Export to Excel
        </Button>
      </Space>

      <Table
        {...restProps}
        columns={enhancedColumns}
        dataSource={filteredData}
        size="small"
        pagination={{
          total: filteredData.length,
          pageSize: 8,
          showSizeChanger: false,
          size: "small",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          ...restProps.pagination,
        }}
      />
    </div>
  );
}
