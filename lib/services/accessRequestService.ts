export type AccessRequestStatus = "Pending Approval" | "Approved" | "Rejected";

export type AccessRequest = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
  reasonForAccess: string;
  status: AccessRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  role?: "Customer" | "Admin";
};

const STORAGE_KEY = "access-requests";

export function getAccessRequests(): AccessRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(`quoteportal:${STORAGE_KEY}`);
    return rawValue ? (JSON.parse(rawValue) as AccessRequest[]) : [];
  } catch {
    return [];
  }
}

export function createAccessRequest(request: Omit<AccessRequest, "id" | "status" | "requestedAt">): AccessRequest {
  const requests = getAccessRequests();
  const newRequest: AccessRequest = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "Pending Approval",
    requestedAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  saveAccessRequests(requests);
  return newRequest;
}

export function updateAccessRequest(requestId: string, updates: Partial<AccessRequest>) {
  const requests = getAccessRequests();
  const target = requests.find((request) => request.id === requestId);
  if (!target) {
    return undefined;
  }

  Object.assign(target, updates);
  saveAccessRequests(requests);
  return target;
}

export function approveAccessRequest(requestId: string, role: "Customer" | "Admin") {
  return updateAccessRequest(requestId, {
    status: "Approved",
    reviewedAt: new Date().toISOString(),
    role,
  });
}

export function rejectAccessRequest(requestId: string) {
  return updateAccessRequest(requestId, {
    status: "Rejected",
    reviewedAt: new Date().toISOString(),
  });
}

function saveAccessRequests(requests: AccessRequest[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`quoteportal:${STORAGE_KEY}`, JSON.stringify(requests));
}
