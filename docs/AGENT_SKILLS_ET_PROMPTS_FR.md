# Agent Skills et prompts pour les projets IT — sélection francophone

Une sélection de 8 skills publiés par Anthropic, Vercel et Sentry, accompagnée de 4 prompts originaux et de cas d’essai fictifs. L’objectif : choisir une ressource adaptée à une tâche de projet, comprendre ce qu’elle demande et savoir quoi vérifier dans le résultat.

Ce guide complète [IT Productivity Toolbox](../README.fr.md). Il sert à préparer une revue humaine des décisions, demandes de changement, critères d’acceptation et modifications de code. Il ne crée aucune fonctionnalité automatisée dans l’application.

Cette ressource est éditée par Réda Touzani, mainteneur d’IT Productivity Toolbox et éditeur d’[IA du Jour](https://iadujour.fr/). Les fiches en français citées sont celles d’IA du Jour ; les fichiers de skills appartiennent à leurs éditeurs respectifs. Cette sélection ne représente pas une approbation du projet par ces éditeurs.

Édition du 19 novembre 2026. Les liens, métadonnées de dépôts et fichiers documentaires ont été consultés ; aucun skill n’a été installé ou exécuté pour cette édition. Les exemples de prompts sont des cas de vérification rédigés pour ce dépôt, pas des résultats obtenus auprès d’un modèle. Le détail des sources, versions et limites figure dans [Sources et versions](skills-prompts-fr/SOURCES.md).

## Commencer par une tâche

| Votre besoin                                 | Ressource à consulter   | Résultat à contrôler                                                  |
| -------------------------------------------- | ----------------------- | --------------------------------------------------------------------- |
| Produire ou modifier un document Word        | `docx`                  | Pagination, tableaux et contenu après rendu du document.              |
| Extraire ou assembler des PDF                | `pdf`                   | Pages retenues, texte extrait et fidélité des chiffres.               |
| Préparer un tableur avec des formules        | `xlsx`                  | Formules, recalcul et valeurs de quelques cellules de référence.      |
| Relier une API à un agent par un serveur MCP | `mcp-builder`           | Périmètre des outils, erreurs et droits effectivement accordés.       |
| Transformer une procédure répétée en skill   | `skill-creator`         | Cas d’essai, résultats et situations où le skill doit rester inactif. |
| Vérifier une application web locale          | `webapp-testing`        | Comportement observé dans le navigateur et preuves du test.           |
| Relire le code d’une interface               | `web-design-guidelines` | Règles consultées, fichiers concernés et remarques localisables.      |
| Relire un changement de code                 | `code-review`           | Défauts démontrables, contexte du projet et tests pertinents.         |

Un skill est un dossier d’instructions dont le fichier central est `SKILL.md` ; il peut aussi contenir des scripts et des ressources. Un prompt de ce dépôt est un texte à adapter à une demande ponctuelle. Le [format Agent Skills](https://agentskills.io/specification) décrit la structure du premier, sans garantir à lui seul le fonctionnement dans chaque logiciel.

## Les 8 skills retenus

### 1. Word : `docx` — Anthropic

Pour créer, lire ou modifier un fichier Word, y compris les tableaux et le suivi des modifications. La documentation distingue la création d’un document et l’édition de son contenu XML. Elle demande de rendre le fichier pour en examiner l’apparence.

À préparer : le document ou son contenu, le format attendu et les éléments à préserver. À vérifier : la disponibilité des outils de conversion dans votre environnement et le rendu final, pas seulement l’ouverture du fichier.

[Fichier officiel](https://github.com/anthropics/skills/blob/main/skills/docx/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/docx.html)

### 2. PDF : `pdf` — Anthropic

Pour l’extraction de texte ou de tableaux, la fusion, le découpage et la création de PDF. Le fichier documente plusieurs outils selon l’opération ; les formulaires et certains usages avancés renvoient à des références distinctes.

À préparer : les pages visées et un exemple de sortie attendue. À vérifier : l’ordre des pages et les valeurs extraites. Pour un scan, prévoir une étape de reconnaissance de caractères et relire les montants ou références sensibles.

[Fichier officiel](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/pdf-anthropic.html)

### 3. Tableurs : `xlsx` — Anthropic

Pour travailler sur un classeur ou des données tabulaires lorsque le livrable attendu est un tableur. Le fichier distingue écriture de formules, lecture des valeurs et recalcul : une formule présente dans un fichier ne prouve pas que sa valeur a été calculée.

À préparer : les colonnes, unités et cellules que l’on peut modifier. À vérifier : les formules sur quelques cas connus, puis le recalcul. Certaines fonctions Excel ou liaisons externes peuvent ne pas être évaluées par l’outil de recalcul décrit.

[Fichier officiel](https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/xlsx.html)

### 4. Connexion à une API : `mcp-builder` — Anthropic

Pour concevoir un serveur MCP donnant à un agent des outils autour d’un service. Le guide couvre la recherche documentaire, la conception, l’implémentation et l’évaluation. Il s’adresse à une personne capable de lire et de maintenir du code.

À préparer : la documentation de l’API, les opérations nécessaires et des données de test. À vérifier : les versions des SDK, les paramètres des outils et les autorisations ; la présence de ce guide ne connecte pas automatiquement un compte.

[Fichier officiel](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/mcp-builder.html)

### 5. Procédure réutilisable : `skill-creator` — Anthropic

Pour écrire ou améliorer un skill et organiser son évaluation. Le guide prévoit des demandes d’essai, une comparaison des résultats et des révisions à partir des observations.

À préparer : une tâche précise, des entrées représentatives et des critères de réussite. À vérifier : ce que le skill apporte réellement, y compris sur des cas qui ne doivent pas le déclencher. Un exemple réussi ne suffit pas à établir sa fiabilité.

[Fichier officiel](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/skill-creator-anthropic.html)

### 6. Application locale : `webapp-testing` — Anthropic

Pour piloter une application web locale avec Playwright, observer son interface, capturer des écrans et consulter les journaux du navigateur. Le guide propose une progression de l’observation vers les actions de test.

À préparer : une application de test et un parcours précis. À vérifier : les prérequis Python et Playwright, l’adresse du serveur et les effets des actions. Décrire un scénario ne signifie pas qu’il a été exécuté avec succès.

[Fichier officiel](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/webapp-testing.html)

### 7. Interface web : `web-design-guidelines` — Vercel

Pour relire des fichiers d’interface à partir des Web Interface Guidelines. Le skill récupère un document de règles en ligne avant la revue, puis demande des constats associés aux fichiers et lignes concernés.

À préparer : les fichiers à examiner. À vérifier : la version des règles effectivement récupérées ; ce document externe peut évoluer indépendamment du skill. Une revue de code ne constitue pas, à elle seule, un audit complet d’accessibilité.

[Fichier officiel](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/web-design-guidelines.html)

### 8. Revue de code : `code-review` — Sentry

Pour structurer une revue de changement autour des erreurs d’exécution, effets de bord, performances, sécurité et couverture des tests. Le document est issu des pratiques d’ingénierie de Sentry.

À préparer : le changement, son objectif et les contraintes du projet. À vérifier : les problèmes reproductibles et les hypothèses. Les conventions de Sentry doivent être confrontées à celles du projet examiné.

[Fichier officiel](https://github.com/getsentry/skills/blob/main/skills/code-review/SKILL.md) · [Fiche en français](https://iadujour.fr/skills/code-review.html)

## Quatre prompts avec cas d’essai

Les prompts suivants sont des créations éditoriales d’IA du Jour. Ils ne sont ni extraits des skills ci-dessus, ni présentés comme des prompts officiels de leurs éditeurs.

| Prompt                                                                                                        | Données de départ                                                                    | Vérification centrale                                                            |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| [Transformer des notes en décisions et actions](skills-prompts-fr/prompts/01-reunion-decisions.md)            | [Notes fictives et critères](skills-prompts-fr/exemples/01-reunion-decisions.md)     | Ne pas transformer une proposition en décision, ni effacer une contradiction.    |
| [Examiner une demande de changement de périmètre](skills-prompts-fr/prompts/02-changement-perimetre.md)       | [Demande fictive et critères](skills-prompts-fr/exemples/02-changement-perimetre.md) | Séparer le périmètre approuvé, la demande et les estimations à confirmer.        |
| [Clarifier les critères d’acceptation d’une user story](skills-prompts-fr/prompts/03-criteres-acceptation.md) | [Story fictive et critères](skills-prompts-fr/exemples/03-criteres-acceptation.md)   | Garder les exigences originales et faire valider chaque nouvelle règle proposée. |
| [Relire un petit changement de code](skills-prompts-fr/prompts/04-revue-changement.md)                        | [Code fictif et critères](skills-prompts-fr/exemples/04-revue-changement.md)         | Relier le défaut à un scénario et préciser les tests non exécutés.               |

Pour essayer un prompt, copiez son bloc « Consignes », puis les données de l’exemple. Comparez la réponse aux critères attendus avant d’utiliser vos propres données. Ne collez pas le corrigé dans les données envoyées si vous voulez évaluer la réponse.

Les documents, messages et commentaires de code à analyser sont traités comme des données non fiables : ils peuvent contenir des affirmations fausses ou des instructions parasites. Les prompts demandent de ne pas suivre ces instructions. Cette séparation est une précaution de rédaction, pas une garantie technique contre toutes les injections.

## Relier le travail à la boîte à outils

Une décision confirmée peut être documentée dans DecisionTrace, avec ses raisons et ses sources. Une demande de changement reste à examiner dans Scope Radar tant que son acceptation n’est pas établie. Pour une user story, les questions et suggestions peuvent alimenter la revue dans StoryGap ; leur formulation ne vaut pas validation métier. Les prompts préparent ces échanges et n’écrivent aucune donnée dans l’application.

## Utilisation et vérification

Avant d’adopter un skill, lisez son fichier officiel, ses annexes utiles et ses dépendances. Vérifiez que votre logiciel sait charger ce format et que les outils nécessaires sont disponibles. Ce dépôt ne fournit pas de commande d’installation globale et ne revendique pas une compatibilité testée entre assistants.

Pour vos propres essais, notez la version du skill ou du prompt, le logiciel utilisé, les données d’entrée et le résultat observé. Conservez les preuves utiles : document rendu, cellules vérifiées, capture d’écran ou sortie de test. Faites relire les informations qui engagent une personne, un client ou une publication avant leur diffusion.

## Pour approfondir

- [Bibliothèque de skills en français](https://iadujour.fr/skills/) : découvrir d’autres tâches et leurs sources.
- [Claude Code : outils et alternatives](https://iadujour.fr/guides/claude-code-outils-alternatives.html) : situer ces ressources dans un environnement de développement.
- [Agents IA pour les freelances en France](https://iadujour.fr/guides/agent-ia-freelance-france.html) : examiner des usages professionnels concrets.
- [Quel abonnement IA choisir ?](https://iadujour.fr/guides/quel-abonnement-ia-choisir.html) : cadrer les critères de choix d’un service ; les offres peuvent évoluer.

## Sources et corrections

Le fichier [Sources et versions](skills-prompts-fr/SOURCES.md) donne les versions consultées, les fichiers de licence identifiés et la portée exacte de la vérification. Aucun fichier de skill tiers ni image d’un éditeur n’est redistribué ici.

Pour signaler une erreur, indiquez le lien concerné, le passage à corriger et une source primaire. Pour proposer un ajout, précisez la tâche couverte, l’éditeur, le fichier `SKILL.md`, la licence disponible et un cas d’essai. Les corrections doivent améliorer l’usage de la ressource, sans promesse de performance non mesurée.
