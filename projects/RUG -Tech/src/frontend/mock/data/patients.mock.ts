import type { Gender, Patient } from "@/types/patient.types";

const REFERENCE_DATE = new Date("2026-04-24T00:00:00.000Z");

const patientSeed: Array<{ name: string; age: number; gender: Gender; clinicId: string }> = [
	{ name: "Aarati Shrestha", age: 34, gender: "female", clinicId: "clinic-ktm-eye-01" },
	{ name: "Prakash Tamang", age: 58, gender: "male", clinicId: "clinic-ktm-eye-01" },
	{ name: "Manisha Rai", age: 45, gender: "female", clinicId: "clinic-pkr-eye-02" },
	{ name: "Gopal Karki", age: 62, gender: "male", clinicId: "clinic-pkr-eye-02" },
	{ name: "Binita Neupane", age: 39, gender: "female", clinicId: "clinic-ktm-eye-01" },
	{ name: "Ramesh Kandel", age: 71, gender: "male", clinicId: "clinic-brt-eye-03" },
	{ name: "Nabina Paudel", age: 52, gender: "female", clinicId: "clinic-pkr-eye-02" },
	{ name: "Suraj Gurung", age: 47, gender: "male", clinicId: "clinic-ktm-eye-01" },
	{ name: "Kalpana Adhikari", age: 66, gender: "female", clinicId: "clinic-brt-eye-03" },
	{ name: "Hari Bhandari", age: 55, gender: "male", clinicId: "clinic-pkr-eye-02" },
	{ name: "Saraswati Luitel", age: 61, gender: "female", clinicId: "clinic-ktm-eye-01" },
	{ name: "Nischal Basnet", age: 42, gender: "male", clinicId: "clinic-ktm-eye-01" },
	{ name: "Anju Poudel", age: 37, gender: "female", clinicId: "clinic-pkr-eye-02" },
	{ name: "Madan Oli", age: 64, gender: "male", clinicId: "clinic-brt-eye-03" },
	{ name: "Sunita Bohara", age: 49, gender: "female", clinicId: "clinic-ktm-eye-01" },
	{ name: "Khem Raj Regmi", age: 73, gender: "male", clinicId: "clinic-pkr-eye-02" },
	{ name: "Mina Kharel", age: 33, gender: "female", clinicId: "clinic-brt-eye-03" },
	{ name: "Sandeep Shah", age: 59, gender: "male", clinicId: "clinic-ktm-eye-01" },
	{ name: "Tara Magar", age: 41, gender: "female", clinicId: "clinic-pkr-eye-02" },
	{ name: "Rajendra Yadav", age: 68, gender: "male", clinicId: "clinic-brt-eye-03" },
	{ name: "Rupa Bhusal", age: 56, gender: "female", clinicId: "clinic-ktm-eye-01" },
	{ name: "Tek Bahadur Lama", age: 75, gender: "male", clinicId: "clinic-pkr-eye-02" },
	{ name: "Sarita K.C.", age: 44, gender: "female", clinicId: "clinic-ktm-eye-01" },
	{ name: "Dipak Pandey", age: 63, gender: "male", clinicId: "clinic-brt-eye-03" },
	{ name: "Rina Dhakal", age: 36, gender: "other", clinicId: "clinic-pkr-eye-02" },
];

function toIsoDateFromAge(age: number, dayOffset: number): string {
	const dob = new Date(REFERENCE_DATE);
	dob.setUTCFullYear(REFERENCE_DATE.getUTCFullYear() - age);
	dob.setUTCDate(((dayOffset % 28) + 1));
	return dob.toISOString().slice(0, 10);
}

function toMedicalId(index: number): string {
	return `CLN-${String(index + 1).padStart(5, "0")}`;
}

function toContact(index: number): string {
	return `+977-98${String(1000000 + index * 173).padStart(7, "0")}`;
}

export const patientsMock: Patient[] = patientSeed.map((seed, index) => {
	const createdAt = new Date(`2025-01-01T08:00:00.000Z`);
	createdAt.setUTCDate(createdAt.getUTCDate() + index * 3);

	const updatedAt = new Date(createdAt);
	updatedAt.setUTCDate(updatedAt.getUTCDate() + ((index % 6) + 1));

	return {
		id: `patient-${String(index + 1).padStart(3, "0")}`,
		clinicId: seed.clinicId,
		fullName: seed.name,
		dateOfBirth: toIsoDateFromAge(seed.age, index),
		gender: seed.gender,
		contact: toContact(index),
		medicalId: toMedicalId(index),
		createdAt: createdAt.toISOString(),
		updatedAt: updatedAt.toISOString(),
	};
});
