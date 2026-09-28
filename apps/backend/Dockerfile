FROM node:24

WORKDIR /RevDig

COPY package.json package-lock.json node_modules/ tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN npm install 

COPY apps/backend ./apps/backend

WORKDIR /RevDig/apps/backend

RUN npx prisma generate

CMD ["npm", "run", "dev"]

