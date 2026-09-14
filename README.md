# Pedidos360 · Microservicio de usuarios

Microservicio de perfiles de usuario implementado con NestJS, TypeScript,
PostgreSQL y AWS Lambda.

## Responsabilidad

Amazon Cognito sigue siendo la fuente de verdad para email, contraseña, MFA y
grupos. Este servicio almacena solamente el perfil de negocio. La clave primaria
`user_id` es el claim `sub` del token validado por API Gateway.

## Estructura

```text
src/
├── auth/
│   ├── decorators/
│   ├── guards/
│   └── interfaces/
├── common/constants/
├── database/
├── users/
│   ├── controllers/
│   ├── dto/
│   ├── interfaces/
│   ├── repositories/
│   ├── services/
│   └── users.module.ts
├── app.module.ts
├── bootstrap.ts
├── lambda.ts
└── main.ts
test/
├── users.controller.spec.ts
└── users.service.spec.ts
```

El controlador recibe HTTP, el servicio contiene los casos de uso y el
repositorio encapsula PostgreSQL. Las interfaces mantienen el servicio
independiente de la implementación de persistencia.

## Endpoints

### `GET /status`

Comprueba que API Gateway puede invocar la Lambda. Es público y no requiere
Cognito ni una conexión a PostgreSQL.

```json
{
  "status": "ok",
  "service": "users",
  "timestamp": "2026-09-14T12:00:00.000Z"
}
```

### `GET /users/me`

Devuelve el perfil del usuario autenticado. Responde `404` si todavía no existe.

### `PUT /users/me`

Crea o actualiza el perfil del usuario autenticado.

```json
{
  "displayName": "Ana Pérez",
  "address": "Santiago, Chile"
}
```

El cliente no puede enviar `userId`, email ni grupos. El identificador se obtiene
del authorizer de Cognito mediante `CognitoAuthGuard`.

## Desarrollo

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run build
```

Cuando PostgreSQL esté disponible:

```bash
npm run start:dev
```

La aplicación HTTP local utiliza el puerto `3000` por defecto.

## PostgreSQL

1. Crea una base de datos PostgreSQL.
2. Ejecuta `migrations/001_create_user_profiles.sql`.
3. Copia `.env.example` como `.env` para pruebas locales.
4. Configura `DATABASE_URL`.

La migración es SQL manual y no crea infraestructura AWS.

## Despliegue en Lambda

`npm run build` genera `dist/lambda.js` y el resto de la aplicación compilada.
El handler configurado en Lambda será:

```text
dist/lambda.handler
```

El ZIP deberá conservar `dist/`, `package.json` y las dependencias de producción
en `node_modules/`. El adaptador `@codegenie/serverless-express` convierte los
eventos de API Gateway en solicitudes HTTP para los controladores NestJS.

Variables previstas para Lambda:

```text
DATABASE_URL
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA=<certificado CA cuando corresponda>
CORS_ORIGIN=http://localhost:5173
```

Para producción, la contraseña no debe quedar escrita directamente en la
configuración de Lambda. La conexión se adaptará a Secrets Manager cuando se cree
la base de datos. Si PostgreSQL está en una VPC privada, la Lambda también tendrá
que conectarse a esa VPC y se recomienda usar RDS Proxy para controlar conexiones.

## CI/CD

El workflow `.github/workflows/deploy.yml` se ejecuta al hacer push a `main`, usa
GitHub OIDC para obtener credenciales temporales y actualiza el ZIP de una Lambda
existente. No crea ni modifica infraestructura adicional.

La preparación manual de GitHub, IAM, Lambda, PostgreSQL y API Gateway está en
[`docs/deployment.md`](docs/deployment.md).
