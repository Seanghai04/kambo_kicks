<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->unique()->after('id');
            }
            if (! Schema::hasColumn('orders', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('user_id');
            }
            if (! Schema::hasColumn('orders', 'phone')) {
                $table->string('phone', 40)->nullable()->after('customer_name');
            }
            if (! Schema::hasColumn('orders', 'shipping_method')) {
                $table->string('shipping_method', 40)->nullable()->after('address');
            }
            if (! Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method', 40)->nullable()->after('shipping_method');
            }
            if (! Schema::hasColumn('orders', 'shipping_fee')) {
                $table->decimal('shipping_fee', 10, 2)->default(0)->after('payment_method');
            }
            if (! Schema::hasColumn('orders', 'note')) {
                $table->text('note')->nullable()->after('shipping_fee');
            }
            if (! Schema::hasColumn('orders', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $columns = [
                'customer_name',
                'phone',
                'shipping_method',
                'payment_method',
                'shipping_fee',
                'note',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
