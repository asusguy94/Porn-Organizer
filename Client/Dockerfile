FROM node:20-alpine3.18 as base

# Stage 1: Build the React application
FROM base as build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

# Stage 2: Serve the React application with Nginx
FROM base as serve

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/vite.config.ts ./vite.config.ts

EXPOSE 3000

CMD ["npx", "vite", "preview", "--port", "3000"]