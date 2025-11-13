# 🔐 Security Best Practices

## Overview

This document outlines security considerations and best practices for deploying Subtrackify Backend in production.

## 🚨 Critical: Before Production Deployment

### 1. Change All Default Credentials

⚠️ **NEVER use default credentials in production!**

Update the following in your `.env` file:

```bash
# Generate a strong database password
DB_PASSWORD=$(openssl rand -base64 24)

# Generate a secure JWT secret (at least 32 characters)
JWT_SECRET=$(openssl rand -base64 32)

# Set strong pgAdmin credentials
PGADMIN_EMAIL=your-email@yourdomain.com
PGADMIN_PASSWORD=$(openssl rand -base64 24)
```

### 2. Required Environment Variables

Make sure these are set in production:

- ✅ `JWT_SECRET` - Long, cryptographically secure random string
- ✅ `DB_PASSWORD` - Strong, randomly generated password
- ✅ `PGADMIN_PASSWORD` - Strong password (if using pgAdmin)
- ✅ `PGADMIN_EMAIL` - Valid email address (if using pgAdmin)

### 3. Disable pgAdmin in Production

pgAdmin should **NOT** run in production by default. It's included in a `tools` profile:

```bash
# To run pgAdmin in production (not recommended)
docker-compose --profile tools up -d

# Normal production startup (without pgAdmin)
docker-compose up -d
```

## 🔒 Additional Security Recommendations

### Database Security

1. **Restrict Database Access**
   - Don't expose PostgreSQL port `5432` to the internet
   - Use firewall rules to limit access
   - Consider using connection pooling (PgBouncer)

2. **Use SSL/TLS**
   - Enable SSL for PostgreSQL connections in production
   - Update `DATABASE_URL` with `?sslmode=require`

3. **Regular Backups**
   - Set up automated database backups
   - Store backups in a secure location
   - Test restore procedures regularly

### Application Security

1. **JWT Configuration**
   - Use strong JWT secrets (32+ characters)
   - Set appropriate token expiration times
   - Consider implementing refresh tokens

2. **HTTPS Only**
   - Use a reverse proxy (nginx, Traefik) with SSL/TLS
   - Redirect all HTTP traffic to HTTPS
   - Use Let's Encrypt for free SSL certificates

3. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Consider using middleware like `@fastify/rate-limit`

4. **Input Validation**
   - Always validate user input (already using Zod)
   - Sanitize data before database operations
   - Use parameterized queries (Prisma handles this)

### Docker Security

1. **Image Versions**
   - Pin specific versions instead of `latest` for production
   - Example: `dpage/pgadmin4:8.0` instead of `dpage/pgadmin4:latest`

2. **Non-Root User**
   - Application already runs as non-root user (✅)
   - Verify: `USER nodejs` in Dockerfile

3. **Minimize Attack Surface**
   - Keep images updated with security patches
   - Use multi-stage builds (already implemented ✅)
   - Scan images for vulnerabilities: `docker scan subtrackify-api`

### Network Security

1. **Firewall Configuration**
   - Only expose necessary ports (3000 for API)
   - Don't expose database or pgAdmin ports publicly

2. **Docker Network**
   - Services use isolated Docker network (✅)
   - Only API service should be publicly accessible

## 📝 Security Checklist

Before deploying to production:

- [ ] Changed `DB_PASSWORD` from default
- [ ] Changed `JWT_SECRET` from default
- [ ] Changed `PGADMIN_EMAIL` and `PGADMIN_PASSWORD` (if using)
- [ ] Disabled pgAdmin or secured it properly
- [ ] PostgreSQL port not exposed to internet
- [ ] Using HTTPS with valid SSL certificate
- [ ] Set up database backups
- [ ] Implemented rate limiting
- [ ] Set up monitoring and logging
- [ ] Reviewed and tested error handling
- [ ] Set appropriate CORS policies
- [ ] Configured firewall rules

## 🔍 Monitoring & Logging

1. **Application Logs**
   - Monitor application logs: `docker-compose logs -f api`
   - Set up log aggregation (ELK stack, CloudWatch, etc.)

2. **Health Checks**
   - Monitor `/health` endpoint
   - Set up alerts for service failures

3. **Security Monitoring**
   - Monitor for suspicious activity
   - Track failed authentication attempts
   - Set up intrusion detection

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Fastify Security](https://fastify.dev/docs/latest/Reference/Security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

## 🆘 Incident Response

If you suspect a security breach:

1. Immediately rotate all credentials
2. Review application and database logs
3. Check for unauthorized access or data changes
4. Notify affected users if necessary
5. Document the incident and response

---

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update your security measures.
