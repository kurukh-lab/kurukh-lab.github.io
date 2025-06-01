# Comment System Configuration

The comment system in Kurukh Dictionary supports configurable maximum nesting levels through environment variables.

## Configuration

### Maximum Comment Nesting Level

You can configure the maximum nesting level for comments using the `VITE_COMMENT_MAX_LEVEL` environment variable.

**Default Value:** 10  
**Valid Range:** 0-50  
**Type:** Integer

### Setting Up

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and set your desired maximum nesting level:
   ```bash
   VITE_COMMENT_MAX_LEVEL=15
   ```

3. Restart your development server to apply the changes.

### Examples

```bash
# Allow up to 15 levels of nested comments
VITE_COMMENT_MAX_LEVEL=15

# Allow up to 5 levels of nested comments (more compact)
VITE_COMMENT_MAX_LEVEL=5

# No nesting (flat comments only)
VITE_COMMENT_MAX_LEVEL=0
```

### Validation

- If the environment variable is not set, the default value (10) will be used
- If an invalid value is provided (non-numeric, negative, or > 50), the default value will be used and a warning will be logged to the console
- The system ensures the value is within the safe range of 0-50 to prevent performance issues

### Technical Details

The configuration is handled in `/src/config/comments.js` and is imported by:
- `Comment.jsx` - Uses the value as the default `maxLevel` prop
- `CommentThread.jsx` - Passes the configured value to top-level comments

This allows for consistent configuration across the entire comment system while maintaining the ability to override the value per component if needed.
