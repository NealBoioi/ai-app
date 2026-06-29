export type OrderStatus =
  | "Pending Plant Review"
  | "Approved"
  | "In Production"
  | "Awaiting Shipment"
  | "Shipped"
  | "Delivered";

export type OrderRiskLevel = "Low" | "Medium" | "High";
export type OrderUnitOfMeasure = "EA" | "FT" | "M" | "LB" | "PK" | "Other";

export type Order = {
  id: string;
  customer: string;
  branchPoNumber: string;
  customerPoNumber: string;
  shipToAddress: string;
  requestedDeliveryDate: string;
  partNumber: string;
  revision: string;
  product: string;
  productDescription: string;
  quantity: number;
  unitOfMeasure: OrderUnitOfMeasure | string;
  unitPrice: number;
  extendedPrice: number;
  suggestedLeadTime: string;
  committedLeadTime: string;
  riskLevel: OrderRiskLevel;
  status: OrderStatus;
  createdAt: string;
  price?: number;
  leadTime?: string;
};

const STORAGE_KEY = "quoteportal:orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(`quoteportal:${STORAGE_KEY}`);
    const parsed = rawValue ? (JSON.parse(rawValue) as Order[]) : [];
    return parsed.map((order) => ({
      ...order,
      customer: order.customer || "",
      branchPoNumber: order.branchPoNumber || "",
      customerPoNumber: order.customerPoNumber || "",
      shipToAddress: order.shipToAddress || "",
      requestedDeliveryDate: order.requestedDeliveryDate || "",
      partNumber: order.partNumber || "",
      revision: order.revision || "REV A",
      product: order.product || order.productDescription || "",
      productDescription: order.productDescription || order.product || "",
      quantity: order.quantity || 0,
      unitOfMeasure: order.unitOfMeasure || "EA",
      unitPrice: order.unitPrice || 0,
      extendedPrice: order.extendedPrice || (order.quantity || 0) * (order.unitPrice || 0),
      suggestedLeadTime: order.suggestedLeadTime || order.leadTime || "",
      committedLeadTime: order.committedLeadTime || order.leadTime || "",
      riskLevel: order.riskLevel || "Medium",
      createdAt: order.createdAt || new Date().toISOString(),
      price: order.price || order.extendedPrice || 0,
      leadTime: order.leadTime || order.committedLeadTime || order.suggestedLeadTime || "",
    }));
  } catch {
    return [];
  }
}

export function createOrder(order: Omit<Order, "id" | "createdAt">): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    product: order.product || order.productDescription || "",
    productDescription: order.productDescription || order.product || "",
    price: order.price || order.extendedPrice || 0,
    leadTime: order.leadTime || order.committedLeadTime || order.suggestedLeadTime || "",
  };

  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrder(orderId: string, updates: Partial<Order>) {
  const orders = getOrders();
  const target = orders.find((order) => order.id === orderId);
  if (!target) {
    return undefined;
  }

  Object.assign(target, updates);
  saveOrders(orders);
  return target;
}

export function getOrdersForCustomer(customerName: string): Order[] {
  return getOrders().filter((order) => order.customer.toLowerCase() === customerName.toLowerCase());
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`quoteportal:${STORAGE_KEY}`, JSON.stringify(orders));
}
