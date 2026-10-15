# TYRKAID Technical Specs Matrix Editor

技术参数已经改成真正的二维表格。

- Excel / WPS / Google Sheets 粘贴几行几列，就保留几行几列
- 不再把第 2、3、4…列合并成“参数值”
- 可以新增行、删除行
- 可以新增列、删除列
- 后台宽表格支持横向滚动，所有列都能看到
- 前台产品详情页按相同二维表格完整显示
- 旧的两列参数 JSON 仍兼容，会自动显示成两列
- 不需要新增 D1 字段，继续使用 products.specs_json
