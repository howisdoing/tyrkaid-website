-- Optional: run this once in Cloudflare D1 Console to replace the placeholder category names.
-- Existing products keep their category IDs.
UPDATE categories SET name='Open Mixing Mill', slug='open-mixing-mill', summary='Open mills for rubber and plastic compounding, sheeting, warming and laboratory processing.', sort_order=1 WHERE id=1;
UPDATE categories SET name='Internal Mixer', slug='internal-mixer', summary='Internal mixing and kneading equipment for rubber, polymer and chemical compound preparation.', sort_order=2 WHERE id=2;
UPDATE categories SET name='Double-Cone Calender', slug='double-cone-calender', summary='Calendering equipment for rubber sheets, films, coating and related forming processes.', sort_order=3 WHERE id=3;
INSERT OR IGNORE INTO categories(id,name,slug,summary,sort_order) VALUES(4,'Rubber Mixing Auxiliary Equipment','rubber-mixing-auxiliary-equipment','Auxiliary machines for cutting, cooling, conveying, dust collection and production support.',4);
