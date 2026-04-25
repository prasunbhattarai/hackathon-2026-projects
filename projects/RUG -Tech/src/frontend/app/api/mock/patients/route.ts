import { NextResponse } from "next/server";
import { createPatientMock, getPatientDetailMock, listPatientsMock } from "@/mock/handlers/patient.handler";
import type { CreatePatientRequest } from "@/types/patient.types";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const patientId = searchParams.get("patientId");

	if (patientId) {
		const detail = await getPatientDetailMock(patientId);
		return NextResponse.json(detail, { status: detail.success ? 200 : 404 });
	}

	const clinicId = searchParams.get("clinicId");
	if (!clinicId) {
		return NextResponse.json(
			{
				success: false,
				data: null,
				error: {
					code: "CLINIC_ID_REQUIRED",
					message: "clinicId query parameter is required.",
				},
			},
			{ status: 400 },
		);
	}

	const page = Number(searchParams.get("page") ?? "1");
	const limit = Number(searchParams.get("limit") ?? "10");

	const result = await listPatientsMock(clinicId, page, limit);
	return NextResponse.json(result);
}

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url);
	const clinicId = searchParams.get("clinicId");

	if (!clinicId) {
		return NextResponse.json(
			{
				success: false,
				data: null,
				error: {
					code: "CLINIC_ID_REQUIRED",
					message: "clinicId query parameter is required.",
				},
			},
			{ status: 400 },
		);
	}

	const payload = (await request.json()) as CreatePatientRequest;
	const created = await createPatientMock(clinicId, payload);
	return NextResponse.json(created, { status: 201 });
}
