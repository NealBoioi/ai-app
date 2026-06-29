export type OrderStatus =
  | "Pending Approval"
  | "Approved"
  | "In Production"
  | "Awaiting Shipment"
  | "Shipped"
  | "Delivered";

export type OrderRiskLevel = "Low" | "Medium" | "High";
export type OrderUnitOfMeasure = "EA" | "FT" | "M" | "LB" | "PK" | "Other";

export type ApprovedCustomer = {
  id: string;
  jobFunction: string;
  companyName: string;
  country: string;
  city: string;
  postalCode: string;
  industry: string;
  solution: string;
  approved: true;
};

export type PendingCustomer = {
  id: string;
  jobFunction: string;
  companyName: string;
  country: string;
  city: string;
  postalCode: string;
  industry: string;
  solution: string;
  approved: false;
};

export type RejectedCustomer = {
  id: string;
  jobFunction: string;
  companyName: string;
  country: string;
  city: string;
  postalCode: string;
  industry: string;
  solution: string;
  approved: false;
  rejectedAt: string;
};

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
  price: number;
  leadTime: string;
};

const STORAGE_KEYS = {
  CUSTOMERS: "quoteflow-approved-customers",
  PENDING_CUSTOMERS: "quoteflow-pending-customers",
  REJECTED_CUSTOMERS: "quoteflow-rejected-customers",
  ORDERS: "quoteflow-orders",
} as const;

const approvedCustomers: ApprovedCustomer[] = [];
const pendingCustomers: PendingCustomer[] = [];
const rejectedCustomers: RejectedCustomer[] = [];

const isClient = typeof window !== "undefined";

export function loadCustomers() {
  if (!isClient) {
    return approvedCustomers;
  }

  const saved = window.localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (!saved) {
    return approvedCustomers;
  }

  try {
    const parsed = JSON.parse(saved) as ApprovedCustomer[];
    approvedCustomers.splice(0, approvedCustomers.length, ...parsed);
  } catch {
    // ignore invalid stored data
  }

  return approvedCustomers;
}

export function saveCustomers() {
  if (!isClient) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(approvedCustomers));
}

export function loadPendingCustomers() {
  if (!isClient) {
    return pendingCustomers;
  }

  const saved = window.localStorage.getItem(STORAGE_KEYS.PENDING_CUSTOMERS);
  if (!saved) {
    return pendingCustomers;
  }

  try {
    const parsed = JSON.parse(saved) as PendingCustomer[];
    pendingCustomers.splice(0, pendingCustomers.length, ...parsed);
  } catch {
    // ignore invalid stored data
  }

  return pendingCustomers;
}

export function savePendingCustomers() {
  if (!isClient) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.PENDING_CUSTOMERS, JSON.stringify(pendingCustomers));
}

export function loadRejectedCustomers() {
  if (!isClient) {
    return rejectedCustomers;
  }

  const saved = window.localStorage.getItem(STORAGE_KEYS.REJECTED_CUSTOMERS);
  if (!saved) {
    return rejectedCustomers;
  }

  try {
    const parsed = JSON.parse(saved) as RejectedCustomer[];
    rejectedCustomers.splice(0, rejectedCustomers.length, ...parsed);
  } catch {
    // ignore invalid stored data
  }

  return rejectedCustomers;
}

export function saveRejectedCustomers() {
  if (!isClient) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.REJECTED_CUSTOMERS, JSON.stringify(rejectedCustomers));
}

export function getApprovedCustomers() {
  if (approvedCustomers.length === 0 && isClient) {
    loadCustomers();
  }

  return approvedCustomers;
}

export function addApprovedCustomer(customer: Omit<ApprovedCustomer, "id" | "approved">) {
  if (isClient) {
    loadCustomers();
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newCustomer: ApprovedCustomer = {
    id,
    approved: true,
    ...customer,
  };

  approvedCustomers.push(newCustomer);
  saveCustomers();
  return newCustomer;
}

export function addPendingCustomer(customer: Omit<PendingCustomer, "id" | "approved">) {
  if (isClient) {
    loadPendingCustomers();
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newCustomer: PendingCustomer = {
    id,
    approved: false,
    ...customer,
  };

  pendingCustomers.push(newCustomer);
  savePendingCustomers();
  return newCustomer;
}

export function approvePendingCustomer(customerId: string) {
  if (isClient) {
    loadPendingCustomers();
    loadCustomers();
  }

  const index = pendingCustomers.findIndex((customer) => customer.id === customerId);
  if (index === -1) {
    return undefined;
  }

  const pending = pendingCustomers[index];
  pendingCustomers.splice(index, 1);

  const approvedCustomer: ApprovedCustomer = {
    ...pending,
    approved: true,
  };

  approvedCustomers.push(approvedCustomer);
  savePendingCustomers();
  saveCustomers();
  return approvedCustomer;
}

export function rejectPendingCustomer(customerId: string) {
  if (isClient) {
    loadPendingCustomers();
    loadRejectedCustomers();
  }

  const index = pendingCustomers.findIndex((customer) => customer.id === customerId);
  if (index === -1) {
    return undefined;
  }

  const [pending] = pendingCustomers.splice(index, 1);
  const rejectedCustomer: RejectedCustomer = {
    ...pending,
    rejectedAt: new Date().toISOString(),
  };

  rejectedCustomers.push(rejectedCustomer);
  savePendingCustomers();
  saveRejectedCustomers();
  return rejectedCustomer;
}

export function loadOrders() {
  if (!isClient) {
    return [] as Order[];
  }

  const saved = window.localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!saved) {
    return [] as Order[];
  }

  try {
    const parsed = JSON.parse(saved) as Order[];
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
    return [] as Order[];
  }
}

export function saveOrders(orders: Order[]) {
  if (!isClient) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}
