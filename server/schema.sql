CREATE TABLE IF NOT EXISTS organizations(id uuid PRIMARY KEY,name text NOT NULL,kind text NOT NULL,slug text UNIQUE NOT NULL,theme jsonb NOT NULL DEFAULT '{}',criteria jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS members(organization_id uuid REFERENCES organizations ON DELETE CASCADE,user_id text NOT NULL,role text NOT NULL CHECK(role IN ('owner','editor','reviewer')),PRIMARY KEY(organization_id,user_id));
CREATE TABLE IF NOT EXISTS dossiers(id uuid PRIMARY KEY,organization_id uuid REFERENCES organizations NOT NULL,name text NOT NULL,goal text NOT NULL,state jsonb NOT NULL DEFAULT '{"facts":{},"conflicts":[],"summary":""}',revision integer NOT NULL DEFAULT 1,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS documents(id uuid PRIMARY KEY,dossier_id uuid REFERENCES dossiers ON DELETE CASCADE,name text NOT NULL,sha256 text NOT NULL,path text NOT NULL,bytes integer NOT NULL,extracted text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'queued',error text,created_at timestamptz DEFAULT now(),UNIQUE(dossier_id,sha256));
CREATE TABLE IF NOT EXISTS jobs(id uuid PRIMARY KEY,dossier_id uuid REFERENCES dossiers ON DELETE CASCADE,kind text NOT NULL,payload jsonb NOT NULL DEFAULT '{}',status text NOT NULL DEFAULT 'queued',attempts integer NOT NULL DEFAULT 0,error text,locked_at timestamptz,created_at timestamptz DEFAULT now());
CREATE UNIQUE INDEX IF NOT EXISTS active_analysis ON jobs(dossier_id) WHERE kind='analysis' AND status IN ('queued','running');
CREATE TABLE IF NOT EXISTS versions(id uuid PRIMARY KEY,dossier_id uuid REFERENCES dossiers ON DELETE CASCADE,revision integer NOT NULL,snapshot jsonb NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS attestations(id uuid PRIMARY KEY,version_id uuid REFERENCES versions ON DELETE CASCADE,reference text NOT NULL DEFAULT 'fundroad-2026.1',revoked_at timestamptz,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS invitations(id uuid PRIMARY KEY,organization_id uuid REFERENCES organizations,dossier_id uuid REFERENCES dossiers,email text NOT NULL,role text NOT NULL,token_hash text UNIQUE NOT NULL,expires_at timestamptz NOT NULL,accepted_at timestamptz,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS contributors(dossier_id uuid REFERENCES dossiers ON DELETE CASCADE,user_id text NOT NULL,PRIMARY KEY(dossier_id,user_id));
CREATE TABLE IF NOT EXISTS investors(id uuid PRIMARY KEY,name text NOT NULL,kind text NOT NULL,description text NOT NULL DEFAULT '',sectors text[] NOT NULL DEFAULT '{}',stage text NOT NULL DEFAULT '',geography text NOT NULL DEFAULT '',ticket text NOT NULL DEFAULT '',source_url text NOT NULL,application_url text,organization_id uuid REFERENCES organizations,verified_at timestamptz,active boolean NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS applications(id uuid PRIMARY KEY,dossier_id uuid REFERENCES dossiers ON DELETE CASCADE,version_id uuid REFERENCES versions,investor_id uuid REFERENCES investors,recipient_org uuid REFERENCES organizations,recipient_email text,status text NOT NULL DEFAULT 'prepared',document_ids uuid[] NOT NULL DEFAULT '{}',message text NOT NULL DEFAULT '',revoked_at timestamptz,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS notes(id uuid PRIMARY KEY,application_id uuid REFERENCES applications ON DELETE CASCADE,organization_id uuid REFERENCES organizations,author_id text NOT NULL,body text NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS questions(id uuid PRIMARY KEY,dossier_id uuid REFERENCES dossiers ON DELETE CASCADE,organization_id uuid REFERENCES organizations,body text NOT NULL,answer text,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS audit(id bigserial PRIMARY KEY,user_id text,organization_id uuid,action text NOT NULL,resource_id text,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS usage(id uuid PRIMARY KEY,organization_id uuid REFERENCES organizations,job_id uuid UNIQUE,input_tokens integer NOT NULL DEFAULT 0,output_tokens integer NOT NULL DEFAULT 0,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS offers(id text PRIMARY KEY,label text NOT NULL,price_cents integer NOT NULL,cadence text NOT NULL,quota integer NOT NULL,stripe_price_id text,active boolean NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS entitlements(organization_id uuid PRIMARY KEY REFERENCES organizations,offer_id text REFERENCES offers,status text NOT NULL,customer_id text,subscription_id text,expires_at timestamptz);
CREATE TABLE IF NOT EXISTS referral_programs(id text PRIMARY KEY,kind text NOT NULL,version text NOT NULL,rate_bps integer NOT NULL DEFAULT 0,discount_bps integer NOT NULL DEFAULT 0,months integer NOT NULL DEFAULT 12,hold_days integer NOT NULL DEFAULT 30,active boolean NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS referral_codes(code text PRIMARY KEY,organization_id uuid REFERENCES organizations,program_id text REFERENCES referral_programs,approved boolean NOT NULL DEFAULT false,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS attributions(organization_id uuid PRIMARY KEY REFERENCES organizations,code text REFERENCES referral_codes,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS rewards(id uuid PRIMARY KEY,source_id text UNIQUE NOT NULL,organization_id uuid REFERENCES organizations,buyer_org uuid REFERENCES organizations,kind text NOT NULL,paid_cents integer NOT NULL,amount_cents integer NOT NULL,rate_bps integer NOT NULL,status text NOT NULL DEFAULT 'pending',available_at timestamptz NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS payment_events(id text PRIMARY KEY,created_at timestamptz DEFAULT now());
INSERT INTO offers VALUES ('dossier','Dossier financement',14900,'once',3,NULL,false),('angel','Business Angel',7900,'month',10,NULL,false),('network','Réseau de BA',24900,'month',40,NULL,false),('fund','Fonds',59900,'month',100,NULL,false) ON CONFLICT DO NOTHING;
INSERT INTO referral_programs(id,kind,version,rate_bps,discount_bps) VALUES ('startup','startup','draft-2026-10',0,0),('fund','fund','draft-2026-10',2000,0),('angel','angel','draft-2026-10',2000,0) ON CONFLICT DO NOTHING;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES applications ON DELETE CASCADE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS criteria_snapshot jsonb NOT NULL DEFAULT '{}';

ALTER TABLE contributors ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'editor' CHECK(role IN ('editor','reviewer'));

ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS recipient_org uuid REFERENCES organizations;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS criteria_snapshot jsonb NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS legacy_content(
 id uuid PRIMARY KEY, source_kind text NOT NULL,source_id text NOT NULL,
 source_url text NOT NULL,payload jsonb NOT NULL,source_hash text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','rejected')),
 imported_at timestamptz NOT NULL DEFAULT now(),reviewed_at timestamptz,reviewed_by text,
 UNIQUE(source_kind,source_id)
);
CREATE TABLE IF NOT EXISTS content_pages(
 id uuid PRIMARY KEY,legacy_id uuid UNIQUE REFERENCES legacy_content,
 slug text UNIQUE NOT NULL,title text NOT NULL,excerpt text NOT NULL DEFAULT '',body text NOT NULL,
 source_url text NOT NULL,published_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE attributions ADD COLUMN IF NOT EXISTS terms jsonb;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS terms_version text;
ALTER TABLE attributions ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0;
-- Étape de suivi côté financeur
ALTER TABLE applications ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'new';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo jsonb;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS slug text UNIQUE;
