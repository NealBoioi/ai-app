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

const approvedCustomers: ApprovedCustomer[] = [];

export function getApprovedCustomers() {
  return approvedCustomers;
}

export function addApprovedCustomer(customer: Omit<ApprovedCustomer, "id" | "approved">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newCustomer: ApprovedCustomer = {
    id,
    approved: true,
    ...customer,
  };

  approvedCustomers.push(newCustomer);
  return newCustomer;
}
