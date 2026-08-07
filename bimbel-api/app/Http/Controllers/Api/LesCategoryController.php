<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LesCategory;
use Illuminate\Http\Request;

class LesCategoryController extends Controller
{
    public function index()
    {
        $categories = LesCategory::orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:50|unique:les_categories,code',
            'name' => 'required|string|max:255',
            'default_duration' => 'required|integer|in:60,90',
            'fee_per_session' => 'required|numeric|min:0',
        ]);

        $category = LesCategory::create([
            'code' => strtoupper($request->code),
            'name' => $request->name,
            'default_duration' => $request->default_duration,
            'fee_per_session' => $request->fee_per_session,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori les berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    public function show($id)
    {
        $category = LesCategory::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = LesCategory::findOrFail($id);

        $request->validate([
            'code' => 'sometimes|required|string|max:50|unique:les_categories,code,' . $id,
            'name' => 'sometimes|required|string|max:255',
            'default_duration' => 'sometimes|required|integer|in:60,90',
            'fee_per_session' => 'sometimes|required|numeric|min:0',
        ]);

        $category->update([
            'code' => $request->code ? strtoupper($request->code) : $category->code,
            'name' => $request->name ?? $category->name,
            'default_duration' => $request->default_duration ?? $category->default_duration,
            'fee_per_session' => $request->fee_per_session ?? $category->fee_per_session,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori les berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    public function destroy($id)
    {
        $category = LesCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori les berhasil dihapus.',
        ]);
    }
}
