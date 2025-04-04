FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Supprimer le favicon.ico du dossier app pour éviter le conflit
RUN rm -f src/app/favicon.ico

# Add this environment variable to skip linting during the build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build with the --no-lint flag to skip linting during build
RUN npm run build -- --no-lint

EXPOSE 3000

CMD ["npm", "start"] 