FROM node:18-alpine
WORKDIR /app
COPY package.json server.js index.html styles.css script.js i18n.js ./
EXPOSE 8080
CMD ["node", "server.js"]
