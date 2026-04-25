import { NextResponse } from "next/server";
import { loginMock } from "@/mock/handlers/auth.handler";
import type { LoginRequest } from "@/types/auth.types";

export async function POST(request: Request) {
	const payload = (await request.json()) as Partial<LoginRequest>;

	if (!payload.email || !payload.password) {
		return NextResponse.json(
			{
				success: false,
				data: null,
				error: {
					code: "AUTH_VALIDATION_ERROR",
					message: "Both email and password are required.",
					details: {
						fields: ["email", "password"],
					},
				},
			},
			{ status: 400 },
		);
	}

	const response = await loginMock({ email: payload.email, password: payload.password });
	return NextResponse.json(response, { status: response.success ? 200 : 401 });
}
