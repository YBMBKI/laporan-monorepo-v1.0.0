FROM node:20-alpine

WORKDIR /app/apps/api

# copy only package files first for faster installs
COPY apps/api/package*.json ./

RUN npm install --no-audit --no-fund

# copy source
COPY apps/api ./

# generate prisma client and build
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
