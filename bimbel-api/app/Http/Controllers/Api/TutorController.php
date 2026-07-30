<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TutorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'guru')->with('tutorProfile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tutors = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $tutors,
        ]);
    }

    public function store(Request $request)
    {
        // Enforce maximum 50 users rule
        $userCount = User::count();
        if ($userCount >= 50) {
            return response()->json([
                'success' => false,
                'message' => 'Batas maksimal 50 user telah tercapai.',
            ], 422);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'rate_per_session' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'guru',
                'phone' => $request->phone,
                'status' => 'active',
            ]);

            $latestTutorId = Tutor::max('id') + 1;
            $nipCode = 'G' . date('Y') . str_pad($latestTutorId, 3, '0', STR_PAD_LEFT);

            $tutor = Tutor::create([
                'user_id' => $user->id,
                'nip_code' => $nipCode,
                'specialization' => $request->specialization,
                'rate_per_session' => $request->rate_per_session ?? 0,
            ]);

            $user->load('tutorProfile');

            return response()->json([
                'success' => true,
                'message' => 'Data guru les berhasil ditambahkan.',
                'data' => $user,
            ], 201);
        });
    }

    public function show($id)
    {
        $user = User::where('role', 'guru')->with(['tutorProfile', 'attendances.student'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'guru')->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'rate_per_session' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        return DB::transaction(function () use ($request, $user) {
            $userData = $request->only(['name', 'email', 'phone', 'status']);
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            if ($user->tutorProfile) {
                $user->tutorProfile->update([
                    'specialization' => $request->specialization ?? $user->tutorProfile->specialization,
                    'rate_per_session' => $request->rate_per_session ?? $user->tutorProfile->rate_per_session,
                ]);
            }

            $user->load('tutorProfile');

            return response()->json([
                'success' => true,
                'message' => 'Data guru les berhasil diperbarui.',
                'data' => $user,
            ]);
        });
    }

    public function destroy($id)
    {
        $user = User::where('role', 'guru')->findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data guru les berhasil dihapus.',
        ]);
    }
}
