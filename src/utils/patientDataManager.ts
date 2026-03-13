import { mockPatients } from "../data/mockData";
import API from "../services/api";

export interface Patient {
  id?: string;
  patient_id?: string;
  name: string;
  age: number;
  gender: string;
  blood_group?: string;
  bloodGroup?: string;
  contact: string;
  email?: string;
  address?: string;
  city?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
}

export class PatientDataManager {
  static normalizePatient(patient: any): Patient {
    return {
      ...patient,
      id: patient.id || patient.patient_id,
      patient_id: patient.patient_id || patient.id,
      bloodGroup: patient.bloodGroup || patient.blood_group,
      blood_group: patient.blood_group || patient.bloodGroup,
    };
  }

  static async getAllPatients(): Promise<Patient[]> {
    const patients: Patient[] = [];
    
    // Get from localStorage
    const localPatients = localStorage.getItem("patients");
    if (localPatients) {
      try {
        const parsed = JSON.parse(localPatients);
        patients.push(...parsed.map(this.normalizePatient));
      } catch (e) {
        console.error("Error parsing local patients:", e);
      }
    }

    // Get from API
    try {
      const apiPatients = await API.patients.getAll();
      patients.push(...apiPatients.map(this.normalizePatient));
    } catch (e) {
      console.error("Error fetching API patients:", e);
    }

    // Add mock patients
    patients.push(...mockPatients.map(this.normalizePatient));

    // Deduplicate by patient_id or id
    const uniquePatients = Array.from(
      new Map(
        patients.map((p) => [p.patient_id || p.id, p])
      ).values()
    );

    return uniquePatients;
  }

  static async findPatientById(patientId: string): Promise<Patient | null> {
    const allPatients = await this.getAllPatients();
    return (
      allPatients.find(
        (p) =>
          p.patient_id === patientId ||
          p.id === patientId ||
          p.patient_id?.replace(/-/g, "") === patientId.replace(/-/g, "") ||
          p.id?.replace(/-/g, "") === patientId.replace(/-/g, "")
      ) || null
    );
  }

  static generatePatientId(): string {
    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `PAT${timestamp}${random}`;
  }

  static initializeDefaultData(): void {
    const existing = localStorage.getItem("patients");
    if (!existing) {
      localStorage.setItem("patients", JSON.stringify(mockPatients));
    }
  }
}
