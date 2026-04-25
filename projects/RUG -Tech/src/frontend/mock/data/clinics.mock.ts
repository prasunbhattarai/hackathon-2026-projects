import type { Clinic } from "@/types/admin.types";

export const clinicsMock: Clinic[] = [
	{
		id: "clinic-ktm-eye-01",
		name: "Sagarmatha Retina and Eye Center",
		address: "Maharajgunj Road, Kathmandu, Bagmati",
		phone: "+977-14451234",
		isActive: true,
		createdAt: "2024-01-12T08:15:00.000Z",
		userCount: 5,
		caseCount: 24,
	},
	{
		id: "clinic-pkr-eye-02",
		name: "Pokhara Vision Specialist Clinic",
		address: "Lakeside Marg, Pokhara, Gandaki",
		phone: "+977-61540210",
		isActive: true,
		createdAt: "2024-03-02T09:30:00.000Z",
		userCount: 3,
		caseCount: 18,
	},
	{
		id: "clinic-brt-eye-03",
		name: "Birat Retina Diagnostic Center",
		address: "Main Road, Biratnagar, Koshi",
		phone: "+977-21450022",
		isActive: true,
		createdAt: "2024-05-20T07:45:00.000Z",
		userCount: 0,
		caseCount: 8,
	},
];
