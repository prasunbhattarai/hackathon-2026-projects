export interface Clinic {
	id: string;
	name: string;
	address: string;
	phone: string;
	isActive: boolean;
	createdAt: string;
	userCount?: number;
	caseCount?: number;
}

export interface CreateClinicRequest {
	name: string;
	address: string;
	phone: string;
}

export interface PlatformStats {
	totalClinics: number;
	totalUsers: number;
	totalCases: number;
	todayCases: number;
	criticalCases: number;
	avgProcessingTimeMs: number;
}
