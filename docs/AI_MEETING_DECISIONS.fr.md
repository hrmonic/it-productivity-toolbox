# De la note de réunion à une décision traçable : méthode de contrôle avec l’IA

<img src="https://iadujour.fr/assets/brand/android-chrome-512x512.png" width="88" alt="Symbole orange d’IA du Jour" />

*Fiche pratique complémentaire à IT Productivity Toolbox. Exemple entièrement fictif ; aucune mesure de gain ou de précision n’est revendiquée.*

Une synthèse rédigée par une IA peut paraître convaincante et pourtant transformer une hypothèse en décision. Avant d’ajouter un compte rendu à un journal de projet, il faut séparer ce qui a été réellement décidé de ce qui reste à arbitrer.

## Exemple fictif

Au cours d’une réunion consacrée à un portail client, une équipe évoque trois sujets :

- un export CSV demandé par les utilisateurs ;
- une proposition de filtres supplémentaires ;
- une échéance « peut-être fin du mois », sans validation par le responsable.

La mauvaise synthèse serait : « L’équipe a validé l’export CSV, les filtres et une livraison fin de mois. » Elle attribue deux décisions qui n’existent pas.

La bonne approche produit trois objets distincts : une décision confirmée, une proposition à instruire et une date non confirmée.

## Contrôle en cinq étapes

1. **Conserver le matériau source.** Gardez les notes, leur date et les participants autorisés à confirmer les décisions ; ne transférez pas des données confidentielles vers un service non approuvé.
2. **Extraire sans compléter.** Demandez à l’assistant un tableau avec « formulation exacte dans les notes », « statut », « personne responsable explicitement nommée » et « point à confirmer ». Une case inconnue doit rester vide.
3. **Faire valider la décision.** Le responsable confirme le périmètre, l’alternative rejetée et la raison. Une suggestion de l’assistant n’est pas une décision.
4. **Séparer les conséquences.** Enregistrez la décision et son contexte dans *DecisionTrace*. Dans *Scope Radar*, documentez séparément toute demande de changement et ne la marquez acceptée qu’après arbitrage. Dans *StoryGap*, formulez les critères d’acceptation à clarifier sans réécrire silencieusement la story d’origine.
5. **Vérifier avant diffusion.** Comparez le compte rendu à la source ; cherchez décisions inventées, noms ajoutés, délais supposés et engagements que personne n’a validés. Faites relire par une personne habilitée.

## Mini-tableau d’examen

| Question | Réponse attendue avant publication |
| --- | --- |
| Où est la preuve de cette décision ? | Extrait daté des notes ou validation explicite |
| Qui a décidé ? | Une personne ou un groupe explicitement identifié |
| Que reste-t-il à confirmer ? | Des questions ouvertes, pas des engagements |
| Le périmètre change-t-il ? | Une demande distincte à évaluer dans Scope Radar |
| La story est-elle vérifiable ? | Des critères écrits, relus et acceptés par l’équipe |
| Qui diffuse ? | Un responsable humain identifié |

## Prompt de départ

> À partir des notes ci-dessous, distingue : (1) les décisions explicitement prises, (2) les propositions non validées, (3) les questions ouvertes, (4) les actions et responsables seulement s’ils sont cités. Pour chaque ligne, indique l’extrait source. N’invente ni date, ni personne, ni engagement. Signale toute ambiguïté. Ne transforme jamais une hypothèse en décision. Notes : [coller des notes anonymisées].

Le résultat est un brouillon de revue, pas un procès-verbal validé.

## Pour approfondir le cas

La fiche d’[IA du Jour — « Transformer des notes de réunion en compte rendu et plan d’actions »](https://iadujour.fr/cas/compte-rendu-reunion-plan-actions.html) fournit un scénario francophone avec prompt à adapter et précautions sur les données et la relecture. IA du Jour est une publication éditoriale indépendante, également portée par le mainteneur de ce dépôt ; il ne s’agit ni d’une fonctionnalité intégrée à la toolbox, ni d’un test de performance de celle-ci.

---

*Publication : novembre 2026 · Ressource éditoriale et pédagogique · Texte de démonstration à adapter à votre organisation.*
