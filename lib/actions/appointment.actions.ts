"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime } from "../utils";

// Local utility function to safely parse stringified data
const parseStringify = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// Appointment list response type
export interface AppointmentListResponse {
  totalCount: number;
  scheduledCount: number;
  pendingCount: number;
  cancelledCount: number;
  documents: Appointment[];
}

// CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async (): Promise<AppointmentListResponse> => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data: AppointmentListResponse = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents as Appointment[],
    };

    return parseStringify(data);
  } catch (error) {
    console.error("Error retrieving recent appointments:", error);
    throw error;
  }
};

// SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

// UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw new Error("Failed to update appointment");

    const formattedDate = formatDateTime(appointment.schedule!, timeZone).dateTime;
    const smsMessage =
      type === "schedule"
        ? `Greetings from carepulse. Your appointment is confirmed for ${formattedDate} with Dr. ${appointment.primaryPhysician}.`
        : `Greetings from carepulse. We regret to inform you that your appointment for ${formattedDate} is cancelled. Reason: ${appointment.cancellationReason}.`;

    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

// GET SINGLE APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error("Error retrieving appointment:", error);
    throw error;
  }
};
