<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Router zabezpečuje smerovanie HTTP požiadaviek
 * na príslušné obslužné funkcie.
 */
class Router
{
    // Zoznam zaregistrovaných API trás.
    private array $routes = [];

    /**
     * Zaregistruje novú API trasu.
     */
    public function add(string $method, string $path, callable $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler
        ];
    }

    
    /**
    * Porovná URL s definovanou trasou a získa jej parametre.
    */
    private function matchRoute(string $routePath, string $requestPath): ?array
    {
        // Ošetríme špeciálne znaky regulárneho výrazu.
        $pattern = preg_quote($routePath, '~');

        // Parametre v zložených zátvorkách nahradíme regexom.
        $pattern = preg_replace(
            '/\\\\\{([a-zA-Z_][a-zA-Z0-9_]*)\\\\\}/',
            '(?P<$1>[^/]+)',
            $pattern
        );

        if ($pattern === null) {
            return null;
        }

        // Overíme zhodu celej URL.
        if (!preg_match('~^' . $pattern . '$~D', $requestPath, $matches)) {
            return null;
        }

        // Ponecháme iba pomenované parametre.
        return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
    }

    /**
     * Vyhľadá trasu a vykoná jej obslužnú funkciu.
     */
    public function dispatch(string $method, string $uri): void
    {
        // Z URI získame cestu bez query parametrov.
        $path = parse_url($uri, PHP_URL_PATH);

        if (!is_string($path)) {
            Response::error(
                'BAD_REQUEST',
                'Neplatná adresa požiadavky.',
                400
            );
            return;
        }

        $allowedMethods = [];

        // Vyhľadáme trasu a skontrolujeme HTTP metódu.
        foreach ($this->routes as $route) {
            $params = $this->matchRoute($route['path'], $path);

            if ($params === null) {
                continue;
            }

            //Cesta existuje, zapamätáme si povolenú metódu.
            $allowedMethods[] = $route['method'];

            if ($route['method'] === strtoupper($method)) {
                $route['handler'](...array_values($params));
                return;
            }
        }

        // cesta existuje, ale použitá HTTP metóda nie je povolená.
        if (!empty($allowedMethods)) {
            header('Allow: ' . implode(', ', array_unique($allowedMethods)));

            Response::error(
                'METHOD_NOT_ALLOWED',
                'HTTP metóda nie je pre túto cestu povolená.',
                405
            );
            return;
        }

        // Cesta vôbec neexistuje.
        Response::error(
            'NOT_FOUND',
            'Požadovaná cesta neexistuje.',
            404
        );
    }
}