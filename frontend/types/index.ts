export type RequestStatus = 'awaiting' | 'en-route' | 'fulfilled';
export type Urgency = 'critical' | 'urgent' | 'routine';

export interface BloodRequest {
  id: string;
  patientName: string;
  hospital: string;
  ward: string;
  city: string;
  district: string;
  bloodGroup: string;
  units: number;
  medicalContext: string;
  urgency: Urgency;
  status: RequestStatus;
  phone: string;
  slipUrl: string;
  createdAt: number; // UTC timestamp
  donorName?: string;
  donorEta?: string;
  acceptedByDonorId?: string;
  acceptedAt?: number;
  lockExpiresAt?: number;
}

export interface Donor {
  uid: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  bloodGroup: string;
  notifications: string[];
  lastDonation?: string;
  totalDonations: number;
  registeredAt: number;
}
