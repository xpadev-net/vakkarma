SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boards (
    id uuid NOT NULL,
    slug text NOT NULL,
    board_name text NOT NULL,
    local_rule text NOT NULL,
    nanashi_name text NOT NULL,
    max_content_length integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    admin_password text NOT NULL,
    default_board_id uuid NOT NULL
);


--
-- Name: responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.responses (
    id uuid NOT NULL,
    thread_id uuid NOT NULL,
    response_number integer NOT NULL,
    author_name text NOT NULL,
    mail text NOT NULL,
    posted_at timestamp with time zone NOT NULL,
    response_content text NOT NULL,
    hash_id text NOT NULL,
    trip text
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threads (
    id uuid NOT NULL,
    title text NOT NULL,
    posted_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    epoch_id bigint NOT NULL,
    board_id uuid NOT NULL
);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: boards boards_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_slug_key UNIQUE (slug);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_id_check; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_id_check CHECK ((id = 1));


--
-- Name: responses responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_pkey PRIMARY KEY (id);


--
-- Name: responses responses_thread_id_response_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_thread_id_response_number_key UNIQUE (thread_id, response_number);


--
-- Name: app_settings app_settings_default_board_id_fkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_default_board_id_fkey FOREIGN KEY (default_board_id) REFERENCES public.boards(id);


--
-- Name: threads threads_board_id_fkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: threads threads_epoch_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_epoch_id_key UNIQUE (epoch_id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: idx_responses_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_responses_thread_id ON public.responses USING btree (thread_id);


--
-- Name: idx_responses_thread_id_response_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_responses_thread_id_response_number ON public.responses USING btree (thread_id, response_number);


--
-- Name: idx_threads_epoch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_epoch_id ON public.threads USING btree (epoch_id);


--
-- Name: idx_threads_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_updated_at ON public.threads USING btree (updated_at DESC);


--
-- Name: idx_threads_board_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_board_updated_at ON public.threads USING btree (board_id, updated_at DESC);


--
-- Name: idx_boards_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_boards_is_default ON public.boards USING btree ((is_default)) WHERE (is_default = true);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20240629000000'),
    ('20251127023000');
