# Adele & Oliver — invitation numérique

Invitation de mariage mobile-first, réalisée en HTML, CSS et JavaScript sans framework ni étape de compilation. L’enveloppe bordeaux, le papillon, le papier ivoire et le verso ornemental d’origine sont conservés.

## Utilisation

Ouvrir `index.html` dans un navigateur moderne ou publier les trois fichiers `index.html`, `style.css` et `script.js` sur un hébergement HTTPS.

Le parcours se contrôle avec les boutons **SUIVANT** et **PRÉCÉDENT**. La page finale reste inaccessible tant que le RSVP n’a pas été transmis avec succès. Les flèches du clavier permettent également de feuilleter les pages hors des champs de formulaire.

## Personnalisation

Les informations actuelles sont Adele ARMAND et Oliver FEMME, avec une date laissée à `????`. Le lieu est la mairie de Cocody, à Abidjan, en Côte d’Ivoire. Modifier l’objet `INVITATION`, en haut de `script.js`, pour mettre à jour les noms, la date, les horaires, le lieu, l’adresse et la date limite de réponse. La carte et l’itinéraire Google Maps sont générés depuis le lieu et l’adresse; `mapsUrl` peut être renseigné pour imposer un lien particulier. Les numéros du formulaire sont saisis au format local et doivent contenir au moins 10 chiffres.

## Envoi des RSVP vers votre Google Form

Le formulaire du site envoie les réponses directement à votre Google Form, qui est lié à votre Google Sheet. Aucun serveur ni Apps Script n’est nécessaire. Le lien reçu est configuré dans `script.js`, ainsi que les trois identifiants de champ (`entry.1925822244`, `entry.1692144974` et `entry.2133937667`) relevés dans le formulaire public.

Les réponses possibles sont envoyées sous les libellés attendus par Google Forms : `Oui je serais present !` ou `Non je serais pas present !`. Le numéro de téléphone est envoyé uniquement sous forme de chiffres et doit contenir au moins 10 chiffres.

Vérifiez que le Google Form est ouvert aux réponses et que sa destination Google Sheets est bien configurée. Le navigateur transmet le formulaire à Google dans une iframe masquée pour garder l’invité sur le site. Pour des raisons de sécurité du navigateur, le site ne peut pas lire le contenu de la page de confirmation Google inter-domaines; le chargement de la réponse Google sert de confirmation côté site. Vérifiez la feuille avec une réponse réelle avant l’envoi de l’invitation.

Si vous modifiez les questions ou les choix dans Google Forms, actualisez également les identifiants `googleFormEntries` et les libellés de choix dans `script.js`.
