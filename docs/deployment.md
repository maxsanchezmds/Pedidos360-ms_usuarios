# Despliegue manual y pipeline

El workflow `.github/workflows/deploy.yml` valida, empaqueta y actualiza el código
de una Lambda existente cuando se hace push a `main`. No crea infraestructura.

## 1. Repositorio GitHub

Este repositorio local todavía no tiene un remoto configurado. Crea o selecciona
un repositorio GitHub y vincúlalo antes de esperar que el pipeline se ejecute.

El workflow se activa con:

- push a `main`;
- ejecución manual desde la pestaña Actions.

## 2. Variables del repositorio

En GitHub abre `Settings → Secrets and variables → Actions → Variables` y crea:

| Variable | Ejemplo |
|---|---|
| `AWS_ACCOUNT_ID` | `123456789012` |
| `AWS_REGION` | `us-east-1` |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/pedidos360-github-deploy-role` |
| `LAMBDA_FUNCTION_NAME` | `pedidos360-dev-users-fn` |

No son necesarias access keys. No guardes la contraseña de PostgreSQL en GitHub.

## 3. Permisos mínimos del rol OIDC

Además de su trust policy para GitHub OIDC, el rol asumido por el pipeline necesita
una política de permisos como esta, reemplazando región, cuenta y nombre:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DeployUsersLambdaCode",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode"
      ],
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:pedidos360-dev-users-fn"
    }
  ]
}
```

La trust policy debe limitar el `sub` de GitHub al repositorio correcto y a
`refs/heads/main`. Si posteriormente agregas un GitHub Environment, el formato del
`sub` cambia y tendrás que actualizar la condición de confianza.

## 4. Lambda que debe existir

Crea manualmente la función en la consola AWS:

| Campo | Valor recomendado |
|---|---|
| Function name | `pedidos360-dev-users-fn` |
| Runtime | Node.js 24.x |
| Architecture | `x86_64` |
| Handler | `dist/lambda.handler` |
| Memory | 512 MB |
| Timeout | 15 segundos |
| Package type | Zip |

El rol de ejecución de la Lambda es distinto del rol OIDC de despliegue. El rol de
ejecución necesitará CloudWatch Logs y, posteriormente, acceso de lectura al
secreto de PostgreSQL.

La función puede recibir despliegues antes de crear PostgreSQL, pero las
invocaciones fallarán hasta configurar la conexión.

## 5. Configuración posterior de PostgreSQL

Cuando exista la base de datos:

1. Ejecuta `migrations/001_create_user_profiles.sql`.
2. Crea un secreto en Secrets Manager con las credenciales.
3. Da al rol de ejecución de Lambda permiso `secretsmanager:GetSecretValue` sólo
   para ese secreto.
4. Conecta Lambda a las subredes privadas de la VPC.
5. Configura Security Groups para permitir Lambda → PostgreSQL por TCP 5432.
6. Considera RDS Proxy para no agotar conexiones durante concurrencia.
7. Configura el certificado CA y TLS de RDS.

El código todavía usa `DATABASE_URL`; se adaptará a Secrets Manager al conectar la
base para que la contraseña no quede como variable visible de Lambda.

## 6. API Gateway

Después de validar la conexión a PostgreSQL:

1. Crea una REST API en API Gateway.
2. Crea un Cognito User Pool Authorizer.
3. Expón `GET /users/me` y `PUT /users/me` con Lambda proxy integration.
4. Protege ambos métodos con el authorizer.
5. Configura CORS para el origen del frontend.
6. Despliega el stage `dev`.

