<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'USER',
        ]);

        return response()->json([
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (
            ! $user
            || blank($user->password)
            || ! Hash::check($data['password'], $user->password)
        ) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function google(Request $request)
    {
        $data = $request->validate([
            'idToken' => ['required', 'string'],
        ]);

        $clientId = config('services.google.client_id');

        if (blank($clientId)) {
            throw ValidationException::withMessages([
                'idToken' => ['Google login is not configured on the server.'],
            ]);
        }

        $response = Http::timeout(10)->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $data['idToken'],
        ]);

        if (! $response->ok()) {
            throw ValidationException::withMessages([
                'idToken' => ['Invalid Google token.'],
            ]);
        }

        $payload = $response->json();

        $issuer = (string) ($payload['iss'] ?? '');
        if (! in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true)) {
            throw ValidationException::withMessages([
                'idToken' => ['Invalid Google token issuer.'],
            ]);
        }

        if (($payload['aud'] ?? null) !== $clientId) {
            throw ValidationException::withMessages([
                'idToken' => ['Google token audience mismatch.'],
            ]);
        }

        if (($payload['email_verified'] ?? 'false') !== 'true' && ($payload['email_verified'] ?? false) !== true) {
            throw ValidationException::withMessages([
                'idToken' => ['Google email is not verified.'],
            ]);
        }

        $googleId = (string) ($payload['sub'] ?? '');
        $email = strtolower((string) ($payload['email'] ?? ''));
        $name = (string) ($payload['name'] ?? strstr($email, '@', true) ?: 'Kambo User');

        if ($googleId === '' || $email === '') {
            throw ValidationException::withMessages([
                'idToken' => ['Google account data is incomplete.'],
            ]);
        }

        $user = User::where('google_id', $googleId)->first()
            ?? User::where('email', $email)->first();

        if ($user) {
            if (blank($user->google_id)) {
                $user->google_id = $googleId;
            }
            if (blank($user->name) && $name !== '') {
                $user->name = $name;
            }
            if (blank($user->email_verified_at)) {
                $user->email_verified_at = now();
            }
            $user->save();
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'google_id' => $googleId,
                'password' => null,
                'role' => 'USER',
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->userPayload($request->user()),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'createdAt' => optional($user->created_at)?->toISOString(),
        ];
    }
}
