import { useQuery } from "@tanstack/react-query";
import ticketCategoryService from "../../../firebase/services/ticketCategoryService";
import { Button, Form, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import { FormGroupItemsProps } from "../../../components/FormControl";
import Swal from "sweetalert2";
import ITicketCategory from "../../../interfaces/firebase/ITicketCategory";
import TicketCategorySaveModal from "./modals/TicketCategorySaveModal";
export default function TicketCategoryPage() {
  const [isOpenSaveModal, setIsOpenSaveModal] = useState<boolean>(false);
  const [selectedTicketCategory, setSelectedTicketCategory] =
    useState<ITicketCategory | null>(null);

  const [error, setError] = useState<string>("");
  const [form] = Form.useForm();
  const _ticketCategoryService = ticketCategoryService();

  const { data: ticketCategories, refetch } = useQuery({
    queryKey: ["ticketCategories", selectedTicketCategory],
    queryFn: _ticketCategoryService.getAll,
    initialData: [],
  });
  const saveFromGroups: FormGroupItemsProps[] = [
    {
      name: "description",
      label: "Description",
      rules: [{ required: true, message: "Please input the description!" }],
      component: <Input />,
    },
  ];
  const columns: ColumnConfig[] = [
    {
      title: "Description",
      dataIndex: "description",
      width: 600,
    },

    {
      title: "Actions",
      dataIndex: "",
      render: (data: ITicketCategory) => (
        <>
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedTicketCategory(data);
              handleDeleteConfirmation();
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => {
              form.setFieldsValue(data);
              setSelectedTicketCategory(data);
              setIsOpenSaveModal(true);
            }}
          />
        </>
      ),
    },
  ];
  const handleDeleteConfirmation = () => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure you want to delete?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
    }).then(async (result) => {
      if (result.isConfirmed && selectedTicketCategory?.id) {
        await _ticketCategoryService.deleteById(selectedTicketCategory.id);
        refetch();
        Swal.fire({
          icon: "success",
          title: "Successfully deleted",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  const handleSave = async (values: ITicketCategory) => {
    setError("");
    try {
      if (selectedTicketCategory) {
        await _ticketCategoryService.update(
          selectedTicketCategory.id || "",
          values
        );
      } else {
        await _ticketCategoryService.add(values);
      }
      Swal.fire({
        icon: "success",
        title: "TicketCategory successfully saved!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
      return;
    }

    refetch();
    setIsOpenSaveModal(false);
  };
  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setIsOpenSaveModal(true);
          setSelectedTicketCategory(null);
        }}
      >
        Add TicketCategory
      </Button>

      <TicketCategorySaveModal
        form={form}
        handleSave={handleSave}
        setSelectedTicketCategory={setSelectedTicketCategory}
        selectedTicketCategory={selectedTicketCategory}
        isOpenSaveModal={isOpenSaveModal}
        setIsOpenSaveModal={setIsOpenSaveModal}
        saveFromGroups={saveFromGroups}
        error={error}
      />
      <DataTable dataSource={ticketCategories} columns={columns} />
    </>
  );
}
