# SocialVentura Desktop App

Application desktop Electron pour SocialVentura, votre plateforme de marketing digital.

## Installation

1. Assurez-vous d'avoir Node.js installé sur votre machine
2. Clonez ce dépôt
3. Installez les dépendances :
```bash
npm install
```

## Développement

Pour lancer l'application en mode développement :
```bash
npm start
```

## Build

Pour créer un exécutable de l'application :
```bash
npm run build
```

Les fichiers de build seront générés dans le dossier `dist`.

## Fonctionnalités

- Interface utilisateur moderne et attrayante
- Redirection automatique vers la page de connexion
- Persistance des sessions
- Bouton pour ouvrir la version web dans le navigateur
- Option de désinstallation intégrée

## Structure du projet

- `main.js` : Point d'entrée de l'application Electron
- `startup.html` : Page de démarrage stylée
- `assets/` : Dossier contenant les ressources (icônes, logo)
- `package.json` : Configuration du projet et dépendances 