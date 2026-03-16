export interface HistoryItem {
    id: number;
    total_amount: number;
    amount_received: number;
    change_returned: number;
    timestamp: string;
}

export interface CalculateRequest {
    total: number;
    received: number;
}

export interface CalculateResponse {
    success: boolean;
    change?: number;
    error?: string;
}

export interface ApiResponse<T> {
    success: true;
    data: T;
}

export interface ApiError {
    success: false;
    error: string;
}

