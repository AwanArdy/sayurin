-- Guard stok tidak pernah negatif via trigger.
-- D1 tidak mengizinkan recreate tabel yang direferensikan FK,
-- jadi guard diwujudkan sebagai BEFORE UPDATE/INSERT trigger
-- (RAISE(ABORT) membuat statement & batch gagal -> rollback).
--> statement-breakpoint
CREATE TRIGGER "products_stock_non_negative_update"
BEFORE UPDATE OF "stock" ON "products"
FOR EACH ROW
WHEN NEW."stock" < 0
BEGIN
	SELECT RAISE(ABORT, 'CHECK constraint failed: products_stock_non_negative');
END;
--> statement-breakpoint
CREATE TRIGGER "products_stock_non_negative_insert"
BEFORE INSERT ON "products"
FOR EACH ROW
WHEN NEW."stock" < 0
BEGIN
	SELECT RAISE(ABORT, 'CHECK constraint failed: products_stock_non_negative');
END;