FROM node:24

WORKDIR /RevDig

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN npm ci 

COPY apps/backend ./apps/backend

WORKDIR /RevDig/apps/backend

RUN npx prisma generate

CMD ["sh", "-c", "npm run prisma:deploy && npm run dev"]

