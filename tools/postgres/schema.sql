CREATE EXTENSION IF NOT EXISTS vector;
/*
Check extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
*/

CREATE TABLE IF NOT EXISTS public.npcs
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    client_id uuid NOT NULL,
    attributes jsonb NOT NULL,
    CONSTRAINT npc_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.informations
(
    npc_id bigint,
    text text COLLATE pg_catalog."default",
    embedding vector,
    CONSTRAINT fk_npc_conversation_ FOREIGN KEY (npc_id)
        REFERENCES public.npcs (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)