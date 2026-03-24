FROM node:20-alpine

WORKDIR /app

# 👇 Accept build arg
ARG VITE_API_URL

# 👇 Set env inside container
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm install -g serve

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
