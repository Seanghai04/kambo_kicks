<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE order_items, orders, product_variants, product_images, products, personal_access_tokens, users RESTART IDENTITY CASCADE');

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

        // White-background studio shots live in frontend/public/products.
        // Relative paths resolve on the Next.js host (Vercel).
        $img = fn (string $file) => '/products/'.$file;

        $shoeSizes = [
            ['size' => 'EU 40', 'color' => 'Black', 'stock' => 12],
            ['size' => 'EU 41', 'color' => 'Black', 'stock' => 15],
            ['size' => 'EU 42', 'color' => 'Black', 'stock' => 14],
            ['size' => 'EU 43', 'color' => 'White', 'stock' => 10],
        ];

        $shirtSizes = [
            ['size' => 'S', 'color' => 'White', 'stock' => 18],
            ['size' => 'M', 'color' => 'White', 'stock' => 22],
            ['size' => 'L', 'color' => 'Black', 'stock' => 16],
            ['size' => 'XL', 'color' => 'Navy', 'stock' => 12],
        ];

        $watchSizes = [
            ['size' => 'One Size', 'color' => 'Silver', 'stock' => 14],
            ['size' => 'One Size', 'color' => 'Black', 'stock' => 16],
        ];

        $catalog = [
            // —— Running (8) ——
            ['name' => 'Nike Air Max Pulse', 'description' => 'Cushioned daily runner with Max Air comfort.', 'base_price' => 149.99, 'brand' => 'Nike', 'category' => 'Running', 'image' => $img('shoe-running-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Nike Pegasus 41', 'description' => 'Reliable road running shoe for long miles.', 'base_price' => 139.99, 'brand' => 'Nike', 'category' => 'Running', 'image' => $img('shoe-running-02.png'), 'variants' => $shoeSizes],
            ['name' => 'Nike Revolution 7', 'description' => 'Lightweight entry runner for everyday training.', 'base_price' => 74.99, 'brand' => 'Nike', 'category' => 'Running', 'image' => $img('shoe-running-03.png'), 'variants' => $shoeSizes],
            ['name' => 'Adidas Ultraboost Light', 'description' => 'Responsive Boost cushioning for smooth runs.', 'base_price' => 159.99, 'brand' => 'Adidas', 'category' => 'Running', 'image' => $img('shoe-running-02.png'), 'variants' => $shoeSizes],
            ['name' => 'Adidas Adizero SL', 'description' => 'Fast tempo trainer built for speed sessions.', 'base_price' => 119.99, 'brand' => 'Adidas', 'category' => 'Running', 'image' => $img('shoe-running-03.png'), 'variants' => $shoeSizes],
            ['name' => 'New Balance Fresh Foam X', 'description' => 'Plush Fresh Foam midsole for easy miles.', 'base_price' => 129.99, 'brand' => 'New Balance', 'category' => 'Running', 'image' => $img('shoe-running-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Asics Gel-Nimbus 26', 'description' => 'Soft Gel cushioning for long-distance comfort.', 'base_price' => 154.99, 'brand' => 'Asics', 'category' => 'Running', 'image' => $img('shoe-running-02.png'), 'variants' => $shoeSizes],
            ['name' => 'Hoka Clifton 9', 'description' => 'Max cushion road shoe with smooth ride.', 'base_price' => 144.99, 'brand' => 'Hoka', 'category' => 'Running', 'image' => $img('shoe-running-03.png'), 'variants' => $shoeSizes],

            // —— Basketball (5) ——
            ['name' => 'Nike Dunk Low Retro', 'description' => 'Classic court-inspired lifestyle basketball shoe.', 'base_price' => 119.99, 'brand' => 'Nike', 'category' => 'Basketball', 'image' => $img('shoe-lifestyle-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Nike LeBron XXII', 'description' => 'High support basketball shoe for explosive play.', 'base_price' => 179.99, 'brand' => 'Nike', 'category' => 'Basketball', 'image' => $img('shoe-basketball-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Adidas Trae Young 3', 'description' => 'Court control shoe for quick cuts and stops.', 'base_price' => 129.99, 'brand' => 'Adidas', 'category' => 'Basketball', 'image' => $img('shoe-basketball-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Jordan Stay Loyal 3', 'description' => 'Heritage basketball look with modern cushioning.', 'base_price' => 109.99, 'brand' => 'Jordan', 'category' => 'Basketball', 'image' => $img('shoe-lifestyle-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Under Armour Lockdown 7', 'description' => 'Grip and lock for indoor basketball sessions.', 'base_price' => 89.99, 'brand' => 'Under Armour', 'category' => 'Basketball', 'image' => $img('shoe-basketball-01.png'), 'variants' => $shoeSizes],

            // —— Football (4) ——
            ['name' => 'Nike Mercurial Vapor 16', 'description' => 'Speed cleats for sharp acceleration on pitch.', 'base_price' => 139.99, 'brand' => 'Nike', 'category' => 'Football', 'image' => $img('shoe-football-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Nike Phantom GX 2', 'description' => 'Precise touch football boots for playmakers.', 'base_price' => 129.99, 'brand' => 'Nike', 'category' => 'Football', 'image' => $img('shoe-football-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Adidas Predator Elite', 'description' => 'Control-focused boots for striking accuracy.', 'base_price' => 149.99, 'brand' => 'Adidas', 'category' => 'Football', 'image' => $img('shoe-football-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Puma Future Match', 'description' => 'Flexible football cleats for agile movement.', 'base_price' => 99.99, 'brand' => 'Puma', 'category' => 'Football', 'image' => $img('shoe-football-01.png'), 'variants' => $shoeSizes],

            // —— Training (4) ——
            ['name' => 'Nike Metcon 9', 'description' => 'Stable trainer for lifts and HIIT workouts.', 'base_price' => 139.99, 'brand' => 'Nike', 'category' => 'Training', 'image' => $img('shoe-training-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Nike Free Metcon 6', 'description' => 'Flexible gym shoe for mixed training days.', 'base_price' => 119.99, 'brand' => 'Nike', 'category' => 'Training', 'image' => $img('shoe-training-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Adidas Dropset 3', 'description' => 'Supportive lifting shoe with firm base.', 'base_price' => 124.99, 'brand' => 'Adidas', 'category' => 'Training', 'image' => $img('shoe-training-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Reebok Nano X4', 'description' => 'Cross-training shoe for gym and circuits.', 'base_price' => 134.99, 'brand' => 'Reebok', 'category' => 'Training', 'image' => $img('shoe-training-01.png'), 'variants' => $shoeSizes],

            // —— Outdoor (4) ——
            ['name' => 'Nike Pegasus Trail 5', 'description' => 'Trail runner with grip for mixed terrain.', 'base_price' => 139.99, 'brand' => 'Nike', 'category' => 'Outdoor', 'image' => $img('shoe-outdoor-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Adidas Terrex Ax4', 'description' => 'Durable hiking shoe for weekend trails.', 'base_price' => 119.99, 'brand' => 'Adidas', 'category' => 'Outdoor', 'image' => $img('shoe-outdoor-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Columbia Peakfreak', 'description' => 'All-day outdoor shoe for light hikes.', 'base_price' => 99.99, 'brand' => 'Columbia', 'category' => 'Outdoor', 'image' => $img('shoe-outdoor-01.png'), 'variants' => $shoeSizes],
            ['name' => 'Merrell Moab Speed', 'description' => 'Fast hiking shoe with sticky outsole grip.', 'base_price' => 129.99, 'brand' => 'Merrell', 'category' => 'Outdoor', 'image' => $img('shoe-outdoor-01.png'), 'variants' => $shoeSizes],

            // —— Casual shirts (5) ——
            ['name' => 'Urban Essential Tee', 'description' => 'Soft everyday cotton tee for casual wear.', 'base_price' => 24.99, 'brand' => 'UrbanWear', 'category' => 'Casual', 'image' => $img('shirt-casual-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Clean Crew Tee', 'description' => 'Minimal crewneck tee with relaxed fit.', 'base_price' => 22.99, 'brand' => 'UrbanWear', 'category' => 'Casual', 'image' => $img('shirt-casual-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Weekend Soft Tee', 'description' => 'Breathable casual tee for daily comfort.', 'base_price' => 26.99, 'brand' => 'Basics Co', 'category' => 'Casual', 'image' => $img('shirt-casual-01.png'), 'variants' => $shirtSizes],
            ['name' => 'City Cotton Tee', 'description' => 'Classic casual shirt for everyday outfits.', 'base_price' => 27.99, 'brand' => 'Basics Co', 'category' => 'Casual', 'image' => $img('shirt-casual-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Lounge Daily Tee', 'description' => 'Lightweight casual tee for warm days.', 'base_price' => 21.99, 'brand' => 'Kambo Basics', 'category' => 'Casual', 'image' => $img('shirt-casual-01.png'), 'variants' => $shirtSizes],

            // —— Athletic shirts (4) ——
            ['name' => 'Active Dry Tee', 'description' => 'Moisture-wicking shirt for gym sessions.', 'base_price' => 34.99, 'brand' => 'ActiveFit', 'category' => 'Athletic', 'image' => $img('shirt-athletic-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Nike Dri-FIT Training Tee', 'description' => 'Breathable athletic tee for hard workouts.', 'base_price' => 39.99, 'brand' => 'Nike', 'category' => 'Athletic', 'image' => $img('shirt-athletic-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Adidas Own The Run Tee', 'description' => 'Light running shirt with sweat control.', 'base_price' => 36.99, 'brand' => 'Adidas', 'category' => 'Athletic', 'image' => $img('shirt-athletic-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Pulse Training Shirt', 'description' => 'Stretch athletic shirt for training days.', 'base_price' => 32.99, 'brand' => 'ActiveFit', 'category' => 'Athletic', 'image' => $img('shirt-athletic-01.png'), 'variants' => $shirtSizes],

            // —— Formal shirts (4) ——
            ['name' => 'Office Classic Oxford', 'description' => 'Clean formal shirt for office and meetings.', 'base_price' => 49.99, 'brand' => 'OfficeLine', 'category' => 'Formal', 'image' => $img('shirt-formal-01.png'), 'variants' => $shirtSizes],
            ['name' => 'White Dress Shirt', 'description' => 'Crisp white formal shirt for business wear.', 'base_price' => 54.99, 'brand' => 'OfficeLine', 'category' => 'Formal', 'image' => $img('shirt-formal-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Slim Formal Poplin', 'description' => 'Slim-fit formal shirt with smooth finish.', 'base_price' => 52.99, 'brand' => 'TailorForm', 'category' => 'Formal', 'image' => $img('shirt-formal-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Boardroom Stripe Shirt', 'description' => 'Smart formal shirt for presentations.', 'base_price' => 57.99, 'brand' => 'TailorForm', 'category' => 'Formal', 'image' => $img('shirt-formal-01.png'), 'variants' => $shirtSizes],

            // —— Polo (4) ——
            ['name' => 'Classic Navy Polo', 'description' => 'Timeless navy polo for smart casual looks.', 'base_price' => 42.99, 'brand' => 'PoloCore', 'category' => 'Polo', 'image' => $img('shirt-polo-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Heritage Pique Polo', 'description' => 'Breathable pique polo for daily style.', 'base_price' => 39.99, 'brand' => 'PoloCore', 'category' => 'Polo', 'image' => $img('shirt-polo-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Nike Golf Victory Polo', 'description' => 'Performance polo for sport and leisure.', 'base_price' => 54.99, 'brand' => 'Nike', 'category' => 'Polo', 'image' => $img('shirt-polo-01.png'), 'variants' => $shirtSizes],
            ['name' => 'Adidas Essentials Polo', 'description' => 'Simple polo with clean athletic finish.', 'base_price' => 44.99, 'brand' => 'Adidas', 'category' => 'Polo', 'image' => $img('shirt-polo-01.png'), 'variants' => $shirtSizes],

            // —— Sport watches (3) ——
            ['name' => 'TimePro Sprint Watch', 'description' => 'Sport chronograph for training and daily use.', 'base_price' => 119.99, 'brand' => 'TimePro', 'category' => 'SportWatch', 'image' => $img('watch-sport-01.png'), 'variants' => $watchSizes],
            ['name' => 'Garmin Style Runner', 'description' => 'Lightweight sport watch for active days.', 'base_price' => 149.99, 'brand' => 'TimePro', 'category' => 'SportWatch', 'image' => $img('watch-sport-01.png'), 'variants' => $watchSizes],
            ['name' => 'Pulse Active Chrono', 'description' => 'Bold sport watch with clear dial.', 'base_price' => 109.99, 'brand' => 'PulseGear', 'category' => 'SportWatch', 'image' => $img('watch-sport-01.png'), 'variants' => $watchSizes],

            // —— Classic watches (3) ——
            ['name' => 'LuxTime Heritage Gold', 'description' => 'Elegant classic watch for formal style.', 'base_price' => 199.99, 'brand' => 'LuxTime', 'category' => 'Classic', 'image' => $img('watch-classic-01.png'), 'variants' => $watchSizes],
            ['name' => 'LuxTime Leather Classic', 'description' => 'Simple classic watch with leather strap.', 'base_price' => 179.99, 'brand' => 'LuxTime', 'category' => 'Classic', 'image' => $img('watch-classic-01.png'), 'variants' => $watchSizes],
            ['name' => 'RoyalTick Dress Watch', 'description' => 'Refined classic timepiece for evenings.', 'base_price' => 219.99, 'brand' => 'RoyalTick', 'category' => 'Classic', 'image' => $img('watch-classic-01.png'), 'variants' => $watchSizes],

            // —— Smart watches (3) ——
            ['name' => 'TechPulse Smart Pro', 'description' => 'Smart watch with fitness tracking features.', 'base_price' => 159.99, 'brand' => 'TechPulse', 'category' => 'Smart', 'image' => $img('watch-smart-01.png'), 'variants' => $watchSizes],
            ['name' => 'TechPulse Lite Band', 'description' => 'Everyday smart watch for notifications.', 'base_price' => 129.99, 'brand' => 'TechPulse', 'category' => 'Smart', 'image' => $img('watch-smart-01.png'), 'variants' => $watchSizes],
            ['name' => 'NovaWear Smart SE', 'description' => 'Clean smart watch for health and time.', 'base_price' => 139.99, 'brand' => 'NovaWear', 'category' => 'Smart', 'image' => $img('watch-smart-01.png'), 'variants' => $watchSizes],

            // —— Luxury watches (3) ——
            ['name' => 'RoyalTick Steel Chrono', 'description' => 'Premium luxury steel chronograph watch.', 'base_price' => 299.99, 'brand' => 'RoyalTick', 'category' => 'Luxury', 'image' => $img('watch-luxury-01.png'), 'variants' => $watchSizes],
            ['name' => 'RoyalTick Black Edition', 'description' => 'Premium black luxury watch statement piece.', 'base_price' => 329.99, 'brand' => 'RoyalTick', 'category' => 'Luxury', 'image' => $img('watch-luxury-01.png'), 'variants' => $watchSizes],
            ['name' => 'Aether Prestige Chronograph', 'description' => 'Luxury chronograph with polished finish.', 'base_price' => 349.99, 'brand' => 'Aether', 'category' => 'Luxury', 'image' => $img('watch-luxury-01.png'), 'variants' => $watchSizes],
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
