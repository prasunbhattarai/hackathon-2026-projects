export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	error: ApiError | null;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
	data: T | null;
	status: LoadingState;
	error: ApiError | null;
}

export interface EmptyState {
	title: string;
	description: string;
	actionLabel?: string;
}
