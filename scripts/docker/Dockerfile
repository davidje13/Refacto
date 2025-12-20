FROM node:24-alpine

WORKDIR /usr/refacto

# install coreutils (to support env's -S argument) and all npm dependencies
RUN --mount=type=bind,readonly,source=package.json,target=/usr/refacto/package.json --mount=type=bind,readonly,source=package-lock.json,target=/usr/refacto/package-lock.json \
    apk update \
 && apk add --no-cache coreutils \
 && npm ci --omit=dev

# copy application files
COPY --exclude=node_modules . ./

# use unprivileged node user
USER 1000

EXPOSE 5000
ENV NODE_ENV=production
ENTRYPOINT ["./index.js"]
