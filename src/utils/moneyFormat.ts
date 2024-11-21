export default function moneyFormat(money: number) {
  return new Intl.NumberFormat().format(money);
}
