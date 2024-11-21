import { useQuery } from "@tanstack/react-query";
import childrenService from "../../../firebase/services/childrenService";
import { Button, Form, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import { FormGroupItemsProps } from "../../../components/FormControl";
import Swal from "sweetalert2";
import IChild from "../../../interfaces/firebase/IChild";

export default function KidsListPage() {
  //   const [isOpenSaveModal, setIsOpenSaveModal] = useState<boolean>(false);
  //   const [selectedChildren, setSelectedChildren] =
  //     useState<IChild | null>(null);

  //   const [error, setError] = useState<string>("");
  //   const [form] = Form.useForm();
  const _childrenService = childrenService();

  const { data: childrens, refetch } = useQuery({
    queryKey: ["childrens"],
    queryFn: _childrenService.getAll,
    initialData: [],
  });
  //   const saveFromGroups: FormGroupItemsProps[] = [
  //     {
  //       name: "description",
  //       label: "Description",
  //       rules: [{ required: true, message: "Please input the description!" }],
  //       component: <Input />,
  //     },
  //   ];
  const columns: ColumnConfig[] = [
    {
      title: "Parent",
      dataIndex: "parentName",
      width: 400,
    },
    {
      title: "Name",
      dataIndex: "",
      width: 400,
      render: (data: IChild) => {
        if (data && data?.lastName && data?.firstName)
          return <span>{`${data?.lastName}, ${data?.firstName}`}</span>;
        return <span>-</span>;
      },
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
      width: 400,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      width: 400,
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      width: 400,
    },
    {
      title: "Food Allergies",
      dataIndex: "",
      width: 400,
      render: (data: IChild) => {
        // Check if data is defined and has the necessary properties
        if (data?.hasFoodAllergies) {
          return <span>{data.foodAllergies}</span>;
        }
        return (
          <span>
            <CloseCircleOutlined style={{ color: "red" }} />
          </span>
        );
      },
    },

    // {
    //   title: "Actions",
    //   render: (data: IChild) => (
    //     <>
    //       <Button
    //         type="primary"
    //         danger
    //         shape="circle"
    //         icon={<DeleteOutlined />}
    //         onClick={() => {
    //           setSelectedChildren(data);
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
    //           setSelectedChildren(data);
    //           setIsOpenSaveModal(true);
    //         }}
    //       />
    //     </>
    //   ),
    // },
  ];
  //   const handleDeleteConfirmation = () => {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Are you sure you want to delete?",
  //       showCancelButton: true,
  //       confirmButtonText: "Delete",
  //       confirmButtonColor: "red",
  //     }).then(async (result) => {
  //       if (result.isConfirmed && selectedChildren?.id) {
  //         await _childrenService.deleteById(selectedChildren.id);
  //         refetch();
  //         Swal.fire({
  //           icon: "success",
  //           title: "Successfully deleted",
  //           showConfirmButton: false,
  //           timer: 1500,
  //         });
  //       }
  //     });
  //   };
  //   const handleSave = async (values: IChild) => {
  //     setError("");
  //     try {
  //       if (selectedChildren) {
  //         await _childrenService.update(
  //           selectedChildren.id || "",
  //           values
  //         );
  //       } else {
  //         await _childrenService.ad(values);
  //       }
  //       Swal.fire({
  //         icon: "success",
  //         title: "Children successfully saved!",
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //     } catch (_e: any) {
  //       let e: Error = _e;
  //       setError(e.message);
  //       return;
  //     }

  //     refetch();
  //     setIsOpenSaveModal(false);
  //   };
  return (
    <>
      {/* <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setIsOpenSaveModal(true);
          setSelectedChildren(null);
        }}
      >
        Add Children
      </Button> */}

      {/* <ChildrenSaveModal
        form={form}
        handleSave={handleSave}
        setSelectedChildren={setSelectedChildren}
        selectedChildren={selectedChildren}
        isOpenSaveModal={isOpenSaveModal}
        setIsOpenSaveModal={setIsOpenSaveModal}
        saveFromGroups={saveFromGroups}
        error={error}
      /> */}
      <DataTable dataSource={childrens} columns={columns} />
    </>
  );
}
