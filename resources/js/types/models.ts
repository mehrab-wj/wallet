export interface Account {
	id: number;
	name: string;
	currency: string;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: number;
	user_id: number;
	name: string;
	type: 'expense' | 'income';
	parent_id?: number | null;
	sort_order: number;
	created_at: string;
	updated_at: string;
}