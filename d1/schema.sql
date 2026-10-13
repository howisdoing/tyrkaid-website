PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS categories(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 summary TEXT DEFAULT '',
 sort_order INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 model TEXT NOT NULL,
 name TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 category_id INTEGER NOT NULL,
 summary TEXT DEFAULT '',
 description TEXT DEFAULT '',
 specs_json TEXT DEFAULT '{}',
 images_json TEXT DEFAULT '[]',
 featured INTEGER DEFAULT 0,
 sort_order INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE TABLE IF NOT EXISTS news(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 excerpt TEXT DEFAULT '',
 body TEXT DEFAULT '',
 cover_url TEXT DEFAULT '',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN('draft','published')),
 published_at TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_news_status_date ON news(status,published_at);
INSERT OR IGNORE INTO categories(id,name,slug,summary,sort_order) VALUES
 (1,'Mixing Equipment','mixing-equipment','High-performance machinery for precision material blending.',1),
 (2,'Laboratory & Testing','laboratory-testing','Versatile instruments for research and quality control.',2),
 (3,'Processing Lines','processing-lines','Reliable systems for continuous industrial production.',3);
INSERT OR IGNORE INTO products(id,model,name,slug,category_id,summary,description,specs_json,images_json,featured,sort_order) VALUES
 (1,'IM-35','Industrial Internal Mixer','im-35-internal-mixer',1,'Durable mixing performance for rubber and polymer compounds.','A reliable industrial internal mixer engineered for consistent, repeatable processing.','{"Application":"Rubber & polymer compounds","Operation":"Batch mixing","Control":"Digital control interface"}','[]',1,1),
 (2,'LM-05','Laboratory Mini Mixer','lm-05-laboratory-mixer',2,'Compact mixing for formulation research and sample development.','A compact research mixer designed for evaluation of new formulations and preparation of samples.','{"Application":"R&D laboratory","Format":"Bench-top"}','[]',1,1);
INSERT OR IGNORE INTO news(id,title,slug,excerpt,body,cover_url,status,published_at) VALUES
 (1,'Introducing Our Updated Industrial Equipment Range','new-product-line','Explore our latest approach to reliable engineering and practical equipment design.','We are pleased to share updates across our industrial equipment range.\n\nBrowse the product center for current examples of our solutions.','','published','2026-09-12T00:00:00Z');

-- 可视化网站设置与导航（新增）
CREATE TABLE IF NOT EXISTS site_settings(
 id INTEGER PRIMARY KEY CHECK(id=1),
 data_json TEXT NOT NULL DEFAULT '{}',
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS navigation(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 label TEXT NOT NULL,
 path TEXT NOT NULL,
 sort_order INTEGER DEFAULT 0,
 visible INTEGER NOT NULL DEFAULT 1,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO site_settings(id,data_json) VALUES(1,'{}');
INSERT OR IGNORE INTO navigation(id,label,path,sort_order,visible) VALUES
 (1,'首页','/',1,1),(2,'产品中心','/products',2,1),(3,'关于我们','/about',3,1),(4,'公司新闻','/news',4,1),(5,'联系我们','/contact',5,1);
