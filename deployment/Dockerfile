FROM node:14-alpine AS builder
RUN apk add --no-cache \
  g++ \
  git \
  make \
  python
WORKDIR /refacto
# this runs from the build folder
COPY . .
RUN DISABLE_OPENCOLLECTIVE=1 npm install --production

FROM node:14-alpine
RUN addgroup -S refacto && adduser -S refacto -G refacto
WORKDIR /refacto
COPY --from=builder /refacto /refacto
USER refacto
EXPOSE 5000
CMD ["./index.js"]
