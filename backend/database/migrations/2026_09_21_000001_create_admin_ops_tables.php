<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->string('status')->default('NEW'); // NEW, READ, REPLIED, ARCHIVED
            $table->timestamps();
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('replacement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reason');
            $table->string('status')->default('OPEN'); // OPEN, APPROVED, REJECTED, DONE
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('site_settings')->insert([
            ['key' => 'store_name', 'value' => 'KAMBO-KICKS', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'store_email', 'value' => 'hello@kambo-kicks.com', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'store_phone', 'value' => '+855 12 000 000', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'store_address', 'value' => 'Phnom Penh, Cambodia', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'currency', 'value' => 'USD', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'low_stock_threshold', 'value' => '8', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'shipping_note', 'value' => 'Standard delivery 2–5 days in Phnom Penh.', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('replacement_requests');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('contact_messages');
    }
};
