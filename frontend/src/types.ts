export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  tags: string[];
  leads?: Lead[];
  appointments?: Appointment[];
  payments?: Payment[];
  followUps?: FollowUpTask[];
};

export type Business = {
  id: string;
  name: string;
  industry?: string;
  role?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  businesses: Business[];
};

export type AuditLog = {
  id: string;
  businessId?: string;
  model: string;
  modelId?: string;
  action: string;
  description: string;
  changes: Record<string, unknown>;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type Lead = {
  id: string;
  customerId: string;
  customer: Customer;
  source: string;
  serviceType: string;
  status: LeadStatus;
  valueEstimate?: number;
  urgency: 'Low' | 'Normal' | 'Hot';
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
  appointments?: Appointment[];
  followUps?: FollowUpTask[];
};

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Booked'
  | 'Served'
  | 'Follow-up'
  | 'Won'
  | 'Lost';

export type Appointment = {
  id: string;
  customerId: string;
  customer: Customer;
  leadId?: string;
  lead?: Lead;
  service: string;
  scheduledAt: string;
  status: LeadStatus;
  price?: number;
  notes?: string;
};

export type Payment = {
  id: string;
  customerId: string;
  customer: Customer;
  appointmentId?: string;
  appointment?: Appointment;
  amount: number;
  paidAmount: number;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
  method?: string;
  dueAt?: string;
  paidAt?: string;
};

export type FollowUpTask = {
  id: string;
  customerId: string;
  customer: Customer;
  leadId?: string;
  lead?: Lead;
  dueAt: string;
  reason: string;
  status: 'Open' | 'Done' | 'Skipped';
  suggestedMessage: string;
};

export type DashboardSummary = {
  totals: {
    customers: number;
    totalLeads: number;
    todayLeads: number;
    followUpLeads: number;
    openLeads: number;
    hotLeads: number;
    todayAppointments: number;
    overdueFollowUps: number;
    unpaidPayments: number;
    paidRevenue: number;
    receivables: number;
  };
  todayAppointments: Appointment[];
  todayLeads: Lead[];
  followUpLeads: Lead[];
  hotLeads: Lead[];
  overdueFollowUps: FollowUpTask[];
  unpaidPayments: Payment[];
  recentLeads: Lead[];
};
