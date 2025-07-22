# B2B Cart Merge Solution

## Problem
When customers add products from the B2B buyer portal, the B2B system creates a new cart and triggers an `on-cart-created` event. The original implementation immediately overwrote the existing cart ID, causing all existing cart items to be lost.

## Solution
We implemented a comprehensive cart merging system that preserves existing cart items when B2B creates a new cart.

## How It Works

### 1. Cart Backup System
- **File**: `core/lib/cart/backup-cart.ts`
- Creates a temporary backup of existing cart items before merging
- Stores backup in an HTTP-only cookie with 1-hour expiration
- Provides recovery mechanism if merge fails

### 2. Cart Merging Logic
- **File**: `core/lib/cart/merge-carts.ts`
- Retrieves existing cart items
- Adds them to the new B2B cart using `addCartLineItem` mutation
- Handles errors gracefully with backup restoration
- Updates cart ID cookie only after successful merge

### 3. B2B Integration
- **Files**: 
  - `core/b2b/use-b2b-cart.ts`
  - `core/components/b2b/use-b2b-cart.ts`
- Listens for `on-cart-created` events from B2B portal
- Triggers cart merging process
- Provides fallback API endpoint for server-side merging

### 4. API Endpoint
- **File**: `core/app/api/b2b/cart-merge/route.ts`
- Server-side endpoint for cart merging
- Can be called directly if client-side merging fails

## Flow Diagram

```
Customer adds item from B2B portal
           ↓
B2B creates new cart
           ↓
on-cart-created event triggered
           ↓
Backup existing cart items
           ↓
Merge items into new B2B cart
           ↓
Success? → Yes → Update cart ID cookie
           ↓
          No → Restore from backup
           ↓
Clear backup and refresh page
```

## Key Features

### ✅ **Data Preservation**
- Existing cart items are never lost
- Backup system provides additional safety
- Graceful error handling

### ✅ **Seamless Integration**
- Works with existing B2B portal
- No changes required to B2B system
- Maintains cart synchronization

### ✅ **Error Recovery**
- Automatic backup restoration on failure
- Fallback API endpoint
- Detailed logging for debugging

### ✅ **Performance**
- Minimal overhead
- Efficient cart operations
- Cache invalidation for fresh data

## Testing

### Test Page
Visit `/test-cart-merge` to see:
- Current session status
- Cart information
- Backup status
- Testing instructions

### Manual Testing Steps
1. Add items to cart from main storefront
2. Open browser console
3. Add product from B2B buyer portal
4. Verify original items are preserved
5. Check console logs for merge progress

## Console Logs

The system provides detailed logging:

```
🔄 B2B Cart Created - Merging existing cart items...
💾 Cart backup created for cart ID: abc123
🔄 Starting cart merge process...
Found 3 items in existing cart
✅ Successfully merged cart items
🗑️ Cart backup cleared
✅ Cart merge successful - updating cookie
```

## Error Handling

### Merge Failure
If cart merging fails:
1. System attempts to restore from backup
2. If restoration fails, keeps existing cart
3. Logs detailed error information
4. Backup remains available for manual recovery

### Backup Expiration
- Backups expire after 1 hour
- Automatic cleanup prevents storage bloat
- Fresh backups created for each merge attempt

## Configuration

No additional configuration required. The system works automatically with existing B2B setup.

## Files Modified/Created

### New Files
- `core/lib/cart/merge-carts.ts` - Main merging logic
- `core/lib/cart/backup-cart.ts` - Backup system
- `core/app/api/b2b/cart-merge/route.ts` - API endpoint
- `core/app/[locale]/(default)/test-cart-merge/page.tsx` - Test page
- `docs/CART_MERGE_SOLUTION.md` - This documentation

### Modified Files
- `core/b2b/use-b2b-cart.ts` - Updated to use merging logic
- `core/components/b2b/use-b2b-cart.ts` - Updated to use merging logic

## Future Enhancements

### Potential Improvements
1. **Smart Merging**: Handle duplicate products by combining quantities
2. **Conflict Resolution**: Handle product option conflicts
3. **Batch Operations**: Optimize for multiple items
4. **Analytics**: Track merge success/failure rates
5. **User Notifications**: Inform users of merge status

### Monitoring
- Console logs provide visibility into merge operations
- Backup system ensures data safety
- API endpoint allows for external monitoring

## Support

If you encounter issues:
1. Check browser console for detailed logs
2. Visit `/test-cart-merge` for debugging information
3. Review backup status in test page
4. Check network tab for API calls

The system is designed to be robust and self-healing, with multiple fallback mechanisms to ensure cart data is never lost. 