import { NextResponse } from "next/server";
import { getAnalysisByCaseIdMock, getReportBundleByCaseIdMock } from "@/mock/handlers/analysis.handler";
import { getCaseDetailMock, listCasesMock, uploadCaseMock } from "@/mock/handlers/case.handler";
import { CaseStatus } from "@/types/case.types";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const caseId = searchParams.get("caseId");
	const include = searchParams.get("include");

	if (caseId && include === "analysis") {
		const analysis = await getAnalysisByCaseIdMock(caseId);
		return NextResponse.json(analysis, { status: analysis.success ? 200 : 404 });
	}

	if (caseId && include === "report") {
		const report = await getReportBundleByCaseIdMock(caseId);
		return NextResponse.json(report, { status: report.success ? 200 : 404 });
	}

	if (caseId) {
		const detail = await getCaseDetailMock(caseId);
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

	const statusParam = searchParams.get("status");
	const priorityTier = searchParams.get("priorityTier") as "critical" | "high" | "medium" | "low" | null;
	const page = Number(searchParams.get("page") ?? "1");
	const limit = Number(searchParams.get("limit") ?? "10");

	const result = await listCasesMock(clinicId, {
		status: statusParam ? (statusParam as CaseStatus) : undefined,
		priorityTier: priorityTier ?? undefined,
		page,
		limit,
	});

	return NextResponse.json(result);
}

export async function POST(request: Request) {
	const payload = (await request.json()) as { patientId?: string };
	if (!payload.patientId) {
		return NextResponse.json(
			{
				success: false,
				data: null,
				error: {
					code: "PATIENT_ID_REQUIRED",
					message: "patientId is required.",
				},
			},
			{ status: 400 },
		);
	}

	const upload = await uploadCaseMock(payload.patientId);
	return NextResponse.json(upload, { status: upload.success ? 201 : 404 });
}
