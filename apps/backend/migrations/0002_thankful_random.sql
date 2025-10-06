CREATE INDEX "flash_sales_start_date_index" ON "flash_sales" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "flash_sales_end_date_index" ON "flash_sales" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "flash_sales_start_date_end_date_index" ON "flash_sales" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "orders_user_id_index" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_flash_sale_id_index" ON "orders" USING btree ("flash_sale_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_flash_sale_id_index" ON "orders" USING btree ("user_id","flash_sale_id");--> statement-breakpoint
CREATE INDEX "users_email_index" ON "users" USING btree ("email");