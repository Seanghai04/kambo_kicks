<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function map(): array
    {
        return static::query()
            ->pluck('value', 'key')
            ->all();
    }

    public static function putMany(array $values): array
    {
        foreach ($values as $key => $value) {
            static::updateOrCreate(
                ['key' => (string) $key],
                ['value' => is_null($value) ? null : (string) $value],
            );
        }

        Cache::forget('site_settings_map');

        return static::map();
    }
}
