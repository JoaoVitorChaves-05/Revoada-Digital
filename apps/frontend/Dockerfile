FROM node:24

WORKDIR /RevDig

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN npm ci

COPY apps/frontend ./apps/frontend

WORKDIR /RevDig/apps/frontend

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
