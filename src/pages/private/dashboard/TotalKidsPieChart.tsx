import { Chart, Pie, PieConfig } from "@ant-design/charts";
import childrenService from "../../../firebase/services/childrenService";
import { useQuery } from "@tanstack/react-query";
import IPieValue from "../../../interfaces/components/IPieValue";

export default function TotalKidsPieChart(props: { childrens: IPieValue[] }) {
  const { childrens } = props;

  const config: React.PropsWithoutRef<PieConfig> & React.RefAttributes<Chart> =
    {
      data: childrens,
      angleField: "value",
      colorField: "type",
      width: 450,
      height: 450,
      label: {
        text: "value",
        style: {
          fontWeight: "bold",
        },
      },
      legend: {
        color: {
          title: false,
          position: "right",
          rowPadding: 5,
        },
      },
    };
  return <Pie {...config} />;
}
