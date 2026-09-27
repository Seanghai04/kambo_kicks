<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::statement('TRUNCATE TABLE order_items, orders, product_variants, product_images, products, personal_access_tokens, users RESTART IDENTITY CASCADE');

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@shoesstore.com',
            'password' => 'admin123',
            'role' => 'ADMIN',
        ]);

        User::create([
            'name' => 'Test User',
            'email' => 'user@test.com',
            'password' => 'user123',
            'role' => 'USER',
        ]);

        $catalog = [
            [
                'name' => 'Nike Air Max 270',
                'description' => 'Cushioned Nike running shoe for daily wear.',
                'base_price' => 149.99,
                'brand' => 'Nike',
                'category' => 'Running',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 40', 'color' => 'Red', 'stock' => 10],
                    ['size' => 'EU 41', 'color' => 'Red', 'stock' => 15],
                    ['size' => 'EU 42', 'color' => 'Red', 'stock' => 12],
                ],
            ],
            [
                'name' => 'Nike Revolution 6',
                'description' => 'Lightweight Nike shoe for everyday running.',
                'base_price' => 79.99,
                'brand' => 'Nike',
                'category' => 'Running',
                'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 41', 'color' => 'Black', 'stock' => 12],
                    ['size' => 'EU 42', 'color' => 'Black', 'stock' => 14],
                    ['size' => 'EU 43', 'color' => 'Black', 'stock' => 9],
                ],
            ],
            [
                'name' => 'Nike Dunk Low',
                'description' => 'Classic Nike basketball-inspired lifestyle shoe.',
                'base_price' => 119.99,
                'brand' => 'Nike',
                'category' => 'Basketball',
                'image' => 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 40', 'color' => 'White', 'stock' => 11],
                    ['size' => 'EU 41', 'color' => 'White', 'stock' => 13],
                    ['size' => 'EU 42', 'color' => 'White', 'stock' => 10],
                ],
            ],
            [
                'name' => 'Nike Mercurial Vapor',
                'description' => 'Speed football cleats for the pitch.',
                'base_price' => 129.99,
                'brand' => 'Nike',
                'category' => 'Football',
                'image' => 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 40', 'color' => 'Green', 'stock' => 7],
                    ['size' => 'EU 42', 'color' => 'Green', 'stock' => 11],
                ],
            ],
            [
                'name' => 'Nike Metcon 9',
                'description' => 'Stable Nike training shoe for gym workouts.',
                'base_price' => 139.99,
                'brand' => 'Nike',
                'category' => 'Training',
                'image' => 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 41', 'color' => 'Grey', 'stock' => 14],
                    ['size' => 'EU 42', 'color' => 'Grey', 'stock' => 10],
                ],
            ],
            [
                'name' => 'Adidas Ultraboost',
                'description' => 'Responsive Adidas running shoe with boost cushioning.',
                'base_price' => 159.99,
                'brand' => 'Adidas',
                'category' => 'Running',
                'image' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 41', 'color' => 'Black', 'stock' => 10],
                    ['size' => 'EU 42', 'color' => 'Black', 'stock' => 12],
                ],
            ],
            [
                'name' => 'Trail Outdoor Shoe',
                'description' => 'Durable shoe for hiking and outdoor sport.',
                'base_price' => 109.99,
                'brand' => 'TrailGo',
                'category' => 'Outdoor',
                'image' => 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
                'variants' => [
                    ['size' => 'EU 42', 'color' => 'Brown', 'stock' => 8],
                    ['size' => 'EU 43', 'color' => 'Brown', 'stock' => 5],
                ],
            ],
            [
                'name' => 'White Casual Tee',
                'description' => 'Simple casual cotton t-shirt.',
                'base_price' => 24.99,
                'brand' => 'UrbanWear',
                'category' => 'Casual',
                'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
                'variants' => [
                    ['size' => 'S', 'color' => 'White', 'stock' => 20],
                    ['size' => 'M', 'color' => 'White', 'stock' => 25],
                    ['size' => 'L', 'color' => 'White', 'stock' => 18],
                ],
            ],
            [
                'name' => 'Grey Everyday Shirt',
                'description' => 'Soft everyday shirt for casual wear.',
                'base_price' => 27.99,
                'brand' => 'UrbanWear',
                'category' => 'Casual',
                'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
                'variants' => [
                    ['size' => 'S', 'color' => 'Grey', 'stock' => 15],
                    ['size' => 'M', 'color' => 'Grey', 'stock' => 18],
                    ['size' => 'L', 'color' => 'Grey', 'stock' => 12],
                ],
            ],
            [
                'name' => 'Black Athletic Shirt',
                'description' => 'Breathable shirt for training and gym.',
                'base_price' => 34.99,
                'brand' => 'ActiveFit',
                'category' => 'Athletic',
                'image' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
                'variants' => [
                    ['size' => 'M', 'color' => 'Black', 'stock' => 16],
                    ['size' => 'L', 'color' => 'Black', 'stock' => 12],
                ],
            ],
            [
                'name' => 'Red Training Shirt',
                'description' => 'Light athletic shirt for running and gym.',
                'base_price' => 32.99,
                'brand' => 'ActiveFit',
                'category' => 'Athletic',
                'image' => 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
                'variants' => [
                    ['size' => 'S', 'color' => 'Red', 'stock' => 10],
                    ['size' => 'M', 'color' => 'Red', 'stock' => 14],
                    ['size' => 'L', 'color' => 'Red', 'stock' => 9],
                ],
            ],
            [
                'name' => 'Blue Formal Shirt',
                'description' => 'Clean formal shirt for office and events.',
                'base_price' => 49.99,
                'brand' => 'OfficeLine',
                'category' => 'Formal',
                'image' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
                'variants' => [
                    ['size' => 'M', 'color' => 'Blue', 'stock' => 10],
                    ['size' => 'L', 'color' => 'Blue', 'stock' => 8],
                ],
            ],
            [
                'name' => 'White Dress Shirt',
                'description' => 'Classic white shirt for work and meetings.',
                'base_price' => 54.99,
                'brand' => 'OfficeLine',
                'category' => 'Formal',
                'image' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
                'variants' => [
                    ['size' => 'M', 'color' => 'White', 'stock' => 12],
                    ['size' => 'L', 'color' => 'White', 'stock' => 10],
                    ['size' => 'XL', 'color' => 'White', 'stock' => 7],
                ],
            ],
            [
                'name' => 'Green Polo Shirt',
                'description' => 'Classic polo shirt for casual style.',
                'base_price' => 39.99,
                'brand' => 'PoloCore',
                'category' => 'Polo',
                'image' => 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80',
                'variants' => [
                    ['size' => 'M', 'color' => 'Green', 'stock' => 14],
                    ['size' => 'L', 'color' => 'Green', 'stock' => 11],
                ],
            ],
            [
                'name' => 'Navy Polo Shirt',
                'description' => 'Simple navy polo for daily wear.',
                'base_price' => 42.99,
                'brand' => 'PoloCore',
                'category' => 'Polo',
                'image' => 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
                'variants' => [
                    ['size' => 'S', 'color' => 'Navy', 'stock' => 10],
                    ['size' => 'M', 'color' => 'Navy', 'stock' => 16],
                    ['size' => 'L', 'color' => 'Navy', 'stock' => 13],
                ],
            ],
            [
                'name' => 'Silver Sport Watch',
                'description' => 'Sport watch for training and daily use.',
                'base_price' => 129.99,
                'brand' => 'TimePro',
                'category' => 'SportWatch',
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Silver', 'stock' => 15],
                    ['size' => 'One Size', 'color' => 'Black', 'stock' => 12],
                ],
            ],
            [
                'name' => 'Blue Sport Watch',
                'description' => 'Lightweight sport watch for active days.',
                'base_price' => 119.99,
                'brand' => 'TimePro',
                'category' => 'SportWatch',
                'image' => 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Blue', 'stock' => 14],
                ],
            ],
            [
                'name' => 'Gold Classic Watch',
                'description' => 'Elegant classic watch for formal style.',
                'base_price' => 199.99,
                'brand' => 'LuxTime',
                'category' => 'Classic',
                'image' => 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Gold', 'stock' => 8],
                ],
            ],
            [
                'name' => 'Brown Classic Watch',
                'description' => 'Simple classic watch with leather look.',
                'base_price' => 179.99,
                'brand' => 'LuxTime',
                'category' => 'Classic',
                'image' => 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Brown', 'stock' => 9],
                ],
            ],
            [
                'name' => 'Black Smart Watch',
                'description' => 'Smart watch with fitness tracking.',
                'base_price' => 159.99,
                'brand' => 'TechPulse',
                'category' => 'Smart',
                'image' => 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Black', 'stock' => 20],
                ],
            ],
            [
                'name' => 'White Smart Watch',
                'description' => 'Clean smart watch for daily tracking.',
                'base_price' => 149.99,
                'brand' => 'TechPulse',
                'category' => 'Smart',
                'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'White', 'stock' => 16],
                ],
            ],
            [
                'name' => 'Luxury Steel Watch',
                'description' => 'Premium luxury steel watch.',
                'base_price' => 299.99,
                'brand' => 'RoyalTick',
                'category' => 'Luxury',
                'image' => 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Silver', 'stock' => 6],
                ],
            ],
            [
                'name' => 'Black Luxury Watch',
                'description' => 'Premium black luxury watch.',
                'base_price' => 329.99,
                'brand' => 'RoyalTick',
                'category' => 'Luxury',
                'image' => 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Black', 'stock' => 5],
                ],
            ],
        ];

        foreach ($catalog as $item) {
            $product = Product::create([
                'name' => $item['name'],
                'description' => $item['description'],
                'base_price' => $item['base_price'],
                'brand' => $item['brand'],
                'category' => $item['category'],
            ]);

            $product->images()->create(['image_url' => $item['image']]);
            $product->variants()->createMany($item['variants']);
        }
    }
}
