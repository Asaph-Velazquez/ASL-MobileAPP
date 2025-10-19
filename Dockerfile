FROM node:latest
WORKDIR /app
COPY package.*json ./
RUN npm intall -g expoFROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install -g expo-cli && npm install

COPY . .

EXPOSE 19000 19001 19002

CMD ["expo", "start", "--tunnel"]
