import { Form, FormInstance, Modal } from "antd";
import FormGroupItems, {
  FormGroupItemsProps,
} from "../../../../components/FormControl";
import ITicketCategory from "../../../../interfaces/firebase/ITicketCategory";

interface SaveTicketCategoryModalProps {
  form: FormInstance<any>;
  handleSave: (value: any) => void;
  setSelectedTicketCategory: (
    value: React.SetStateAction<ITicketCategory | null>
  ) => void;
  selectedTicketCategory: ITicketCategory | null;
  setIsOpenSaveModal: (value: React.SetStateAction<boolean>) => void;
  isOpenSaveModal: boolean;
  error: string;
  saveFromGroups: FormGroupItemsProps[];
}

const TicketCategorySaveModal = (props: SaveTicketCategoryModalProps) => {
  const {
    form,
    handleSave,
    setSelectedTicketCategory,
    selectedTicketCategory,
    isOpenSaveModal,
    setIsOpenSaveModal,
    saveFromGroups,
    error,
  } = props;
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      await handleSave(values);
      form.resetFields();
      setSelectedTicketCategory(null);
    } catch (error) {
      console.error("Failed to save ticketCategory:", error);
    }
  };

  return (
    <Modal
      title={
        selectedTicketCategory
          ? "Update TicketCategory Information"
          : "Add New TicketCategory"
      }
      open={isOpenSaveModal}
      onOk={handleFormSubmit}
      okText="Save"
      onCancel={() => {
        setIsOpenSaveModal(false);
        form.resetFields();
        setSelectedTicketCategory(null);
      }}
    >
      <Form form={form} layout="vertical">
        <p className="text-danger">{error}</p>
        <FormGroupItems items={saveFromGroups} />
      </Form>
    </Modal>
  );
};

export default TicketCategorySaveModal;
