# DiagAutoFrontend

## Premium con Stripe

El quinto vehículo requiere Premium: pago único de 99,99 EUR mediante Stripe Checkout, en modo de pruebas. Configura las claves únicamente en el backend siguiendo [la guía de Stripe](../diagAuto-backend/STRIPE.md). El frontend solo actualiza el plan cuando el backend confirma el pago.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.26.

## Servidor:

Para arrancar el servidor local:

```bash
ng serve
```
o
```bash
ng serve -o
```

Una vez que el servidor esté en marcha, abre tu navegador y dirígete a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques alguno de los archivos fuente.

## Generación de código base

Angular CLI incluye potentes herramientas de generación de código (scaffolding). Para generar un nuevo componente, ejecuta:

```bash
ng generate component component-name
```

Para obtener una lista completa de los esquemas disponibles (como `components`, `directives` o `pipes`), ejecuta:

```bash
ng generate --help
```

## Building

Para build el projecto ejecutar:

```bash
ng build
```

Esto compilará tu proyecto y almacenará los artefactos de compilación en el directorio `dist/`. Por defecto, la compilación para producción optimiza tu aplicación en cuanto a rendimiento y velocidad.

## Ejecución de tests unitarios

Para ejecutar pruebas unitarias con el ejecutor de pruebas [Vitest](https://vitest.dev/), utiliza el siguiente comando:

```bash
ng test
```

## Ejecución de test end-to-end

Para tests end-to-end (e2e), ejecutar:

```bash
ng e2e
```

Angular CLI no incluye un framework de pruebas de extremo a extremo (end-to-end) por defecto. Puedes elegir el que mejor se adapte a tus necesidades.

## Recursos adicionales

Para obtener más información sobre el uso de Angular CLI, incluidas referencias detalladas de los comandos, visita la página [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).


## Presentación

https://docs.google.com/presentation/d/1kM7Dr1o0jov47wGJ3px6yUjdj_PoUtGTweqe-iRgOQY/edit?slide=id.p#slide=id.p
