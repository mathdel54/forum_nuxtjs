# Compte Rendu

## Présentation de l'application

Cette application est un forum web développé avec Nuxt 3, permettant aux utilisateurs de s'inscrire, se connecter, créer des forums, des sujets et des messages, avec une gestion des rôles (utilisateur/admin).  
L'interface utilisateur repose sur Vuetify pour offrir une expérience moderne, responsive et accessible. La navigation est structurée autour de pages dédiées pour l'inscription, la connexion, la gestion du compte, la création de forums, de sujets et la consultation des discussions.  
Les utilisateurs authentifiés peuvent créer de nouveaux sujets, répondre aux messages, modifier ou supprimer leurs propres messages, tandis que les administrateurs disposent d'un espace dédié pour gérer les forums et les comptes administrateurs.  
Les données sont stockées dans une bdd MySQL, initialisée automatiquement au démarrage grâce à un plugin serveur. L'application est entièrement dockerisée via Docker et Docker Compose, ce qui facilite le déploiement et l'orchestration des services (application et base de données).  
L'authentification est gérée par des tokens JWT, stockés côté client et transmis dans l'en-tête Authorization pour chaque requête API. Les notifications en temps réel (nouveaux messages, suppression de sujets) sont assurées par un serveur WebSocket intégré à Nitro, permettant une synchronisation instantanée de l'interface pour tous les utilisateurs connectés.

## Choix techniques

- **Nuxt 3** : Framework moderne basé sur Vue 3, facilitant le développement SSR et l'organisation du code.
- **Vuetify** : Bibliothèque de composants UI pour Vue, assurant une interface cohérente et esthétique.
- **Pinia** : Gestionnaire d'état pour Vue 3, utilisé pour stocker l'état d'authentification et les informations utilisateur.
- **MySQL** : Base de données relationnelle robuste, adaptée à la structure forum (utilisateurs, forums, sujets, messages).
- **Token JWT** : Authentification stateless, chaque requête API protégée nécessite un token JWT dans l'en-tête Authorization.
- **WebSockets** : Utilisés pour la notification en temps réel des nouveaux messages et suppressions de sujets.
- **Docker** : Pour l'orchestration des services (app + base de données) et la portabilité de l'environnement.

## Difficultés rencontrées

- **WebSockets** :  
  L'intégration des WebSockets avec Nuxt 3 et Nitro a été complexe, notamment pour la gestion des connexions, la diffusion des messages à tous les clients et la synchronisation des événements (nouveaux messages, suppression de sujets) côté client.  
  Il a fallu gérer la reconnexion automatique en cas de perte de connexion, la gestion des abonnements par topic, et la cohérence des états côté client lors de la réception de notifications multiples. Des problèmes de compatibilité entre le protocole WebSocket natif et les middlewares Nitro ont également été rencontrés, nécessitant des ajustements dans la gestion des messages JSON et des erreurs réseau.

- **Utilisation de JWT au lieu de cookies de session** :  
  Le choix d'utiliser des tokens JWT dans les en-têtes Authorization a nécessité d'adapter tout le middleware d'authentification, la récupération de l'utilisateur courant et la sécurisation des routes API. Cela a aussi impliqué de gérer le stockage du token côté client et son rafraîchissement.  
  Des difficultés sont apparues pour sécuriser le stockage du token (éviter le XSS), gérer l'expiration automatique et forcer la déconnexion côté client. Il a également fallu adapter la logique de changement de mot de passe et de gestion des droits d'accès pour que tout repose sur le JWT.

- **Problèmes d'authentification** :  
  Plusieurs soucis sont apparus lors de la vérification du token JWT, notamment la gestion des erreurs (token expiré, absent ou invalide), la propagation correcte de l'utilisateur authentifié dans le contexte serveur, et la compatibilité avec les différentes routes protégées.  
  Des bugs ont été rencontrés lors de la synchronisation de l'état d'authentification entre le store Pinia et le backend, provoquant parfois des affichages incohérents (utilisateur déconnecté alors que le token est encore valide).  
  Enfin, la gestion des droits d'accès fins (modification/suppression de messages uniquement par l'auteur ou un admin) a nécessité une vérification systématique côté serveur, ce qui a complexifié le code des endpoints API.

## Conclusion

Le projet aboutit à un forum fonctionnel, sécurisé et moderne, mais a nécessité de surmonter des difficultés techniques liées à l'authentification JWT et à la gestion des WebSockets en temps réel. Ces choix, bien que plus complexes à mettre en œuvre, offrent une architecture plus moderne et scalable.
