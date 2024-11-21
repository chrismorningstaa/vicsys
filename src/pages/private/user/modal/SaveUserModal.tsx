import { Badge, Button, Form, FormInstance, Modal } from "antd";
import FormGroupItems, {
  FormGroupItemsProps,
} from "../../../../components/FormControl";
import { IUser } from "../../../../interfaces/firebase/IUser";
import IChild from "../../../../interfaces/firebase/IChild";

interface SaveUserModalProps {
  form: FormInstance<any>;
  handleSave: (value: any) => void;
  setSelectedUser: (value: React.SetStateAction<IUser | null>) => void;
  selectedUser: IUser | null;
  setIsOpenSaveModal: (value: React.SetStateAction<boolean>) => void;
  isOpenSaveModal: boolean;
  error: string;
  setIsChildrenModalVisible: (value: React.SetStateAction<boolean>) => void;
  updateFromGroups: FormGroupItemsProps[];
  addFormGroups: FormGroupItemsProps[];
  children: IChild[];
}

const SaveUserModal = (props: SaveUserModalProps) => {
  const {
    form,
    handleSave,
    setSelectedUser,
    selectedUser,
    isOpenSaveModal,
    setIsOpenSaveModal,
    setIsChildrenModalVisible,
    updateFromGroups,
    addFormGroups,
    children,
    error,
  } = props;
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      await handleSave(values);
      form.resetFields();
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  return (
    <Modal
      title={selectedUser ? "Update User Information" : "Add New User"}
      open={isOpenSaveModal}
      onOk={handleFormSubmit}
      okText="Save"
      onCancel={() => {
        setIsOpenSaveModal(false);
        form.resetFields();
        setSelectedUser(null);
      }}
    >
      <Form form={form} layout="vertical">
        <FormGroupItems
          items={selectedUser ? updateFromGroups : addFormGroups}
        />
        <Form.Item>
          <Badge count={children.length} color="blue" showZero>
            <Button
              block
              onClick={() => {
                setIsChildrenModalVisible(true);
              }}
            >
              Your Children
            </Button>
          </Badge>
        </Form.Item>
      </Form>
      <p className="text-danger">{error}</p>
    </Modal>
  );
};

export default SaveUserModal;
