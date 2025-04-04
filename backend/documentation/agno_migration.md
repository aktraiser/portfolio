# Migration vers Agno

## Introduction

[Agno](https://docs.agno.com/introduction/agents) est une solution avancée pour créer des agents intelligents basés sur des LLMs, offrant des fonctionnalités plus riches que notre implémentation actuelle basée sur OpenAI API directement.

## Avantages d'Agno

- **Support natif des outils** : Intégration facile avec différentes sources de données et API
- **Système de connaissances** : Support natif de RAG (Retrieval-Augmented Generation)
- **Agents multiples** : Possibilité de créer des équipes d'agents spécialisés
- **Débogage amélioré** : Mode debug intégré pour observer l'exécution des agents
- **Architecture modulaire** : Plus facile à maintenir et à étendre

## Installation des dépendances requises

```bash
pip install agno duckduckgo-search lancedb
```

## Plan de migration

1. **Phase 1 : Test et exploration**
   - Implémentation parallèle pour comparer les performances
   - Utiliser le fichier `services/agno_example.py` comme point de départ

2. **Phase 2 : Migration partielle**
   - Créer un endpoint `/api/agno_chat` pour tester l'intégration
   - Comparer les performances et la qualité des réponses

3. **Phase 3 : Migration complète**
   - Remplacer complètement le service OpenAI actuel par AgnoService
   - Implémenter des outils supplémentaires (recherche web, connaissances spécifiques)

## Exemple d'implémentation

Un exemple de base se trouve dans `src/services/agno_example.py`. Pour l'essayer :

```bash
cd portfolio/backend
python -m src.services.agno_example
```

## Prochaines étapes

1. Installer les dépendances nécessaires
2. Créer un endpoint de test dans app.py
3. Configurer une base de connaissances avec des documents spécifiques à Lucas Bometon
4. Tester les performances et ajuster les configurations

## Ressources

- [Documentation Agno](https://docs.agno.com/introduction/agents)
- [GitHub Agno](https://github.com/agno-ai/agno)
- [Tutoriels Agno](https://docs.agno.com/introduction/your-first-agent) 