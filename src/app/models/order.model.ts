export interface Order {
  id?: number;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: string;
  orderDate: string;
}
