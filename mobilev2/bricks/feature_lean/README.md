# 🧱 feature_lean

> Scaffold 1 feature **lean** (không cần Domain layer) theo pattern flutter_base2.

## 📦 Files sinh ra

```
lib/features/{name}/
├── data/
│   ├── models/
│   │   └── {name}_model.dart           (@freezed + json)
│   └── services/
│       └── {name}_service.dart         (@RestApi Retrofit)
└── presentation/
    ├── pages/
    │   └── {name}_list_page.dart       (HookConsumerWidget)
    └── providers/
        └── {name}_notifier.dart        (Riverpod + BaseNotifier)
```

## 🚀 Cách dùng

```bash
make feature-lean name=product
```

Hoặc thẳng Mason:
```bash
mason make feature_lean --name product
```

→ Sinh `lib/features/product/...`. Sau đó:

```bash
make gen         # build_runner cho freezed/json/retrofit/riverpod
```

## 🎯 Sau khi scaffold

1. **Sửa model** `lib/features/product/data/models/product_model.dart`:
   - Thêm/xoá field theo schema thực tế.
2. **Sửa API endpoints** trong service:
   - Path thật của `GET /products`, `GET /products/{id}`.
   - Thêm endpoints khác (`@POST`, `@PUT`, `@DELETE`).
3. **Customize notifier** nếu cần search/filter/pagination.
4. **Thêm route** trong `lib/routes/config/app_routes.dart`.

## 📝 Convention

- `name` luôn **dạng số ít** (`product`, không phải `products`)
- Mason tự sinh: `ProductModel`, `ProductService`, `ProductNotifier`, `ProductListPage`
