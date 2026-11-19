# Agent Skills et prompts pour les projets IT — sélection francophone

> Guide pratique de sélection et de vérification, destiné aux responsables de projet, développeurs, Product Owners et équipes qui expérimentent l’IA. Dernière revue éditoriale : 19 novembre 2026.
>
> Cette ressource complète [IT Productivity Toolbox](../README.fr.md) ; elle ne fait pas partie des fonctionnalités automatisées de l’application. La sélection relie des sources officielles, les notices françaises d’[IA du Jour](https://iadujour.fr/skills/) et des exercices originaux. Les skills citées n’ont pas été exécutées ou certifiées dans le cadre de ce document.

## 1. Distinguer un prompt, une Agent Skill et une action

Un **prompt** est une consigne formulée pour une tâche donnée. Une **Agent Skill** est un ensemble réutilisable d’instructions, généralement organisé autour d’un fichier \`SKILL.md\`, avec éventuellement des scripts et des références. Un **agent connecté à des outils** peut aller plus loin : lire ou modifier des données, exécuter des tests ou appeler une API.

Ces trois objets n’impliquent pas le même niveau de risque. Demander un brouillon n’est pas envoyer un courrier ; préparer une proposition de changement de périmètre n’est pas l’approuver ; demander à un agent de contrôler un dépôt n’est pas lui donner le droit de déployer.

Avant d’adopter une skill, définir dans cet ordre : **la tâche à accomplir, la preuve du résultat, les accès nécessaires, les cas d’arrêt et la personne qui valide**.

## 2. Sept ressources sélectionnées, avec leurs sources

Cette liste est volontairement courte. Elle privilégie un besoin précis, un éditeur identifiable et une documentation que le lecteur peut vérifier lui-même. « Officielle » signifie publiée par l’éditeur cité, pas auditée ou approuvée par le mainteneur de ce dépôt.

| Besoin réel | Skill / référence | Pourquoi la consulter | Notice française et origine |
| --- | --- | --- | --- |
| Concevoir une skill réutilisable | **skill-creator** — Anthropic | Définir le déclenchement, les exemples et les évaluations avant de diffuser des instructions | [IA du Jour — collection Anthropic](https://iadujour.fr/skills/editeur/anthropic.html) · [SKILL.md officiel](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) |
| Connecter un agent à un service | **mcp-builder** — Anthropic | Concevoir un serveur MCP, ses outils, ses erreurs et ses tests ; ne pas confondre construction et simple installation d’un serveur | [Notice française](https://iadujour.fr/skills/mcp-builder.html) · [Dépôt éditeur](https://github.com/anthropics/skills) |
| Vérifier un formulaire web local | **webapp-testing** — Anthropic | Inspecter une interface réellement rendue et tester le parcours, plutôt que supposer qu’un bouton fonctionne parce qu’il apparaît dans le code | [Notice française](https://iadujour.fr/skills/webapp-testing.html) · [Dépôt éditeur](https://github.com/anthropics/skills) |
| Produire ou modifier un document | **docx** — Anthropic | Contrôler la structure et la mise en page d’un document livrable | [Notice française](https://iadujour.fr/skills/docx.html) · [Dépôt éditeur](https://github.com/anthropics/skills) |
| Examiner un PDF | **pdf** — Anthropic | Extraire, produire ou transformer des PDF en contrôlant les limites de la méthode et le résultat | [Notice française](https://iadujour.fr/skills/pdf-anthropic.html) · [Dépôt éditeur](https://github.com/anthropics/skills) |
| Préparer une intégration Stripe | **stripe-apps** — Stripe | Identifier le bon type d’extension, les permissions, les SDK et les documents de référence | [Notice française](https://iadujour.fr/skills/stripe-apps.html) · [Dépôt éditeur](https://github.com/stripe/ai) |
| Étudier les agents de code et alternatives | **Guide de comparaison Claude Code et agents** | Voir des cas rapportés, les limites du résultat et les alternatives avant de choisir un outil | [Guide IA du Jour](https://iadujour.fr/guides/claude-code-outils-alternatives.html) · [Catalogue Agent Skills](https://iadujour.fr/skills/) |

Une notice est un point de départ, non une garantie de compatibilité. Relire le dépôt d’origine, la licence du fichier pertinent et la documentation de la version effectivement utilisée. Pour les exemples d’OpenAI, le dépôt historique \`openai/skills\` indique lui-même qu’il est déprécié : privilégier les ressources maintenues dans [openai/plugins](https://github.com/openai/plugins), sans recopier des commandes anciennes hors de leur contexte.

## 3. Grille de décision avant installation

| Vérification | Question à poser | Preuve à conserver |
| --- | --- | --- |
| Provenance | Le dépôt appartient-il réellement à l’éditeur annoncé ? | URL du dépôt, éditeur, référence de version ou commit |
| Licence | Peut-on utiliser, modifier et redistribuer ces fichiers ? | Licence du dossier/fichier, pas seulement celle du dépôt |
| Contenu exécuté | Des scripts, commandes, accès réseau ou outils seront-ils lancés ? | Liste des fichiers annexes et des outils appelés |
| Données | La skill manipule-t-elle des données de clients, collaborateurs ou projets ? | Règles d’accès, anonymisation, environnement de test |
| Permissions | Quelles actions de lecture ou écriture sont réellement nécessaires ? | Portée limitée des droits et procédure de révocation |
| Validation | Comment reconnaîtra-t-on une réponse fausse ou un résultat incomplet ? | Cas de test, erreurs attendues, contrôle humain |
| Maintenance | La documentation correspond-elle à la version installée ? | Date de vérification et procédure de mise à jour |

Une étoile GitHub, un nom connu ou une mention « officielle » ne remplace aucun de ces contrôles.

## 4. Trois prompts originaux, à adapter

Ces prompts sont fournis pour préparer une revue humaine, avec des exemples fictifs. Aucun ne déclenche automatiquement une action dans IT Productivity Toolbox.

### A. Séparer décision et proposition dans une réunion

\`\`\`text
Rôle : assistant de préparation d'un compte rendu de projet.
Source autorisée : uniquement les notes collées ci-dessous.
Pour chaque sujet, classe le résultat comme :
1) décision explicitement approuvée,
2) proposition non approuvée,
3) question ouverte,
4) information manquante.

Cite un court passage exact et l'identifiant de note pour chaque ligne.
N'invente aucun responsable, délai, accord ou décision.
Si deux sources se contredisent, signale le conflit sans arbitrer.
Produis :
- un résumé de 120 mots maximum,
- un tableau sujet | statut | passage source | responsable explicite | prochaine vérification,
- les questions à faire confirmer avant diffusion.

Notes anonymisées :
[NOTE-1]
[NOTE-2]
\`\`\`

Usage : une décision réellement approuvée peut ensuite être enregistrée dans **DecisionTrace**. Une hypothèse reste une hypothèse. La [fiche IA du Jour sur les comptes rendus](https://iadujour.fr/cas/compte-rendu-reunion-plan-actions.html) propose une variante pour le travail quotidien.

### B. Détecter un changement de périmètre non autorisé

\`\`\`text
Compare le périmètre validé et la demande ci-dessous.
N'approuve rien à la place du chef de projet.

Pour chaque modification proposée :
- cite la ligne du périmètre initial concernée ;
- décris ce qui change, ce qui ne change pas et ce qui reste ambigu ;
- sépare l'effort chiffré par une personne d'une estimation hypothétique ;
- liste les dépendances et les critères de décision ;
- rédige la question précise à poser à la personne autorisée.

Retourne deux sections séparées :
A. Constats étayés par les documents.
B. Hypothèses / informations à confirmer.

Périmètre approuvé : [COLLER]
Demande nouvelle : [COLLER]
\`\`\`

Usage : créer une demande de changement à examiner dans **Scope Radar**, sans modifier silencieusement la baseline.

### C. Relire les critères d'acceptation d'une user story

\`\`\`text
Lis la user story et ses critères tels qu'ils sont écrits.
Distingue :
- les comportements testables explicitement définis ;
- les expressions ambiguës ;
- les exceptions non décrites ;
- les décisions métier qui demandent confirmation.

Pour chaque point, propose une question de clarification,
puis éventuellement une reformulation.
Ne présente jamais une reformulation comme approuvée.
Conserve le texte original à côté des suggestions.

User story : [COLLER]
Contexte confirmé : [COLLER]
\`\`\`

Usage : passer les notes en revue dans **StoryGap** et n’ajouter les critères définitifs qu’après validation.

## 5. Quand choisir plutôt un guide métier français ?

Une équipe qui cherche à **relancer un devis**, **préparer une proposition commerciale** ou **contrôler un impayé** n’a pas forcément besoin d’installer une skill ou un serveur MCP. Commencer par [les usages d’agents IA pour freelances en France](https://iadujour.fr/guides/agent-ia-freelance-france.html), comparer le livrable attendu avec les contraintes réelles, puis décider si un simple prompt suffit.

Pour une équipe de développement, le [guide Claude Code et alternatives](https://iadujour.fr/guides/claude-code-outils-alternatives.html) aide à distinguer les cas rapportés de la validation que votre propre équipe doit réaliser. Pour choisir une skill, le [catalogue francophone des Agent Skills](https://iadujour.fr/skills/) permet d’aller de la tâche au fichier \`SKILL.md\` publié par son éditeur.

## 6. Limites et indépendance

- Les prompts et grilles ci-dessus sont des propositions éditoriales originales, pas une certification de sécurité, de qualité ou d’efficacité.
- Les références citées renvoient à leurs auteurs. Vérifiez leur maintenance, leurs licences et leurs prérequis avant toute installation.
- Le mainteneur de cette boîte à outils édite aussi **IA du Jour**. Les liens vers ce site sont des lectures complémentaires déclarées, et non des validations par un tiers indépendant.
- Aucun programme d'affiliation ni lien retour obligatoire n'est associé à cette sélection.

Pour les questions concrètes autour des décisions, des changements de périmètre ou des user stories, utiliser d’abord la documentation de la boîte à outils, puis les références ci-dessus selon le besoin.

---

*Rédaction et maintenance : Réda Touzani (@hrmonic). Ressource documentaire pour la communauté de projet IT, révisable par pull request.*
