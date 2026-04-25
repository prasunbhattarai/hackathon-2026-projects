import { usersMock } from "@/mock/data/users.mock";
import type { ApiError, ApiResponse } from "@/types/api.types";
import type { AuthSession, JWTPayload, LoginRequest, LoginResponse } from "@/types/auth.types";

const MOCK_PASSWORD = "fundus-demo-123";

function encodePayload(payload: JWTPayload): string {
	return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function buildMockToken(payload: JWTPayload): string {
	return `mock.${encodePayload(payload)}.signature`;
}

export function decodeMockToken(token: string): JWTPayload | null {
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	try {
		return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as JWTPayload;
	} catch {
		return null;
	}
}

function fail<T>(error: ApiError): ApiResponse<T> {
	return {
		success: false,
		data: null as unknown as T,
		error,
	};
}

export async function loginMock(request: LoginRequest): Promise<LoginResponse> {
	const user = usersMock.find((item) => item.email.toLowerCase() === request.email.toLowerCase());
	if (!user) {
		return fail<AuthSession>({
			code: "AUTH_INVALID_CREDENTIALS",
			message: "Invalid email or password.",
		});
	}

	if (request.password !== MOCK_PASSWORD) {
		return fail<AuthSession>({
			code: "AUTH_INVALID_CREDENTIALS",
			message: "Invalid email or password.",
		});
	}

	const expiresIn = 60 * 60;
	const payload: JWTPayload = {
		userId: user.id,
		role: user.role,
		clinicId: user.clinicId,
		exp: Math.floor(Date.now() / 1000) + expiresIn,
	};

	return {
		success: true,
		data: {
			user,
			accessToken: buildMockToken(payload),
			tokenType: "Bearer",
			expiresIn,
		},
		error: null,
	};
}
