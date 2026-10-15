<p align="center">
  <img src="docs/assets/toolbox-hero.svg" alt="IT Productivity Toolbox — DecisionTrace, Scope Radar et StoryGap : outils de productivité connectés pour les équipes IT" width="100%">
</p>

<h1 align="center">IT Productivity Toolbox</h1>

<p align="center">
  <strong>Une suite open source d'outils de productivité pour les chefs de projet IT, Scrum Masters, Product Owners et Product Builders.</strong><br>
  Préserver les décisions. Maîtriser les changements de périmètre. Clarifier les user stories.
</p>

<p align="center">
  <a href="README.md">Read in English</a> ·
  <a href="#les-trois-outils">Découvrir les outils</a> ·
  <a href="#comment-les-outils-se-complètent">Traçabilité</a> ·
  <a href="#feuille-de-route">Feuille de route</a> ·
  <a href="#questions-fréquentes">FAQ</a>
</p>

<p align="center">
  <a href="LICENSE"><img alt="Licence Apache 2.0" src="https://img.shields.io/badge/licence-Apache%202.0-64748b"></a>
  <img alt="État du projet : conception et planification" src="https://img.shields.io/badge/statut-conception-475569">
  <img alt="Langues prévues : français et anglais" src="https://img.shields.io/badge/langues-FR%20%2F%20EN-475569">
</p>

> **État du projet — octobre 2026 :** IT Productivity Toolbox est en **phase de conception et de planification**. Les trois outils décrits ci-dessous correspondent aux fonctionnalités **envisagées**, et non à une application actuellement utilisable. Le dépôt contient pour le moment la présentation du projet et sa licence Apache 2.0. Le code exécutable, une démonstration, les instructions d'installation et les résultats de tests seront publiés lorsqu'ils seront disponibles et vérifiés.

## Présentation

**IT Productivity Toolbox** est un projet de suite web composée de micro-applications spécialisées, utilisables indépendamment et potentiellement reliées entre elles. Elle vise trois difficultés récurrentes des projets numériques : perdre le contexte des décisions, mal suivre l'évolution du périmètre et démarrer le développement avec des user stories ambiguës.

| | |
| --- | --- |
| **Public cible** | Chefs de projet IT, Scrum Masters, Product Owners, Product Builders et équipes de delivery |
| **Objectif** | Améliorer la traçabilité des décisions, la visibilité des changements et la clarté des besoins |
| **Modules initiaux** | DecisionTrace, Scope Radar, StoryGap |
| **Approche produit** | Outils ciblés, résultats explicables, liens transversaux facultatifs |
| **Expérience envisagée** | Application web, stockage local, sans compte obligatoire, français et anglais |
| **Disponibilité** | Concept et feuille de route ; application non encore publiée |

### Pourquoi une nouvelle toolbox ?

Les plateformes de gestion de projet généralistes sont puissantes, mais certaines difficultés du quotidien restent pénibles à traiter rapidement :

- **« Pourquoi cette décision a-t-elle été prise ? »** Les justifications et compromis se perdent dans les réunions, messageries et documents.
- **« Qu'est-ce qui a changé depuis l'accord initial ? »** Les demandes s'accumulent sans comparaison claire avec le périmètre de référence.
- **« Cette user story est-elle suffisamment claire ? »** Les critères d'acceptation peuvent être incomplets ou impossibles à vérifier.

L'objectif **n'est pas de remplacer Jira, Trello, Notion ou les outils de planification agile**, mais de proposer des compléments spécialisés pour mieux analyser, documenter et expliquer le travail.

## Les trois outils

### 01 / DecisionTrace — Journal et mémoire des décisions projet

**Conserver les décisions, mais surtout leurs raisons.**

DecisionTrace vise à créer un registre consultable de décisions techniques, fonctionnelles et produit.

**Fonctionnalités prévues**

- Consigner une décision, son contexte, son responsable, les parties prenantes et la date.
- Documenter les alternatives, les compromis, les hypothèses et les justifications.
- Suivre les statuts et conserver un historique des révisions significatives.
- Relier les décisions aux changements de périmètre et aux user stories.
- Rechercher, filtrer et exporter le journal des décisions.

**Exemple :** une équipe choisit une nouvelle solution de recherche. Plusieurs semaines après, elle retrouve les arguments ayant motivé le choix avant d'envisager une modification.

