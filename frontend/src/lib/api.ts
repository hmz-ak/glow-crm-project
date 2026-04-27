import type {
  AuditLog,
  Appointment,
  AuthUser,
  Business,
  Customer,
  DashboardSummary,
  FollowUpTask,
  Lead,
  LeadStatus,
  Payment,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function setAuthSession(token: string, businessId: string) {
  localStorage.setItem('flowcrm_token', token);
  localStorage.setItem('flowcrm_business_id', businessId);
}

export function setBusinessId(businessId: string) {
  localStorage.setItem('flowcrm_business_id', businessId);
}

export function clearAuthSession() {
  localStorage.removeItem('flowcrm_token');
  localStorage.removeItem('flowcrm_business_id');
}

export function getAuthSession() {
  return {
    token: localStorage.getItem('flowcrm_token') ?? '',
    businessId: localStorage.getItem('flowcrm_business_id') ?? '',
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { token, businessId } = getAuthSession();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(businessId ? { 'X-Business-Id': businessId } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser; businessId: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<AuthUser>('/auth/me'),
  createBusiness: (payload: { name: string; industry?: string }) =>
    request<Business>('/auth/businesses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  audits: () => request<AuditLog[]>('/audits'),
  summary: () => request<DashboardSummary>('/dashboard/summary'),
  customers: (search = '') =>
    request<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  leads: () => request<Lead[]>('/leads'),
  appointments: () => request<Appointment[]>('/appointments'),
  payments: () => request<Payment[]>('/payments'),
  followUps: () => request<FollowUpTask[]>('/follow-ups'),
  createLead: (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    source: string;
    serviceType: string;
    valueEstimate?: number;
    urgency: 'Low' | 'Normal' | 'Hot';
    notes?: string;
  }) =>
    request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateLeadStatus: (id: string, status: LeadStatus) =>
    request<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateAppointmentStatus: (id: string, status: Appointment['status']) =>
    request<Appointment>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updatePaymentStatus: (id: string, status: Payment['status']) =>
    request<Payment>(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updatePayment: (id: string, payload: Partial<Pick<Payment, 'status' | 'paidAmount' | 'amount'>>) =>
    request<Payment>(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateFollowUpStatus: (id: string, status: FollowUpTask['status']) =>
    request<FollowUpTask>(`/follow-ups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  suggestMessage: (payload: {
    customerName: string;
    serviceType: string;
    intent?: 'new-lead' | 'booking-reminder' | 'payment-due' | 'win-back' | 'thank-you';
    businessName?: string;
  }) =>
    request<{ message: string; channel: string; generatedBy: string }>('/ai/message-suggestion', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
