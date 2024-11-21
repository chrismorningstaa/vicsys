import { useQuery } from "@tanstack/react-query";
import { ColumnsType } from "antd/es/table";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import useUserContext from "../../../contexts/useUserContext";
import childrenService from "../../../firebase/services/childrenService";
import IChild from "../../../interfaces/firebase/IChild";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  // DeleteOutlined,
  // EditOutlined,
  // PlusOutlined,
} from "@ant-design/icons";
// import MyKidSaveModal from "./modal/MyKidSaveModal";
// import { useState } from "react";
// import { Button, Form } from "antd";
// import Swal from "sweetalert2";

export default function MyKidsPage() {
  const { user } = useUserContext();
  const _childrenService = childrenService();
  const { data: children, refetch } = useQuery({
    queryKey: ["children"],
    queryFn: async () => await _childrenService.getByUserId(user?.uid ?? ""),
  });
  // const [form] = Form.useForm();
  // const [isSaveModalVisible, setIsSaveModalVisible] = useState<boolean>(false);
  // const [selectedChild, setSelectedChild] = useState<IChild | null>(null);
  const columns: ColumnConfig[] = [
    {
      title: "Name",
      dataIndex: "",
      width: 600,
      render: (data: IChild) => (
        <span>{`${data.lastName}, ${data.lastName}`}</span>
      ),
    },
    {
      title: "nickname",
      dataIndex: "nickname",
      width: 600,
    },
    {
      title: "gender",
      dataIndex: "gender",
      width: 600,
    },
    {
      title: "birthday",
      dataIndex: "birthday",
      width: 600,
    },
    {
      title: "Food Allergies",
      dataIndex: "",
      width: 600,
      render: (data: IChild) => (
        <>
          {data.hasFoodAllergies ? (
            <>
              <CheckCircleOutlined style={{ color: "green" }} />{" "}
              {data.foodAllergies}
            </>
          ) : (
            <CloseCircleOutlined style={{ color: "red" }} />
          )}
        </>
      ),
    },

    // {
    //   title: "Actions",
    //   width: 600,
    //   render: (data: IChild) => (
    //     <>
    //       <Button
    //         type="primary"
    //         danger
    //         shape="circle"
    //         icon={<DeleteOutlined />}
    //         onClick={() => {
    //           setSelectedChild(data);
    //           handleDeleteConfirmation();
    //         }}
    //       />
    //       <Button
    //         type="primary"
    //         shape="circle"
    //         icon={<EditOutlined />}
    //         style={{ marginLeft: 8 }}
    //         onClick={() => {
    //           form.setFieldsValue(data);
    //           setSelectedChild(data);
    //           setIsSaveModalVisible(true);
    //         }}
    //       />
    //     </>
    //   ),
    // },
  ];
  // const handleDeleteConfirmation = () => {
  //   Swal.fire({
  //     icon: "warning",
  //     title: "Are you sure you want to delete?",
  //     showCancelButton: true,
  //     confirmButtonText: "Delete",
  //     confirmButtonColor: "red",
  //   }).then(async (result) => {
  //     if (result.isConfirmed && selectedChild?.id) {
  //       await _childrenService.deleteById(selectedChild.id);
  //       refetch();
  //       Swal.fire({
  //         icon: "success",
  //         title: "Successfully deleted",
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //     }
  //   });
  // };
  return (
    <>
      {/* <MyKidSaveModal
        form={form}
        isOpen={isSaveModalVisible}
        setIsOpen={setIsSaveModalVisible}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        refetch={refetch}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setIsSaveModalVisible(true);
          setSelectedChild(null);
        }}
      >
        Add Kid
      </Button> */}
      <DataTable dataSource={children} columns={columns} />
    </>
  );
}