**Profils concernés :** chefs de projet IT · Product Owners · responsables techniques.

### 02 / Scope Radar — Suivi de dérive du périmètre et analyse des changements

**Voir précisément ce qui a changé depuis le périmètre accepté.**

Scope Radar vise à rendre les évolutions du projet plus visibles, sans inventer des estimations manquantes.

**Fonctionnalités prévues**

- Définir et versionner un périmètre de référence, ou *baseline*.
- Enregistrer les demandes de changement proposées, acceptées ou refusées.
- Comparer le périmètre initial au périmètre actuellement accepté.
- Identifier les livrables, dépendances et risques concernés.
- Tester des scénarios hypothétiques sans modifier les données validées.
- Exporter un registre des changements et une synthèse des écarts.

**Principe fondamental :** les impacts sur la charge ou les délais seront calculés uniquement à partir de données renseignées et compatibles. Les informations manquantes seront signalées clairement.

**Profils concernés :** chefs de projet IT · Product Owners · responsables delivery.

### 03 / StoryGap — Analyse des user stories et critères d'acceptation

**Clarifier les besoins avant de lancer le développement.**

StoryGap vise à aider les équipes produit à détecter les formulations ambiguës, les cas particuliers oubliés et les critères d'acceptation insuffisamment vérifiables.

**Fonctionnalités prévues**

- Rédiger ou coller des user stories.
- Repérer des ambiguïtés, des informations manquantes et des questions ouvertes.
- Suggérer des vérifications sur les règles métier et cas limites.
- Accompagner la rédaction de scénarios testables au format Given / When / Then.
- Permettre d'accepter, de modifier ou d'ignorer chaque suggestion.
- Comparer les versions et exporter des stories clarifiées.

**Principe fondamental :** l'outil doit poser des questions lorsque les règles métier ne sont pas connues, et non inventer des réponses. Le premier moteur d'analyse est envisagé sous forme de règles explicables, sans service d'IA obligatoire.

**Profils concernés :** Product Owners · Scrum Masters · Product Builders · développeurs.

## Comment les outils se complètent

Chaque outil doit apporter de la valeur indépendamment. Une fonction de **traçabilité projet** permettra également de relier les informations concernées.

