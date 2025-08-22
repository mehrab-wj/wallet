<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;

class TransactionController extends Controller
{
    public function store(TransactionRequest $request)
    {
        $request->user()->transactions()->create($request->validated());

        return response()->json(['message' => 'Transaction created successfully']);
    }
}
