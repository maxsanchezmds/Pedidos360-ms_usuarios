# Pedidos360 · Microservicio de usuarios

Lambda de perfiles de usuario para Pedidos360, implementada con Node.js,
TypeScript y PostgreSQL.

## Responsabilidad

Amazon Cognito sigue siendo la fuente de verdad para email, contraseña, MFA y
grupos. Este servicio almacena solamente el perfil de negocio. La clave primaria
`user_id` es el claim `sub` del token validado por API Gateway.

## Endpoints

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
del authorizer de Cognito.

## Desarrollo

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run build
```

## PostgreSQL

1. Crea una base de datos PostgreSQL.
2. Ejecuta `migrations/001_create_user_profiles.sql`.
3. Copia `.env.example` como `.env` para pruebas locales.
4. Configura `DATABASE_URL`.

La migración es SQL manual y no crea infraestructura AWS.

## Despliegue en Lambda

`npm run build` genera `dist/index.js`. Al crear la Lambda, el handler será:

```text
index.handler
```

Antes de empaquetar, coloca `dist/index.js` en la raíz del archivo ZIP. `esbuild`
incluye las dependencias de ejecución en ese archivo.

Variables previstas para Lambda:

```text
DATABASE_URL
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA=<certificado CA cuando corresponda>
```

Para producción, la contraseña no debería quedar escrita directamente en la
configuración de Lambda. La conexión se adaptará a Secrets Manager cuando se cree
la base de datos. Si PostgreSQL está en una VPC privada, la Lambda también tendrá
que conectarse a esa VPC y se recomienda usar RDS Proxy para controlar conexiones.

