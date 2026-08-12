<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherAccountController extends Controller
{
    public function index()
    {
        $accounts = User::where('role', 'guru')->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'guru',
            'phone' => $request->phone,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun login guru berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'guru')->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
        ]);

        $updateData = [
            'name' => $request->name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'phone' => $request->phone ?? $user->phone,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Akun login guru berhasil diperbarui.',
            'data' => $user,
        ]);
    }

    public function destroy($id)
    {
        $user = User::where('role', 'guru')->findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun login guru berhasil dihapus.',
        ]);
    }
}
