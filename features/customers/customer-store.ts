export type OrderStatus = "Open" | "Closed" | "Shipped" | "Delivered";

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

export type Order = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  leadTime: string;
  status: OrderStatus;
};

const STORAGE_KEYS = {
  CUSTOMERS: "quoteflow-approved-customers",
  ORDERS: "quoteflow-orders",
} as const;

const approvedCustomers: ApprovedCustomer[] = [];

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

export function loadOrders() {
  if (!isClient) {
    return [] as Order[];
  }

  const saved = window.localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!saved) {
    return [] as Order[];
  }

  try {
    return JSON.parse(saved) as Order[];
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
