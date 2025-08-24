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
	rate?: number;
	label?: string;
	description?: string;
	transaction_date: string;
	created_at: string;
	updated_at: string;
	// Relations
	account?: Account;
	category?: Category;
}

export interface Subscription {
	id: number;
	user_id: number;
	account_id: number;
	category_id: number;
	vendor: string;
	description?: string;
	input_amount: number;
	input_currency: string;
	starts_on: string;
	next_run_on: string;
	last_run_on?: string;
	interval_unit: 'day' | 'week' | 'month' | 'year';
	active: boolean;
	created_at: string;
	updated_at: string;
	// Relations
	account?: Account;
	category?: Category;
}