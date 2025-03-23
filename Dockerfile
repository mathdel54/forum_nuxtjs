FROM node:20-alpine

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Installer bcrypt (peut nécessiter des dépendances de compilation)
RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm install bcrypt \
    && apk del .gyp

# Construire l'application
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", ".output/server/index.mjs"]