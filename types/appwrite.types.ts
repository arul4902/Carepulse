import { Models } from "node-appwrite";

export type Gender = "male" | "female" | "other";
export type Status = "pending" | "scheduled" | "cancelled";

export interface AppwriteUser extends Models.User<{}> {
  $id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Patient extends Models.Document {
  $id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationType?: string;
  identificationNumber?: string;
  identificationDocument?: FormData;
  privacyConsent: boolean;
}

export interface Appointment extends Models.Document {
  $id: string;
  $createdAt: string;
  patient: Patient;
  userId: string;
  schedule: string;
  status: Status;
  primaryPhysician: string;
  reason?: string;
  note?: string;
  cancellationReason?: string | null;
}
