# Copilot Instructions for nest-admin

## 代码规范

### API 返回格式

所有分页列表接口必须使用以下统一格式返回：

- 使用 `data` 作为列表字段名（不要用 `list`）
- 返回格式：`{ data: [], total: number, pageNum: number, pageSize: number }`
