PRAGMA foreign_keys=ON;

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

INSERT OR IGNORE INTO site_settings(id,data_json) VALUES(1,'{"company_name_cn":"东莞市泰瑞凯德机械有限公司","company_name_en":"DONGGUAN TYRKAID MACHINERY CO., LTD.","brand_name":"TYRKAID","brand_subtitle":"MACHINERY","logo_url":"","favicon_url":"","hero_kicker":"橡胶 · 塑料 · 硅胶混炼设备","hero_title":"稳定设备，成就高效生产。","hero_subtitle":"Tyrkaid 专注橡胶、塑料及硅胶混炼设备的设计与制造，覆盖实验室研发、中试验证及工业化生产场景。","hero_image_url":"","hero_primary_text":"查看产品中心","hero_primary_link":"/products","hero_secondary_text":"了解 Tyrkaid","hero_secondary_link":"/about","about_page_title":"关于 Tyrkaid","about_page_intro":"来自中国东莞的橡胶、塑料与硅胶加工设备制造商。","about_eyebrow":"DONGGUAN TYRKAID MACHINERY CO., LTD.","about_title":"专注橡胶、塑料与硅胶混炼技术。","about_body":"Tyrkaid 专注于橡胶、塑料及硅胶混炼设备的设计、研发与制造。产品覆盖开放式炼胶机、密炼机、压延设备、切胶设备及相关辅助系统，可满足实验室研发、中试验证与工业化生产等不同场景。\n\n公司位于中国制造业重镇广东东莞。我们将制造经验与工程应用相结合，从设备结构、工艺配置到维护便利性持续优化，重点关注运行稳定性、生产效率、节能表现与长期可维护性。\n\n针对不同材料体系、产能规模和工艺要求，Tyrkaid 可提供针对性的设备配置建议与应用支持，帮助客户从选型到落地更高效地推进项目。","about_image_url":"","contact_page_title":"联系我们","contact_page_intro":"Dongguan Tyrkaid Machinery Co., Ltd.","contact_address":"中国广东省东莞市高埗镇高埗中心中路1号1栋101室","contact_phone":"+86-13806015010","contact_email":"sales@tyrkaid.com","contact_whatsapp":"","contact_support_title":"产品支持","contact_support_body":"您可以在产品中心查看设备分类、具体型号、技术说明及产品图片；公司动态与技术内容请前往公司新闻栏目。","footer_description":"专注橡胶、塑料与硅胶混炼加工设备，为实验研发与工业生产提供稳定、实用、可持续的设备解决方案。","footer_copyright":"Dongguan Tyrkaid Machinery Co., Ltd. 保留所有权利。"}');

INSERT OR IGNORE INTO navigation(id,label,path,sort_order,visible) VALUES
  (1,'首页','/',1,1),
  (2,'产品中心','/products',2,1),
  (3,'关于我们','/about',3,1),
  (4,'公司新闻','/news',4,1),
  (5,'联系我们','/contact',5,1);
