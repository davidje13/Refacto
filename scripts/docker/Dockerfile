FROM node:24-alpine

# install coreutils-env (to support env's -S argument) and all npm dependencies
RUN --mount=type=bind,readonly,source=package.json,target=/usr/refacto/package.json \
    --mount=type=bind,readonly,source=package-lock.json,target=/usr/refacto/package-lock.json \
    apk add --no-cache coreutils-env \
 && npm ci --prefix=/usr/refacto --omit=dev

# copy application files
COPY \
  --exclude=node_modules \
  --exclude=package-lock.json \
  --exclude=*.tar.gz \
  --exclude=Dockerfile \
  . /usr/refacto

# use unprivileged 'node' user
USER 1000

EXPOSE 5000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --start-interval=1s --retries=3 \
  CMD wget --tries=1 -qO /dev/null "http://localhost:${PORT:-5000}/api/health"
ENTRYPOINT ["/usr/refacto/index.js"]
CMD []
