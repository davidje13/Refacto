FROM node:24-alpine

# install coreutils (to support env's -S argument) and all npm dependencies
RUN --mount=type=bind,readonly,source=package.json,target=/usr/refacto/package.json \
    --mount=type=bind,readonly,source=package-lock.json,target=/usr/refacto/package-lock.json \
    apk add --no-cache coreutils \
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
ENTRYPOINT ["/usr/refacto/index.js"]
CMD []
