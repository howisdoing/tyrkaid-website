-- 仅用于当前仍是演示数据的数据库。
UPDATE categories SET name='开放式炼胶机', slug='open-mixing-mill', summary='适用于橡胶、塑料及硅胶原料的混炼、塑炼、压片与实验开发。', sort_order=1 WHERE id=1;
UPDATE categories SET name='密炼机', slug='internal-mixer', summary='用于橡胶及高分子材料的混合、捏合与分散，适配实验室及生产应用。', sort_order=2 WHERE id=2;
UPDATE categories SET name='双锥压延机', slug='double-cone-calender', summary='面向胶片、薄膜、涂覆及相关成型工艺的压延加工设备。', sort_order=3 WHERE id=3;
INSERT OR IGNORE INTO categories(id,name,slug,summary,sort_order) VALUES(4,'橡胶混炼辅助设备','rubber-mixing-auxiliary-equipment','覆盖切胶、冷却、输送、除尘及其他生产配套环节。',4);
UPDATE products SET category_id=2,name='工业密炼机',summary='面向橡胶与高分子材料的稳定混炼应用。',description='采用实用、稳定的结构设计，用于橡胶及高分子材料的批次混炼、捏合与分散。',specs_json='{"适用材料":"橡胶及高分子材料","工作方式":"批次混炼","控制方式":"数字化控制界面"}' WHERE id=1 AND model='IM-35';
UPDATE products SET category_id=2,name='实验室小型密炼机',summary='适用于配方研发、样品制备与小批量验证。',description='紧凑型实验设备，适合新配方评估、材料开发与样品制备。',specs_json='{"应用场景":"研发实验室","设备形式":"实验室型"}' WHERE id=2 AND model='LM-05';
UPDATE news SET title='Tyrkaid 产品系列持续升级',excerpt='围绕稳定生产与实际应用需求，持续完善橡胶与高分子材料加工设备。',body='我们持续优化橡胶与高分子材料加工设备的产品体系与应用配置。\n\n欢迎进入产品中心查看当前设备分类、型号与技术资料。' WHERE id=1 AND slug='new-product-line';