\`\`\`mermaid
flowchart LR
    D["DecisionTrace<br/>Pourquoi cette décision ?"]
    S["Scope Radar<br/>Qu'est-ce qui change ?"]
    G["StoryGap<br/>Que faut-il développer ?"]
    D -->|"Décision à l'origine du changement"| S
    S -->|"Changement impactant la story"| G
    G -.->|"Retrouver la justification"| D
\`\`\`

**Exemple :** une décision produit entraîne une demande de changement qui touche deux user stories. Les liens prévus permettront de remonter de la story à la décision initiale, sans gérer trois registres totalement déconnectés.

Les liens de causalité seront **explicites et validés par l'utilisateur**. Une ressemblance entre deux textes ne suffira pas à établir une relation.

## Principes de conception

| Principe | Comportement recherché |
| --- | --- |
| **Prise en main rapide** | Des outils accessibles sans création de compte obligatoire |
| **Maîtrise des données** | Stockage local avec sauvegarde et export prévus |
| **Résultats explicables** | Calculs, hypothèses et alertes compréhensibles |
| **Respect des références** | Aucune modification silencieuse des décisions ou baselines validées |
| **Bilinguisme** | Interfaces et documentation en français et en anglais |
| **Interopérabilité interne** | Possibilité de lier les décisions, changements et stories |
| **Accessibilité** | Interfaces responsive, navigation clavier et retours accessibles |

Ces points constituent des **objectifs de conception**, et non des fonctionnalités déjà validées ou auditées.

## Architecture technique envisagée

La direction technique initiale repose sur **React, TypeScript et Vite**, avec séparation des domaines métier et persistance dans le navigateur via **IndexedDB / Dexie**. Sont également envisagés **Zod** pour la validation, **react-i18next** pour la traduction, **Vitest** pour les tests unitaires et **Playwright** pour les tests de bout en bout.

Ces choix seront confirmés durant le développement. Le projet ne revendique à ce jour ni déploiement en production, ni couverture de tests, ni audit de sécurité.

La première version doit rester utilisable sans API payante ni fournisseur d'IA distant obligatoire. Si des fonctionnalités d'IA sont proposées ultérieurement, tout transfert de contenus projet vers un service tiers devra être contrôlé et accepté par l'utilisateur.

## Feuille de route

- [ ] **Fondations** — Interface commune, espaces projet, stockage et localisation FR/EN
- [ ] **DecisionTrace** — Décisions, alternatives, historique, recherche et export
- [ ] **Scope Radar** — Baselines, demandes de changement, comparaisons et simulations
- [ ] **StoryGap** — Analyse par règles, suggestions modifiables et critères d'acceptation
- [ ] **Traçabilité** — Relations entre décisions, changements et user stories
- [ ] **Qualité et publication** — Tests automatisés, accessibilité, documentation et démonstration vérifiée

Cette feuille de route représente des intentions, sans dates de livraison promises.

## Démarrer avec le projet

**L'application n'est pas encore publiée.** Il n'existe donc pas de commande d'installation ou de démonstration publique à utiliser pour l'instant.

Vous pouvez néanmoins :

1. Consulter la [présentation](#présentation) et [les outils envisagés](#les-trois-outils).
2. Parcourir la [feuille de route](#feuille-de-route).
3. [Ouvrir une issue](https://github.com/hrmonic/it-productivity-toolbox/issues) pour signaler un besoin métier concret.
4. Suivre le dépôt pour les prochaines étapes.

Les instructions d'installation seront ajoutées lorsqu'une première version exécutable aura été produite.

## Questions fréquentes

### Qu'est-ce qu'IT Productivity Toolbox ?

C'est un projet open source de micro-outils de productivité destinés aux chefs de projet IT, Scrum Masters, Product Owners et Product Builders. Ses premiers modules se concentrent sur les décisions projet, les changements de périmètre et la clarification des user stories.

### Comment conserver la justification des décisions d'un projet IT ?

Le module **DecisionTrace** est conçu pour rassembler les décisions, leurs raisons, les alternatives envisagées et leurs liens avec d'autres éléments du projet.

### Comment suivre les dérives de périmètre d'un projet ?

Le module **Scope Radar** doit permettre de comparer une baseline acceptée avec les changements validés, puis d'identifier les écarts chiffrables, les dépendances et les risques documentés.

### Comment améliorer une user story ambiguë ?

Le module **StoryGap** doit analyser la formulation et les critères d'acceptation, mettre en évidence les questions sans réponse et proposer des améliorations que l'utilisateur pourra valider.

### Les outils nécessiteront-ils un compte ou une IA payante ?

La première version est conçue pour fonctionner en priorité en local, sans compte obligatoire ni API d'IA payante. Ce fonctionnement sera confirmé lors de sa réalisation.

### Une version anglaise est-elle prévue ?

Oui. Le produit et la documentation sont prévus en français et en anglais. La présentation anglaise est disponible dans [README.md](README.md).

### Peut-on déjà utiliser la toolbox ?

**Pas encore.** Le dépôt publie actuellement la vision produit et la licence. Les versions utilisables seront clairement identifiées lorsqu'elles seront disponibles.

## Contribution et retours d'expérience

Les retours les plus précieux à ce stade sont des **exemples concrets de tâches répétitives, frustrantes ou mal outillées dans les métiers IT**.

Pour proposer une idée dans les [GitHub Issues](https://github.com/hrmonic/it-productivity-toolbox/issues), préciser de préférence :

- Le métier et la situation rencontrée.
- La méthode de travail actuelle et ses difficultés.
- Le résultat attendu d'un outil utile.
- Les contraintes métier, de confidentialité ou d'accessibilité.

Un guide de contribution au code sera ajouté lors de la publication de l'implémentation.

## Licence

Projet placé sous **[Apache License, Version 2.0](LICENSE)**. Cette licence autorise notamment l'utilisation, la modification et la redistribution, y compris commerciales, dans les conditions qu'elle définit.

## Auteur et maintenance

Créé et maintenu par **[Réda Touzani (@hrmonic)](https://github.com/hrmonic)**, avec une approche associant compréhension métier, conception produit et ingénierie logicielle.

---

**Moins de contexte perdu. Moins de surprises. Des besoins plus clairs.**

[Retour en haut](#it-productivity-toolbox) · [English version](README.md)
