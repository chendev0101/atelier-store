CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"note" text NOT NULL,
	"image" jsonb NOT NULL,
	"context_image" jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_quantity_nonnegative" CHECK ("inventory"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"size" text NOT NULL,
	"badge" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"key_ingredients" text[] DEFAULT '{}'::text[] NOT NULL,
	"how_to_use" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_price_cents_nonnegative" CHECK ("products"."price_cents" >= 0)
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");