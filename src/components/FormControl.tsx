import { ReactElement } from "react";
import { Form, FormItemProps } from "antd";

export type FormGroupItemsProps = FormItemProps & {
  component: ReactElement;
};
export default function FormGroupItems({
  items,
}: {
  items: FormGroupItemsProps[];
}) {
  return items.map((item) => {
    const { component, ...rest } = item;
    return <Form.Item {...rest}>{component}</Form.Item>;
  });
}
