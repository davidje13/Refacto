FROM node:24-alpine

# install coreutils-env (to support env's -S argument), copy application files, set /data owner
# (all done as one step to reduce the number of filesystem layers in the final image, for best performance)
RUN --mount=type=bind,readonly,source=.,target=/usr/refacto/files \
    apk add --no-cache coreutils-env \
 && cp -r /usr/refacto/files/package.json /usr/refacto/files/*.js /usr/refacto/files/static /usr/refacto \
 && mkdir /data && chown node /data

# use unprivileged 'node' user
USER 1000

EXPOSE 5000
VOLUME /data
ENV NODE_ENV=production DB_URL=sqlite:///data/main
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --start-interval=1s --retries=3 \
  CMD wget --tries=1 -qO /dev/null "http://localhost:${PORT:-5000}/api/health"
ENTRYPOINT ["/usr/refacto/index.js"]
CMD []
