"use server";

import { ID, InputFile, Query } from "node-appwrite";

import { Patient, AppwriteUser } from "@/types/appwrite.types";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}

interface RegisterUserParams extends CreateUserParams {
  userId: string;
  birthDate: Date;
  gender: string;
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

export const createUser = async (user: CreateUserParams): Promise<AppwriteUser | undefined> => {
  try {
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser) as AppwriteUser;
  } catch (error: any) {
    if (error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);
      return existingUser.users[0] as AppwriteUser;
    }

    console.error("An error occurred while creating a new user:", error);
  }
};

export const getUser = async (userId: string): Promise<AppwriteUser> => {
  try {
    const user = await users.get(userId);
    return user as AppwriteUser;
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error);
    throw error;
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    if (!BUCKET_ID || !DATABASE_ID || !PATIENT_COLLECTION_ID || !PROJECT_ID || !ENDPOINT) {
      throw new Error("Missing one or more required Appwrite environment variables.");
    }

    let file;
    if (identificationDocument) {
      const inputFile = InputFile.fromBlob(
        identificationDocument.get("blobFile") as Blob,
        identificationDocument.get("fileName") as string
      );

      file = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ?? null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while registering the patient:", error);
  }
};

export const getPatient = async (userId: string): Promise<Patient | null> => {
  try {
    if (!DATABASE_ID || !PATIENT_COLLECTION_ID) {
      throw new Error("Missing DATABASE_ID or PATIENT_COLLECTION_ID in config.");
    }

    const patients = await databases.listDocuments(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    if (!patients.documents.length) return null;

    return parseStringify(patients.documents[0]) as Patient;
  } catch (error) {
    console.error("An error occurred while retrieving the patient details:", error);
    return null;
  }
};
