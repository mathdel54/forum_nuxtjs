FROM node:20-alpine

WORKDIR /app

# Installer les outils nécessaires pour compiler les dépendances natives
RUN apk add --no-cache --virtual .gyp python3 make g++

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Supprimer les outils de compilation pour réduire la taille de l'image
RUN apk del .gyp

# Copier le reste des fichiers du projet
COPY . .

# Construire l'application
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", ".output/server/index.mjs"]