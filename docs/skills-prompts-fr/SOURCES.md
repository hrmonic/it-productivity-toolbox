# Sources et portée de la vérification

Édition : 19 novembre 2026.

Responsabilité éditoriale : Réda Touzani / [IA du Jour](https://iadujour.fr/). Les notices et prompts du dépôt sont des textes originaux. Les liens vers IA du Jour sont des références du même éditeur ; ils sont distingués des sources primaires des skills.

## Ce qui a été vérifié

- Les trois dépôts GitHub sélectionnés sont publics, non archivés et non désactivés selon leurs métadonnées consultées le 19 novembre 2026.
- Les huit chemins `SKILL.md` existent dans les révisions ci-dessous. Leur description et les sections nécessaires aux notices ont été consultées.
- Les en-têtes des six fichiers `LICENSE.txt` d’Anthropic identifient Apache License 2.0. Le fichier `LICENSE` de Sentry a été consulté. Pour Vercel, la déclaration du README a été comparée à l’arbre de fichiers du dépôt.
- Les URLs IA du Jour ont été identifiées dans les pages du site et les résultats de recherche. Certaines ouvertures directes ont été limitées par une réponse 429 ; le détail est indiqué plus bas.

Ce travail est une vérification documentaire. Aucun skill, script tiers, serveur MCP ou commande d’installation n’a été exécuté. Les dépendances transitives et tous les fichiers annexes n’ont pas été audités. Aucun test de compatibilité entre logiciels, audit de sécurité ou mesure de performance n’est revendiqué.

Le contexte de la boîte à outils a été lu dans son [README français](https://github.com/hrmonic/it-productivity-toolbox/blob/6186bdd4ed14efe6705386f7212101a4b6cbbed3/README.fr.md) et dans le [guide préexistant](https://github.com/hrmonic/it-productivity-toolbox/blob/6186bdd4ed14efe6705386f7212101a4b6cbbed3/docs/AGENT_SKILLS_ET_PROMPTS_FR.md), tous deux publics. Cette révision documentaire ne modifie aucun fichier applicatif.

Les cas d’essai de `exemples/` ont été rédigés avec des données fictives et des critères attendus. Ils n’ont pas fait l’objet d’une campagne d’exécution auprès de modèles. Leur présence permet de commencer cette évaluation ; elle n’en constitue pas le résultat.

## Révisions des dépôts

Les liens du guide principal suivent la branche `main` pour faciliter la découverte. Les liens ci-dessous fixent le contenu consulté à une révision précise. La date du commit est celle de la révision du dépôt, pas nécessairement celle de la dernière modification de chaque skill.

| Éditeur   | Dépôt                                                                   | Révision consultée                                                                                                                        | Date du commit de cette révision, UTC |
| --------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Anthropic | [anthropics/skills](https://github.com/anthropics/skills)               | [`e4bb5d960d87126ff3b3a8af1a104b7db67560ba`](https://github.com/anthropics/skills/commit/e4bb5d960d87126ff3b3a8af1a104b7db67560ba)        | 16 novembre 2026                      |
| Vercel    | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | [`1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`](https://github.com/vercel-labs/agent-skills/commit/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62) | 27 octobre 2026                       |
| Sentry    | [getsentry/skills](https://github.com/getsentry/skills)                 | [`a582c51ee29d0f35e6ac321340796f77d43da733`](https://github.com/getsentry/skills/commit/a582c51ee29d0f35e6ac321340796f77d43da733)         | 14 novembre 2026                      |

## Fichiers primaires et licences

Les indications de licence ci-dessous décrivent les éléments retrouvés à la date de consultation. Elles ne remplacent pas les conditions applicables chez chaque éditeur. Ce dépôt ne redistribue aucun des fichiers `SKILL.md` mentionnés.

| Skill                          | Fichier consulté à la révision fixée                                                                                                        | Élément de licence retrouvé                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anthropic `docx`               | [SKILL.md](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/docx/SKILL.md)                         | [LICENSE.txt](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/docx/LICENSE.txt) : en-tête Apache License 2.0.                                                                                                                                                               |
| Anthropic `pdf`                | [SKILL.md](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/pdf/SKILL.md)                          | [LICENSE.txt](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/pdf/LICENSE.txt) : en-tête Apache License 2.0.                                                                                                                                                                |
| Anthropic `xlsx`               | [SKILL.md](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/xlsx/SKILL.md)                         | [LICENSE.txt](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/xlsx/LICENSE.txt) : en-tête Apache License 2.0.                                                                                                                                                               |
| Anthropic `mcp-builder`        | [SKILL.md](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/mcp-builder/SKILL.md)                  | [LICENSE.txt](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/mcp-builder/LICENSE.txt) : en-tête Apache License 2.0.                                                                                                                                                        |
| Anthropic `skill-creator`      | [SKILL.md](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/skill-creator/SKILL.md)                | [LICENSE.txt](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/skill-creator/LICENSE.txt) : en-tête Apache License 2.0.                                                                                                                                                      |
| Anthropic `webapp-testing`     | [SKILL.md](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/SKILL.md)               | [LICENSE.txt](https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/LICENSE.txt) : en-tête Apache License 2.0.                                                                                                                                                     |
| Vercel `web-design-guidelines` | [SKILL.md](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines/SKILL.md) | « MIT » déclaré dans la section License du [README](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/README.md). Aucun fichier portant un nom de licence, notice ou copyright n’a été identifié dans l’arbre récursif consulté ; aucun texte de licence n’est reproduit ici. |
| Sentry `code-review`           | [SKILL.md](https://github.com/getsentry/skills/blob/a582c51ee29d0f35e6ac321340796f77d43da733/skills/code-review/SKILL.md)                   | [LICENSE](https://github.com/getsentry/skills/blob/a582c51ee29d0f35e6ac321340796f77d43da733/LICENSE) à la racine : Apache License 2.0, mention de Functional Software, Inc. dba Sentry.                                                                                                                               |

Le skill Vercel pointe vers un document de règles distinct : [web-interface-guidelines/command.md](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md). La présence de cette dépendance est constatée dans le `SKILL.md` ; son contenu, sa version et sa licence n’ont pas été audités dans cette édition. Fixer le commit du skill ne fixe donc pas automatiquement ces règles récupérées à distance.

La description générale du format s’appuie sur la [spécification Agent Skills](https://agentskills.io/specification), consultée le 19 novembre 2026 : fichier `SKILL.md`, métadonnées et ressources facultatives. Aucune compatibilité universelle n’est déduite de ce format.

## Fiches IA du Jour associées

Ces pages fournissent un accompagnement en français ; les versions décrites peuvent être antérieures aux commits retenus ici. En cas de divergence, revenir au fichier primaire de la version utilisée.

| Skill                   | Fiche correspondante                                                                                          | Observation du 19 novembre 2026                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docx`                  | [Créer et modifier des documents Word](https://iadujour.fr/skills/docx.html)                                  | Titre, éditeur et URL retrouvés dans les résultats de recherche ; ouverture directe limitée par une réponse 429.                                                                                           |
| `pdf`                   | [Tout faire avec des PDF](https://iadujour.fr/skills/pdf-anthropic.html)                                      | Page ouverte ; attribution Anthropic vérifiée.                                                                                                                                                             |
| `xlsx`                  | [Créer et analyser des tableurs Excel](https://iadujour.fr/skills/xlsx.html)                                  | Titre, éditeur et URL retrouvés dans les résultats de recherche ; ouverture directe limitée par une réponse 429.                                                                                           |
| `mcp-builder`           | [Créer des serveurs MCP](https://iadujour.fr/skills/mcp-builder.html)                                         | Page ouverte ; attribution Anthropic vérifiée.                                                                                                                                                             |
| `skill-creator`         | [Créer et évaluer ses propres skills](https://iadujour.fr/skills/skill-creator-anthropic.html)                | URL retrouvée dans les résultats de recherche et un lien interne ; ouverture directe limitée par une réponse 429. Le chemin sans suffixe « anthropic » correspond à un autre éditeur et n’est pas utilisé. |
| `webapp-testing`        | [Tester une application web locale avec Playwright](https://iadujour.fr/skills/webapp-testing.html)           | Page ouverte ; attribution Anthropic vérifiée.                                                                                                                                                             |
| `web-design-guidelines` | [Audit d’interface selon les Web Interface Guidelines](https://iadujour.fr/skills/web-design-guidelines.html) | Page ouverte ; attribution Vercel vérifiée.                                                                                                                                                                |
| `code-review`           | [Revue de code selon les pratiques Sentry](https://iadujour.fr/skills/code-review.html)                       | Page ouverte ; attribution Sentry vérifiée.                                                                                                                                                                |

Autres pages consultées :

- [Bibliothèque de skills](https://iadujour.fr/skills/).
- [Guide Claude Code et alternatives](https://iadujour.fr/guides/claude-code-outils-alternatives.html).
- [Guide agents IA pour freelances](https://iadujour.fr/guides/agent-ia-freelance-france.html).
- [Guide de choix d’un abonnement IA](https://iadujour.fr/guides/quel-abonnement-ia-choisir.html), ouvert depuis la navigation du guide Claude Code après un échec d’ouverture directe.

Les informations de prix, de disponibilité commerciale et les compteurs du site n’ont pas été repris dans ce dépôt.

## Réviser cette sélection

Lors d’une mise à jour, contrôler l’existence du fichier, le dépôt d’origine, la révision, la licence disponible et les dépendances externes importantes. Relire ensuite la notice et vérifier que le lien français désigne le bon éditeur. Dater la nouvelle vérification et conserver une distinction entre documentation lue et essais réellement exécutés.
