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

export interface Transaction {
	id: number;
	user_id: number;
	account_id: number;
	category_id: number;
	type: 'income' | 'expense';
	input_amount: number;
	input_currency: string;
	amount: number;
	rate: number;
	label: string;
	description?: string;
	transaction_date: string;
	reference?: string;
	status: 'pending' | 'completed' | 'cancelled';
	created_at: string;
	updated_at: string;
}