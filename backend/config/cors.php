<?php

return [

    'paths' => ['api/*', 'health', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
        'https://kambo-kicks-zeta.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ])),

    // Preview deployments + any Vercel alias
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
