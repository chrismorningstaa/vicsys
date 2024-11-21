import { Form, Image, Input } from "antd";
import useEventContext from "../useEventContext";

export default function EventImageUpload(props: { initialSrc?: string }) {
  const { initialSrc = "" } = props;
  const { imageUpload, setImageUpload } = useEventContext();
  return (
    <Form.Item name="image">
      {(imageUpload || initialSrc) && (
        <Image
          src={imageUpload ? URL.createObjectURL(imageUpload) : initialSrc}
          alt="Uploaded"
          style={{ width: 300, height: 150 }}
        />
      )}
      <Input
        accept="image/png,image/jpeg"
        type="file"
        value={""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) {
            setImageUpload(e.target.files[0]);
          }
        }}
      />
    </Form.Item>
  );
}
