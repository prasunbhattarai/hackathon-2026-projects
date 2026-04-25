export type UUID = string & { readonly __brand: "UUID" };
export type ISODateString = string & { readonly __brand: "ISODateString" };

export type SortDirection = "asc" | "desc";
export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
	id: UUID;
	type: NotificationType;
	title: string;
	message: string;
	read: boolean;
	createdAt: ISODateString;
	caseId?: UUID;
}

export interface SelectOption<T> {
	value: T;
	label: string;
	disabled?: boolean;
}

export interface TableColumn<T extends object> {
	key: keyof T;
	label: string;
	sortable?: boolean;
	width?: string;
}
