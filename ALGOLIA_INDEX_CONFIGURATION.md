# Algolia Index Configuration Guide

## Overview
This guide provides the optimal Algolia index configuration for the Catalyst storefront, following [Algolia's official faceting best practices](https://www.algolia.com/doc/guides/managing-results/refine-results/faceting/).

---

## 🔧 **Index Configuration**

### **1. Searchable Attributes**
Configure these attributes for search relevance:

```json
{
  "searchableAttributes": [
    "unordered(name)",
    "unordered(brand_name)",
    "unordered(description)",
    "unordered(sku)",
    "unordered(categories_without_path)"
  ]
}
```

### **2. Attributes for Faceting**
Configure facets for filtering and display:

```json
{
  "attributesForFaceting": [
    "brand_name",
    "categories_without_path",
    "in_stock",
    "is_visible",
    "inventory_tracking",
    "category_ids",
    "sku"
  ]
}
```

### **3. Facets Configuration**
Set up facets for optimal performance:

```json
{
  "facets": [
    "brand_name",
    "categories_without_path",
    "in_stock",
    "is_visible",
    "inventory_tracking"
  ]
}
```

### **4. Filterable Attributes**
Configure attributes that can be used in filters:

```json
{
  "filterableAttributes": [
    "brand_name",
    "categories_without_path",
    "in_stock",
    "is_visible",
    "inventory_tracking",
    "category_ids",
    "sku"
  ]
}
```

### **5. Ranking Configuration**
Optimize search relevance:

```json
{
  "ranking": [
    "typo",
    "geo",
    "words",
    "filters",
    "proximity",
    "attribute",
    "exact",
    "custom"
  ]
}
```

### **6. Custom Ranking**
Add custom ranking for business logic:

```json
{
  "customRanking": [
    "desc(is_visible)",
    "desc(in_stock)",
    "desc(sales_count)"
  ]
}
```

---

## 📊 **Facet Types & Best Practices**

### **1. Regular Facets**
Single-value attributes for filtering:

- **`brand_name`** - Product brands
- **`in_stock`** - Stock availability (true/false)
- **`is_visible`** - Product visibility (true/false)
- **`inventory_tracking`** - Inventory tracking method

### **2. Hierarchical Facets**
Nested category structure:

- **`categories_without_path`** - Product categories

### **3. Numeric Facets**
For price ranges and numeric filtering:

- **`default_price`** - Product price
- **`inventory`** - Stock quantity

### **4. Filter-Only Facets**
Attributes used for filtering but not displayed:

- **`category_ids`** - Category IDs for filtering
- **`sku`** - Product SKU for exact matching

---

## 🎯 **Data Structure Requirements**

### **Required Fields for Faceting**
Ensure your Algolia records include these fields:

```typescript
interface AlgoliaProductRecord {
  objectID: string;
  name: string;
  brand_name?: string;
  sku?: string;
  url?: string;
  image_url?: string;
  product_images?: Array<{
    description?: string;
    is_thumbnail?: boolean;
    url_thumbnail?: string;
    url?: string;
  }>;
  description?: string;
  is_visible: boolean;
  in_stock: boolean;
  categories_without_path: string[];
  category_ids: number[];
  default_price: number;
  prices: Record<string, number>;
  sales_prices: Record<string, number>;
  retail_prices: Record<string, number>;
  inventory: number;
  inventory_tracking: string;
  sales_count?: number;
  rating?: number;
  review_count?: number;
}
```

---

## ⚙️ **Algolia Dashboard Configuration**

### **Step 1: Create Index**
1. Go to your Algolia dashboard
2. Navigate to **Search** → **Indices**
3. Click **Create Index**
4. Name it `products` (or your preferred name)

### **Step 2: Configure Searchable Attributes**
1. Go to **Configuration** → **Searchable attributes**
2. Add the searchable attributes listed above
3. Set the order of importance

### **Step 3: Configure Facets**
1. Go to **Configuration** → **Facets**
2. Add all facets listed in the configuration
3. Set display settings for each facet

### **Step 4: Configure Filterable Attributes**
1. Go to **Configuration** → **Filterable attributes**
2. Add all filterable attributes
3. Set up any custom filters

### **Step 5: Configure Ranking**
1. Go to **Configuration** → **Ranking and sorting**
2. Set up the ranking configuration
3. Add custom ranking if needed

---

## 🔍 **Facet Filtering Best Practices**

### **1. Facet Filter Structure**
Use the correct format for facet filters:

```typescript
// Single value filter
facetFilters: [['brand_name:Nike']]

// Multiple values (OR logic within facet)
facetFilters: [['brand_name:Nike', 'brand_name:Adidas']]

// Multiple facets (AND logic between facets)
facetFilters: [
  ['brand_name:Nike'],
  ['in_stock:true']
]
```

### **2. Numeric Filtering**
Use numeric filters for ranges:

```typescript
// Price range
numericFilters: ['default_price:10 TO 100']

// Inventory filter
numericFilters: ['inventory > 0']
```

### **3. Combined Filtering**
Combine facet and numeric filters:

```typescript
const searchParams = {
  query: 'shoes',
  facetFilters: [
    ['brand_name:Nike'],
    ['in_stock:true']
  ],
  numericFilters: [
    'default_price:50 TO 200',
    'inventory > 0'
  ]
};
```

---

## 📈 **Performance Optimization**

### **1. Facet Counts**
Limit facet counts for performance:

```typescript
const searchParams = {
  facets: ['brand_name', 'categories_without_path'],
  maxValuesPerFacet: 20, // Limit to top 20 values per facet
  facetFilters: [['is_visible:true']] // Only show visible products
};
```

### **2. Attributes to Retrieve**
Only retrieve needed attributes:

```typescript
const searchParams = {
  attributesToRetrieve: [
    'objectID',
    'name',
    'brand_name',
    'default_price',
    'image_url',
    'url'
  ]
};
```

### **3. Facet Query**
Use facet queries for specific facet values:

```typescript
const searchParams = {
  facetQuery: 'brand_name',
  facetFilters: [['brand_name:Nike']]
};
```

---

## 🧪 **Testing Facets**

### **1. Test Facet Retrieval**
```typescript
// Test basic facet retrieval
const testFacets = await algoliaClient.search([{
  indexName: 'products',
  query: '',
  facets: ['brand_name', 'categories_without_path'],
  hitsPerPage: 0 // Don't retrieve hits, only facets
}]);

console.log('Facets:', testFacets.results[0].facets);
```

### **2. Test Facet Filtering**
```typescript
// Test facet filtering
const testFiltered = await algoliaClient.search([{
  indexName: 'products',
  query: '',
  facetFilters: [['brand_name:Nike']],
  facets: ['brand_name', 'categories_without_path']
}]);

console.log('Filtered results:', testFiltered.results[0].nbHits);
```

### **3. Test Numeric Filtering**
```typescript
// Test numeric filtering
const testNumeric = await algoliaClient.search([{
  indexName: 'products',
  query: '',
  numericFilters: ['default_price:50 TO 100'],
  facets: ['brand_name']
}]);

console.log('Price filtered results:', testNumeric.results[0].nbHits);
```

---

## 🚨 **Common Issues & Solutions**

### **1. Facets Not Appearing**
**Issue:** Facets are empty or not showing
**Solution:** 
- Check `attributesForFaceting` configuration
- Ensure data has the facet attributes
- Verify facet attribute names match exactly

### **2. Facet Counts Incorrect**
**Issue:** Facet counts don't match filtered results
**Solution:**
- Use `facetFilters` to apply current filters to facet counts
- Ensure `maxValuesPerFacet` is set appropriately

### **3. Performance Issues**
**Issue:** Slow facet retrieval
**Solution:**
- Limit `maxValuesPerFacet`
- Use `facetFilters` to reduce facet scope
- Optimize `attributesToRetrieve`

### **4. Hierarchical Facets Not Working**
**Issue:** Category hierarchy not displaying properly
**Solution:**
- Ensure category data is properly structured
- Use hierarchical facet configuration
- Implement proper facet transformation

---

## 📋 **Configuration Checklist**

- [ ] **Index created** with proper name
- [ ] **Searchable attributes** configured
- [ ] **Attributes for faceting** set up
- [ ] **Facets** configured for display
- [ ] **Filterable attributes** configured
- [ ] **Ranking** optimized
- [ ] **Custom ranking** added if needed
- [ ] **Data uploaded** with proper structure
- [ ] **Facet testing** completed
- [ ] **Performance optimization** applied

This configuration ensures optimal faceting performance and follows Algolia's best practices for search and filtering. 