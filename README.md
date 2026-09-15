# Project for Certification Azure AI Cloud Developer Associate

## Description
The player must meet a people in the city but he hasn't forget all informations except, the hour and one other random information of the people.
The player must find the person before the meet begin.
The player must interogate unknown people for get the necessary informations.
Each NPC contains AI response with memory & behavior.

## Requirements

### Windows
- Node v24.20.0 minimum
- Azure CLI

### Linux
- Docker
- Azure CLI

## Installation

### Windows
Configure environment variables create ```.env``` from ```.env.example``` and fill them.

Install npm packages
```shell
npm i
```

Run application
```shell
npm run dev
```

### Linux
Configure environment variables create ```.env``` from ```.env.example``` and fill them.

Pull Node image
```shell
docker pull node
```

Go in the project folder
```shell
cd aicity
```

Run Node image
```shell
docker run --rm -it -w /app -v .:/app -p 4000:4000 -p 5173:5173 node bash
```

Install npm packages
```shell
npm i
```

Run application
```shell
npm run dev
```

## Deploy Function App
Goto in folder ```functions```
```shell
cd ./functions
```
Publish the functionapp
```shell
func azure functionapp publish <functionapp-name> -b remote
```

## Local postgres
Use pgvector image (postgres with vector extension)
```shell
docker run --rm --name aicity-db -e POSTGRES_PASSWORD=1234 -v .:/var/lib/postgresql -p5432:5432 -d pgvector
```

## Warnings
- Run Node Docker image from Windows cause "node --watch" not works
- Azure CLI in WSL "az login" not work

### Functions
- There is a lot of things

## Exemple city prompt
```
Décris-moi un ville fictive avec un nom fictif. Voici les informations nécessaires.

- Elle se trouve sur Terre
- Elle à notre époque 2026
- Il y a beaucoup de quartier très différents.
- Elle est réaliste et crédible
- Il y a un secret

Ta réponse doit être au format texte brute.
```

## Architecture

## All Azure Services
- Container Apps
- Web Apps
- Kubernetes Service
- Cosoms DB
- PostgreSQL
- Redis
- Service Bus
- Event Grid
- Functions
- OpenTelemetry